const axios = require('axios');
const qs = require('qs');
const { SPOTIFY_REDIRECT_URI } = require('../config');

const exchangeCodeAndCreatePlaylist = async (req, res) => {
    const { code } = req.body;

    try {
        // 1. Exchange code for access token
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            qs.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: SPOTIFY_REDIRECT_URI,
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const { access_token } = tokenResponse.data;

        // Return the access token instead of creating a playlist immediately
        res.json({
            access_token: access_token,
            message: 'Authentication successful'
        });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to authenticate with Spotify' });
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

        // Calculate desired number of tracks based on length
        const getTrackLimit = (length) => {
            if (!length || length.trim() === '') return 20; // Default

            const lengthLower = length.toLowerCase();
            if (lengthLower.includes('short') || lengthLower.includes('quick')) return 10;
            if (lengthLower.includes('long') || lengthLower.includes('extended')) return 40;
            if (lengthLower.includes('medium') || lengthLower.includes('normal')) return 20;

            // Try to extract minutes if specified
            const minuteMatch = lengthLower.match(/(\d+)\s*(min|minute)/);
            if (minuteMatch) {
                const minutes = parseInt(minuteMatch[1]);
                return Math.max(5, Math.min(50, Math.round(minutes / 3))); // Roughly 3 minutes per song
            }

            return 20; // Default fallback
        };

        const trackLimit = getTrackLimit(length);

        // Create a better search query that works with Spotify's search API
        // Artists are now optional
        const searchTerms = [...genre, ...mood];
        if (artists && artists.trim()) {
            searchTerms.push(artists.trim());
        }

        const searchQuery = searchTerms.filter(term => term && term.trim()).join(' ');

        console.log('Search query:', searchQuery);
        console.log('Track limit:', trackLimit);

        const searchResponse = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${trackLimit}`,
            {
                headers: { Authorization: `Bearer ${access_token}` },
            }
        );

        const tracks = searchResponse.data.tracks.items;

        console.log(`Found ${tracks.length} tracks`);

        // Calculate total duration in milliseconds
        const totalDurationMs = tracks.reduce((sum, track) => sum + track.duration_ms, 0);
        const totalMinutes = Math.round(totalDurationMs / 60000);

        // Generate a custom playlist name based on criteria
        const generatePlaylistName = () => {
            const moodEmojis = {
                happy: '😊', sad: '😢', energetic: '⚡', calm: '🧘', romantic: '💕',
                melancholic: '🌧️', upbeat: '🎉', chill: '😎', aggressive: '🔥',
                nostalgic: '📻', motivated: '💪', peaceful: '🕊️'
            };

            const genreNames = {
                pop: 'Pop', rock: 'Rock', hiphop: 'Hip-Hop', jazz: 'Jazz',
                classical: 'Classical', electronic: 'Electronic', country: 'Country',
                reggae: 'Reggae', blues: 'Blues', metal: 'Metal', folk: 'Folk',
                rnb: 'R&B', soul: 'Soul', punk: 'Punk', indie: 'Indie',
                funk: 'Funk', disco: 'Disco', latin: 'Latin', house: 'House', techno: 'Techno'
            };

            const primaryMood = mood[0];
            const primaryGenre = genre[0];
            const emoji = moodEmojis[primaryMood] || '🎵';
            const genreName = genreNames[primaryGenre] || primaryGenre;

            return `${emoji} ${usecase.charAt(0).toUpperCase() + usecase.slice(1)} ${genreName} Mix`;
        };

        // Format tracks with enhanced data including covers
        const formattedTracks = tracks.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            duration: Math.round(track.duration_ms / 1000), // Duration in seconds
            durationFormatted: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
            spotify_url: track.external_urls.spotify,
            spotify_uri: track.uri,
            cover_url: track.album.images[0]?.url || null, // Get the largest image
            preview_url: track.preview_url
        }));

        res.json({
            message: 'Playlist generated successfully',
            criteria: { usecase, genre, mood, artists, length },
            searchQuery: searchQuery,
            playlistName: generatePlaylistName(),
            totalTracks: tracks.length,
            totalDuration: totalMinutes,
            tracks: formattedTracks
        });
    } catch (error) {
        console.error('Error generating playlist:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate playlist' });
    }
};

const createPlaylistFromTracks = async (req, res) => {
    const { playlistName, tracks, accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ error: 'Access token required' });
    }

    try {
        // Get user profile info
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userId = userResponse.data.id;

        // Create the playlist
        const playlistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                name: playlistName,
                description: 'Generated with ❤️ by Lyra',
                public: true,
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        const playlistId = playlistResponse.data.id;

        // Add tracks to the playlist
        if (tracks && tracks.length > 0) {
            const trackUris = tracks.map(track => track.spotify_uri);
            await axios.post(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                { uris: trackUris },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
        }

        res.json({
            playlistUrl: playlistResponse.data.external_urls.spotify,
            playlistId: playlistId
        });
    } catch (error) {
        console.error('Error creating playlist:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create Spotify playlist' });
    }
};

module.exports = { exchangeCodeAndCreatePlaylist, generatePlaylist, createPlaylistFromTracks };
