const express = require('express');
const router = express.Router();
const { exchangeCodeAndCreatePlaylist, generatePlaylist } = require('../services/spotifyService');

router.post('/token', exchangeCodeAndCreatePlaylist);
router.post('/generate-playlist', generatePlaylist);

module.exports = router;
