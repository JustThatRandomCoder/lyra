// Vite configuration - ES module version
// Update this URL when you get a new ngrok URL
const NGROK_URL = 'https://3ae0bb7f9234.ngrok-free.app';

// Extract the hostname for allowedHosts
const NGROK_HOSTNAME = NGROK_URL.replace('https://', '').replace('http://', '');

export {
  NGROK_URL,
  NGROK_HOSTNAME
};