# Ngrok URL Configuration

This project uses ngrok for HTTPS tunneling in development. To make it easier to update the ngrok URL across all files, we've centralized the configuration.

## Quick Update (Recommended)

When you get a new ngrok URL, use the update script:

```bash
node update-ngrok-url.js https://your-new-ngrok-url.ngrok-free.app
```

This will automatically update all configuration files.

## Manual Update

If you prefer to update manually, you need to change the URL in these files:

1. **Client config**: `client/src/config.js` - Update `NGROK_URL`
2. **Server config**: `server/config.js` - Update `NGROK_URL`
3. **Vite config**: `client/vite.config.constants.js` - Update `NGROK_URL`

## Files that use the configuration

- `client/src/pages/briefing.jsx` - Uses `SPOTIFY_REDIRECT_URI` for OAuth
- `server/services/spotifyService.js` - Uses `SPOTIFY_REDIRECT_URI` for token exchange
- `client/vite.config.js` - Uses `NGROK_HOSTNAME` for allowedHosts

## After updating the URL

1. Update the redirect URI in your [Spotify Developer Console](https://developer.spotify.com/dashboard)
2. Restart both your development servers:

   ```bash
   # Terminal 1 (Server)
   cd server && npm start

   # Terminal 2 (Client)
   cd client && npm run dev
   ```
