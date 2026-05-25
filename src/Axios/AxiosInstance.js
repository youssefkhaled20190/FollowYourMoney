import axios from 'axios';
import store from '../Redux/store';

const axiosInstance = axios.create({
    baseURL: 'https://localhost:7053/api/',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth.token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;