// Centralized API Base URL configuration
// In development, defaults to 'http://localhost:3000'
// In production (e.g. Render / Cloud), reads from VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default API_BASE_URL;
