const Car = require('../models/Car');

exports.chatAI = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API Key is not configured' });
    }

    // Load available cars from database for context
    const cars = await Car.find();
    const carsContext = cars.map(car => {
      return `- ID: ${car._id}\n  Name: ${car.brand} ${car.model}\n  Price: ${car.pricePerDay} VNĐ/day\n  Location: ${car.location || 'Premium Hub'}\n  Type: ${car.type}\n  Seats: ${car.seats}\n  Transmission: ${car.transmission}\n  Fuel Type: ${car.fuelType}\n  Rating: ${car.rating || 5} stars\n  Image: ${car.imageUrl || ''}`;
    }).join('\n\n');

    const systemPrompt = `You are the AI Assistant for LuxeRide - a premium luxury car rental service.
Your tasks:
1. Answer customer questions politely, elegantly, and professionally in English.
2. If the customer wants to find a car, rent a car, or needs recommendations, select 1-3 most matching cars from the system car list provided below. Only suggest cars from this list.
3. The response MUST be returned as a single JSON object with the exact structure below:
{
  "replyText": "Your reply message to the customer (in English)",
  "suggestedCars": [
    {
      "id": "mongodb car id",
      "carName": "Full car brand and model (e.g. Bentley Continental)",
      "image": "imageUrl from database",
      "price": daily price (number, e.g. 5000000),
      "rating": rating (number, e.g. 4.8),
      "location": "location of the car",
      "reason": "Brief reason why this car is recommended for the user"
    }
  ]
}

List of available cars in the database:
${carsContext}`;

    // Convert chatHistory to Gemini API contents
    const contents = [];
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        let text = '';
        if (typeof msg.content === 'string') {
          text = msg.content;
        } else if (msg.content && msg.content.replyText) {
          text = msg.content.replyText;
        }
        if (text) {
          contents.push({
            role,
            parts: [{ text }]
          });
        }
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const resData = await response.json();
    const generatedText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Gemini API returned empty response');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedText);
    } catch (parseErr) {
      console.warn('Unable to parse JSON from AI, wrapping response:', parseErr.message);
      parsedResponse = {
        replyText: generatedText,
        suggestedCars: []
      };
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('AI assistant error:', error);
    res.status(500).json({ 
      replyText: 'Sorry, I am having trouble connecting to the AI system. Please try again later!',
      suggestedCars: []
    });
  }
};
