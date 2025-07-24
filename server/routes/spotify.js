const express = require('express');
const router = express.Router();
const { exchangeCodeAndCreatePlaylist, generatePlaylist, createPlaylistFromTracks } = require('../services/spotifyService');

router.post('/token', exchangeCodeAndCreatePlaylist);
router.post('/generate-playlist', generatePlaylist);
router.post('/create-playlist', createPlaylistFromTracks);

module.exports = router;
