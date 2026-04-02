import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

// Only log missing API URL in non-production or if explicitly requested
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    // If it's on Hostinger and we want to use the same domain, /api is a valid default.
    // We can suppress the warning if it's working.
    console.debug('API Client using relative path: ' + baseURL);
}

const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;