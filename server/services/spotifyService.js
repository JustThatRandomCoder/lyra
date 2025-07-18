const axios = require('axios');
const qs = require('qs');

const exchangeCodeAndCreatePlaylist = async (req, res) => {
    const { code } = req.body;

    try {
        // 1. Exchange code for access token
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            qs.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const { access_token } = tokenResponse.data;

        // 2. Get user profile info
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const userId = userResponse.data.id;

        // 3. Create a playlist
        const playlistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                name: 'Your VibeMix Playlist',
                description: 'Generated with ❤️ by VibeMix',
                public: true,
            },
            {
                headers: { Authorization: `Bearer ${access_token}` },
            }
        );
        const playlistId = playlistResponse.data.id;

        // 4. Add some example tracks (replace with your real tracks)
        const exampleTracks = [
            'spotify:track:3n3Ppam7vgaVa1iaRUc9Lp', // Enter Sandman
            'spotify:track:7ouMYWpwJ422jRcDASZB7P'
        ];

        await axios.post(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            { uris: exampleTracks },
            {
                headers: { Authorization: `Bearer ${access_token}` },
            }
        );

        res.json({ playlistUrl: playlistResponse.data.external_urls.spotify });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create Spotify playlist' });
    }
};

const generatePlaylist = async (req, res) => {
    const { usecase, genre, mood, artists, length } = req.body;

    try {
        // Get client credentials access token
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            qs.stringify({
                grant_type: 'client_credentials',
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const { access_token } = tokenResponse.data;

        // Create a better search query that works with Spotify's search API
        // Combine artists with genre and mood keywords
        const searchTerms = [artists, ...genre, ...mood].filter(term => term && term.trim());
        const searchQuery = searchTerms.join(' ');

        console.log('Search query:', searchQuery);

        const searchResponse = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=20`,
            {
                headers: { Authorization: `Bearer ${access_token}` },
            }
        );

        const tracks = searchResponse.data.tracks.items;

        console.log(`Found ${tracks.length} tracks`);

        // For now, return track information
        res.json({
            message: 'Playlist generated successfully',
            criteria: { usecase, genre, mood, artists, length },
            searchQuery: searchQuery,
            tracks: tracks.map(track => ({
                name: track.name,
                artist: track.artists[0].name,
                spotify_url: track.external_urls.spotify
            }))
        });
    } catch (error) {
        console.error('Error generating playlist:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate playlist' });
    }
};

module.exports = { exchangeCodeAndCreatePlaylist, generatePlaylist };
