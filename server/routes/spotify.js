const express = require('express');
const router = express.Router();
const { exchangeCodeAndCreatePlaylist } = require('../services/spotifyService');

router.post('/token', exchangeCodeAndCreatePlaylist);

module.exports = router;
