// Centralized configuration for ngrok URL
// Update this URL when you get a new ngrok URL
export const CONFIG = {
  NGROK_URL: 'https://3ae0bb7f9234.ngrok-free.app'
};

// Derived URLs
export const SPOTIFY_REDIRECT_URI = `${CONFIG.NGROK_URL}/callback`;