import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "https://sql-studio-backend.vercel.app";
const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cipher_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('cipher_token');
            localStorage.removeItem('cipher_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- Auth ---
export const authService = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    getMe: () => api.get('/api/auth/me'),
};

// --- Assignments ---
export const assignmentService = {
    getAll: (params) => api.get('/api/assignments', { params }),
    getById: (id) => api.get(`/api/assignments/${id}`),
    getSampleData: (id) => api.get(`/api/assignments/${id}/sample-data`),
};

// --- SQL Execution ---
export const executionService = {
    execute: (data) => api.post('/api/execute', data),
    getHint: (data) => api.post('/api/execute/hint', data),
};

// --- Submissions ---
export const submissionService = {
    getMine: (params) => api.get('/api/submissions/me', { params }),
    getProgress: () => api.get('/api/submissions/progress'),
    getLeaderboard: () => api.get('/api/submissions/leaderboard'),
};

export default api;
