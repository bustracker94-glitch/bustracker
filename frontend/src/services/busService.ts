import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const busService = {
  async getAllBuses() {
    const response = await api.get('/buses');
    return response.data;
  },

  async getBusLocation(busId: string) {
    const response = await api.get(`/locations/${busId}`);
    return response.data;
  },

  async getBusRoute(busId: string) {
    const response = await api.get(`/routes/${busId}`);
    return response.data;
  },

  async getAllRoutes() {
    const response = await api.get('/routes');
    return response.data;
  },

  async updateLocation(locationData: {
    device_id: string;
    lat: number;
    lon: number;
    speed: number;
  }) {
    const response = await api.post('/locations', locationData);
    return response.data;
  }
};