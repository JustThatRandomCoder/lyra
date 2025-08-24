const axios = require('axios');
const qs = require('qs');
const { SPOTIFY_REDIRECT_URI } = require('../config');
const { generatePlaylistRecommendations, generatePlaylistImage } = require('./musicService');

const exchangeCodeAndCreatePlaylist = async (req, res) => {
    const { code } = req.body;

    try {
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
        console.log('🎵 Starting playlist generation with curated music database...');

        const musicResponse = await generatePlaylistRecommendations(usecase, genre, mood, artists, length);
        console.log(`✅ Selected ${musicResponse.songs.length} songs from curated database`);

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

        const spotifyTracks = [];
        const searchPromises = musicResponse.songs.map(async (song) => {
            try {
                const searchQuery = `${song.title} ${song.artist}`;
                console.log(`Searching Spotify for: ${searchQuery}`);

                const searchResponse = await axios.get(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`,
                    {
                        headers: { Authorization: `Bearer ${access_token}` },
                    }
                );

                const tracks = searchResponse.data.tracks.items;
                if (tracks.length > 0) {
                    const track = tracks[0];
                    return {
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        duration: Math.round(track.duration_ms / 1000),
                        durationFormatted: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
                        spotify_url: track.external_urls.spotify,
                        spotify_uri: track.uri,
                        cover_url: track.album.images[0]?.url || null,
                        preview_url: track.preview_url,
                        originalRecommendation: song
                    };
                } else {
                    console.log(`No Spotify match found for: ${searchQuery}`);
                    return null;
                }
            } catch (error) {
                console.error(`Error searching for ${song.title} by ${song.artist}:`, error.message);
                return null;
            }
        });

        const searchResults = await Promise.all(searchPromises);
        const foundTracks = searchResults.filter(track => track !== null);

        console.log(`✅ Found ${foundTracks.length} tracks on Spotify out of ${musicResponse.songs.length} recommendations`);

        const totalDurationMs = foundTracks.reduce((sum, track) => sum + (track.duration * 1000), 0);
        const totalMinutes = Math.round(totalDurationMs / 60000);

        let playlistImageUrl = null;
        try {
            console.log('🎨 Generating playlist image...');
            playlistImageUrl = await generatePlaylistImage(musicResponse.playlistName, usecase, genre, mood);
        } catch (imageError) {
            console.log('⚠️ Image generation failed, continuing without image:', imageError.message);
        }

        res.json({
            message: '✅ Playlist generated successfully with curated music database',
            criteria: { usecase, genre, mood, artists, length },
            playlistName: musicResponse.playlistName,
            playlistImage: playlistImageUrl,
            totalTracks: foundTracks.length,
            totalDuration: totalMinutes,
            tracks: foundTracks,
            musicRecommendations: musicResponse.songs,
            spotifyMatches: foundTracks.length,
            totalRecommendations: musicResponse.songs.length
        });

    } catch (error) {
        console.error('❌ Error generating playlist:', error);
        res.status(500).json({
            error: 'Failed to generate playlist',
            details: error.message
        });
    }
};

const createPlaylistFromTracks = async (req, res) => {
    const { playlistName, tracks, accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ error: 'Access token required' });
    }

    try {
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userId = userResponse.data.id;

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
