import axios from 'axios';
import store from '../Redux/store';

const axiosInstance = axios.create({
    baseURL: 'https://localhost:7150/api/',
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth.token;
        if (token && token !== "cookie") {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;