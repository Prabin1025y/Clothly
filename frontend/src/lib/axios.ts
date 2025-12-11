// lib/axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Create axios instance
export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'https://api.example.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Request interceptor - Add auth token
// axiosClient.interceptors.request.use(
//     (config: InternalAxiosRequestConfig) => {
//         const token = useAuthStore.getState().token;

//         if (token && config.headers) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }

//         return config;
//     },
//     (error: AxiosError) => {
//         return Promise.reject(error);
//     }
// );

// Response interceptor - Handle errors
axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean
        };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Clear auth and redirect to login
            // useAuthStore.getState().clearAuth();

            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Type-safe API error handler
export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
};