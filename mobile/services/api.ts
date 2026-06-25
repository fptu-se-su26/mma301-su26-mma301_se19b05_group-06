import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseURL = () => {
  const envURL = process.env.EXPO_PUBLIC_API_URL;
  if ((Platform.OS as any) === 'web') return 'http://localhost:5000/api';
 return envURL || 'http://192.168.100.109:5000/api';
};

const API = axios.create({ baseURL: getBaseURL(), timeout: 30000 });

// Separate instance for AI chat — Gemini can take 30-60s
const AI_API = axios.create({ baseURL: getBaseURL(), timeout: 60000 });

// ─── Request Interceptor: attach access token ─────────────────────────────────
const attachToken = async (config: any) => {
  const stored = await AsyncStorage.getItem('user');
  if (stored) {
    const user = JSON.parse(stored);
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
};
API.interceptors.request.use(attachToken);
AI_API.interceptors.request.use(attachToken);

// ─── Response Interceptor: auto refresh token on 401 ─────────────────────────
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const stored = await AsyncStorage.getItem('user');
        if (!stored) return Promise.reject(error);
        const user = JSON.parse(stored);
        if (!user?.refreshToken) return Promise.reject(error);

        // Call refresh-token endpoint
        const res = await axios.post(`${getBaseURL()}/auth/refresh-token`, {
          refreshToken: user.refreshToken
        });

        const newToken = res.data.token;
        // Update stored user with new token
        await AsyncStorage.setItem('user', JSON.stringify({ ...user, token: newToken }));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch {
        // Refresh failed → clear user and let app handle redirect
        await AsyncStorage.removeItem('user');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginAPI = (data: { email: string; password: string }) =>
  API.post('/auth/login', data);

export const registerAPI = (data: { name: string; email: string; password: string }) =>
  API.post('/auth/register', data);

export const googleLoginAPI = (data: { credential: string }) =>
  API.post('/auth/google', data);

export const forgotPasswordAPI = (email: string) =>
  API.post('/auth/forgot-password', { email });

export const resetPasswordAPI = (data: any) =>
  API.post('/auth/reset-password', data);

export const refreshTokenAPI = (refreshToken: string) =>
  API.post('/auth/refresh-token', { refreshToken });

export const logoutAPI = (refreshToken: string) =>
  API.post('/auth/logout', { refreshToken });

export const logoutAllAPI = () =>
  API.post('/auth/logout-all');

export const changePasswordAPI = (data: { oldPassword: string; newPassword: string }) =>
  API.put('/auth/change-password', data);

// ─── CARS ─────────────────────────────────────────────────────────────────────
export const getCarsAPI = (params?: Record<string, string>) =>
  API.get('/cars', { params });

export const getCarByIdAPI = (id: string) =>
  API.get(`/cars/${id}`);

export const getCarPricingAPI = (id: string, params: { startDate: string; endDate: string }) =>
  API.get(`/cars/${id}/pricing`, { params });

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
export const createBookingAPI = (data: any) =>
  API.post('/bookings', data);

export const getMyBookingsAPI = () =>
  API.get('/bookings/my-bookings');

export const getAvailabilityByCarAPI = (carId: string) =>
  API.get(`/bookings/availability/${carId}`);

export const extendBookingAPI = (id: string, newReturnDate: string) =>
  API.post(`/bookings/${id}/extend`, { newReturnDate });

export const cancelBookingAPI = (id: string) =>
  API.patch(`/bookings/${id}/cancel`);

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const getReviewsByCarAPI = (carId: string) =>
  API.get(`/reviews/car/${carId}`);

// bookingId required — backend validates booking is Completed
export const createReviewAPI = (data: { bookingId: string; rating: number; comment: string }) =>
  API.post('/reviews', data);

export const deleteReviewAPI = (id: string) =>
  API.delete(`/reviews/${id}`);

// ─── VOUCHERS ─────────────────────────────────────────────────────────────────
export const applyVoucherAPI = (code: string, bookingValue: number) =>
  API.post('/admin/vouchers/apply', { code, bookingValue });

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const getNotificationsAPI = () =>
  API.get('/admin/notifications/my');

export const markNotificationReadAPI = (id: string) =>
  API.put(`/admin/notifications/${id}/read`);

export const markAllNotificationsReadAPI = () =>
  API.put('/admin/notifications/read-all');

// ─── AI ───────────────────────────────────────────────────────────────────────
export const chatAIAPI = (message: string, chatHistory: any[]) =>
  AI_API.post('/ai/chat', { message, chatHistory });

// ─── ADMIN ────────────────────────────────────────────────────────────────────
// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
export const getStatsAPI = () =>
  API.get('/admin/stats');

// ─── ADMIN BOOKINGS ───────────────────────────────────────────────────────────
export const getAllBookingsAPI = () =>
  API.get('/admin/bookings');

export const getBookingStatisticsAPI = () =>
  API.get('/admin/booking-statistics');

export const updateBookingStatusAPI = (id: string, status: string) =>
  API.put(`/admin/bookings/${id}/status`, { status });

export const completeBookingAPI = (id: string) =>
  API.patch(`/admin/bookings/${id}/complete`);

export const deleteBookingAPI = (id: string) =>
  API.delete(`/admin/bookings/${id}`);

// ─── ADMIN PAYMENTS ───────────────────────────────────────────────────────────
export const confirmPaymentAPI = (bookingId: string) =>
  API.post('/admin/payments/confirm', { bookingId });

export const getAllPaymentsAPI = () =>
  API.get('/admin/payments');

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
export const getUsersAPI = () =>
  API.get('/auth/users');

export const deleteUserAPI = (id: string) =>
  API.delete(`/auth/users/${id}`);

export const toggleUserStatusAPI = (id: string) =>
  API.put(`/auth/users/${id}/status`);

export const createCarAPI = (data: any) => API.post('/cars', data);
export const updateCarAPI = (id: string, data: any) => API.put(`/cars/${id}`, data);
export const deleteCarAPI = (id: string) => API.delete(`/cars/${id}`);

// ─── ADMIN ANALYTICS ──────────────────────────────────────────────────────────
export const getAnalyticsAPI = (period: 'day' | 'month' = 'month') =>
  API.get(`/admin/analytics?period=${period}`);

export const getPricingSurgesAPI = () => 
  API.get('/admin/pricing-surges');

export const getAdminAnalyticsAPI = (period: 'day' | 'month') =>
  API.get(`/admin/analytics?period=${period}`);

export const getAdminVouchersAPI = () => API.get('/admin/vouchers');
export const createAdminVoucherAPI = (data: any) => API.post('/admin/vouchers', data);
export const deleteAdminVoucherAPI = (id: string) => API.delete(`/admin/vouchers/${id}`);

export default API;
