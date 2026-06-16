const mongoose = require('mongoose');
// Chú ý: Cần trỏ đúng vào database 'car-rental'
const uri = 'mongodb+srv://tranchan:1t2r3a4a5n6f@cluster0.8dmrtdn.mongodb.net/car-rental';

// Khai báo Schema ngắn gọn để có thể đọc được dữ liệu
const carSchema = new mongoose.Schema({ brand: String, model: String });
const Car = mongoose.model('Car', carSchema);

async function run() {
    try {
        console.log("⏳ Đang thử kết nối tới MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Kết nối thành công!");

        console.log("🔍 Đang lấy danh sách các xe từ database...\n");
        // Lấy tất cả các xe đang có trong database
        const cars = await Car.find({});
        
        if (cars.length === 0) {
            console.log("Chưa có chiếc xe nào trong database.");
        } else {
            console.log(`🎉 Tìm thấy ${cars.length} chiếc xe:`);
            cars.forEach((car, index) => {
                console.log(`   ${index + 1}. Xe: ${car.brand} ${car.model}`);
            });
        }
    } catch (err) {
        console.error("❌ Kết nối thất bại:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\nĐã ngắt kết nối.");
    }
}
run();
