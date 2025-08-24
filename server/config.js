// Centralized configuration for ngrok URL
// Update this URL when you get a new ngrok URL
const CONFIG = {
  NGROK_URL: 'https://9b61ed569fe0.ngrok-free.app'
};

// Derived URLs
const SPOTIFY_REDIRECT_URI = `${CONFIG.NGROK_URL}/callback`;

module.exports = {
  CONFIG,
  SPOTIFY_REDIRECT_URI
};