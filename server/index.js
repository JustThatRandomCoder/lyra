require('dotenv').config();
const express = require('express');
const cors = require('cors');
const spotifyRoutes = require('./routes/spotify');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

app.use('/api/spotify', spotifyRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
