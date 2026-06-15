import axios from 'axios';

// Get API base URL from Parcel env, default to local backend port
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export { API_BASE_URL };
export default api;
