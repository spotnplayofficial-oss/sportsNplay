// configuration constants for client-side environment variables
// VITE_ prefix is required by Vite for env vars exposed to code

// Temporarily hardcoded for production - TODO: fix .env loading
export const API_URL = 'https://spotnplay-1.onrender.com/api';
export const SOCKET_URL = 'https://spotnplay-1.onrender.com';

// Debug logging
console.log('🔧 Config loaded:', { API_URL, SOCKET_URL });
