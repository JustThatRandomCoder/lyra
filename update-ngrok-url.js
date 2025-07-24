#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the new ngrok URL from command line argument
const newNgrokUrl = process.argv[2];

if (!newNgrokUrl) {
    console.log('Usage: node update-ngrok-url.js <new-ngrok-url>');
    console.log('Example: node update-ngrok-url.js https://abcd1234.ngrok-free.app');
    process.exit(1);
}

// Remove trailing slash if present
const cleanUrl = newNgrokUrl.replace(/\/$/, '');
const hostname = cleanUrl.replace('https://', '').replace('http://', '');

console.log(`Updating ngrok URL to: ${cleanUrl}`);

// Update client config
const clientConfigPath = path.join(__dirname, 'client/src/config.js');
const clientConfig = `// Centralized configuration for ngrok URL
// Update this URL when you get a new ngrok URL
export const CONFIG = {
  NGROK_URL: '${cleanUrl}'
};

// Derived URLs
export const SPOTIFY_REDIRECT_URI = \`\${CONFIG.NGROK_URL}/callback\`;`;

fs.writeFileSync(clientConfigPath, clientConfig);
console.log('✓ Updated client/src/config.js');

// Update server config
const serverConfigPath = path.join(__dirname, 'server/config.js');
const serverConfig = `// Centralized configuration for ngrok URL
// Update this URL when you get a new ngrok URL
const CONFIG = {
  NGROK_URL: '${cleanUrl}'
};

// Derived URLs
const SPOTIFY_REDIRECT_URI = \`\${CONFIG.NGROK_URL}/callback\`;

module.exports = {
  CONFIG,
  SPOTIFY_REDIRECT_URI
};`;

fs.writeFileSync(serverConfigPath, serverConfig);
console.log('✓ Updated server/config.js');

// Update vite config constants (ES module format)
const viteConfigPath = path.join(__dirname, 'client/vite.config.constants.js');
const viteConfig = `// Vite configuration - ES module version
// Update this URL when you get a new ngrok URL
const NGROK_URL = '${cleanUrl}';

// Extract the hostname for allowedHosts
const NGROK_HOSTNAME = NGROK_URL.replace('https://', '').replace('http://', '');

export {
  NGROK_URL,
  NGROK_HOSTNAME
};`;

fs.writeFileSync(viteConfigPath, viteConfig);
console.log('✓ Updated client/vite.config.constants.js');

console.log('\n🎉 All configurations updated!');
console.log('\nNext steps:');
console.log('1. Update the redirect URI in your Spotify Developer Console to:', `${cleanUrl}/callback`);
console.log('2. Restart your development servers (both client and server)');
