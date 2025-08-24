const axios = require('axios');

const generatePlaylistRecommendations = async (usecase, genres, moods, artists, length) => {
    try {
        console.log('🎵 Generating playlist recommendations using free music database...');

        // Calculate desired number of songs
        const getTrackCount = (length) => {
            if (!length || length.trim() === '') return 20;

            const lengthLower = length.toLowerCase();
            if (lengthLower.includes('short') || lengthLower.includes('quick')) return 10;
            if (lengthLower.includes('long') || lengthLower.includes('extended')) return 40;
            if (lengthLower.includes('medium') || lengthLower.includes('normal')) return 20;

            const minuteMatch = lengthLower.match(/(\d+)\s*(min|minute)/);
            if (minuteMatch) {
                const minutes = parseInt(minuteMatch[1]);
                return Math.max(5, Math.min(50, Math.round(minutes / 3)));
            }

            return 20;
        };

        const trackCount = getTrackCount(length);

        // Generate a creative playlist name based on inputs
        const generatePlaylistName = (usecase, genres, moods) => {
            const useCaseNames = {
                'workout': ['Power Hour', 'Beast Mode', 'Gym Fuel', 'Sweat Session', 'Pump Up Mix', 'High Energy'],
                'work': ['Focus Flow', 'Productivity Boost', 'Deep Work', 'Office Vibes', 'Work Mode', 'Concentration'],
                'studying': ['Study Zone', 'Brain Fuel', 'Focus Mode', 'Study Beats', 'Academic Vibes', 'Learning Lounge'],
                'relaxing': ['Chill Out', 'Peaceful Moments', 'Zen Mode', 'Calm Vibes', 'Serenity', 'Tranquil Tunes'],
                'sleeping': ['Night Sounds', 'Sleep Waves', 'Dreamscape', 'Bedtime Stories', 'Lullaby Lounge', 'Midnight Calm']
            };

            const moodAdjectives = {
                'happy': ['Bright', 'Sunny', 'Joyful', 'Uplifting', 'Cheerful', 'Radiant'],
                'energetic': ['Electric', 'Dynamic', 'High Energy', 'Pumped', 'Charged', 'Explosive'],
                'calm': ['Serene', 'Peaceful', 'Tranquil', 'Soothing', 'Gentle', 'Quiet'],
                'sad': ['Melancholy', 'Blue', 'Reflective', 'Emotional', 'Somber', 'Introspective'],
                'romantic': ['Love Songs', 'Heart Beats', 'Romance', 'Sweet Moments', 'Passion', 'Tender']
            };

            const baseNames = useCaseNames[usecase] || ['Perfect Playlist', 'Music Mix', 'Song Collection', 'Vibe Check', 'Sound Selection', 'Audio Journey'];
            const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];

            if (moods.length > 0) {
                const mood = moods[0];
                const adjectives = moodAdjectives[mood];
                if (adjectives) {
                    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                    return `${adjective} ${baseName}`;
                }
            }

            return baseName;
        };

        const playlistName = generatePlaylistName(usecase, genres, moods);

        // Define genre-based track collections (popular songs that work well for each genre/mood)
        const trackDatabase = {
            pop: [
                { title: "Blinding Lights", artist: "The Weeknd" },
                { title: "Levitating", artist: "Dua Lipa" },
                { title: "Good 4 U", artist: "Olivia Rodrigo" },
                { title: "Watermelon Sugar", artist: "Harry Styles" },
                { title: "Anti-Hero", artist: "Taylor Swift" },
                { title: "Heat Waves", artist: "Glass Animals" },
                { title: "Stay", artist: "The Kid LAROI" },
                { title: "Industry Baby", artist: "Lil Nas X" },
                { title: "Shape of You", artist: "Ed Sheeran" },
                { title: "Perfect", artist: "Ed Sheeran" },
                { title: "Bad Habits", artist: "Ed Sheeran" },
                { title: "drivers license", artist: "Olivia Rodrigo" }
            ],
            rock: [
                { title: "Don't Stop Me Now", artist: "Queen" },
                { title: "Mr. Brightside", artist: "The Killers" },
                { title: "Bohemian Rhapsody", artist: "Queen" },
                { title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
                { title: "Thunderstruck", artist: "AC/DC" },
                { title: "Livin' on a Prayer", artist: "Bon Jovi" },
                { title: "Don't Stop Believin'", artist: "Journey" },
                { title: "We Will Rock You", artist: "Queen" },
                { title: "Highway to Hell", artist: "AC/DC" },
                { title: "Smells Like Teen Spirit", artist: "Nirvana" },
                { title: "Welcome to the Jungle", artist: "Guns N' Roses" },
                { title: "Paradise City", artist: "Guns N' Roses" }
            ],
            hiphop: [
                { title: "HUMBLE.", artist: "Kendrick Lamar" },
                { title: "God's Plan", artist: "Drake" },
                { title: "Sicko Mode", artist: "Travis Scott" },
                { title: "Old Town Road", artist: "Lil Nas X" },
                { title: "Lose Yourself", artist: "Eminem" },
                { title: "Good Kid", artist: "Kendrick Lamar" },
                { title: "Hotline Bling", artist: "Drake" },
                { title: "Montero", artist: "Lil Nas X" },
                { title: "STAR WALKIN'", artist: "Lil Nas X" },
                { title: "Praise The Lord", artist: "A$AP Rocky" },
                { title: "Money Trees", artist: "Kendrick Lamar" },
                { title: "Started From The Bottom", artist: "Drake" }
            ],
            electronic: [
                { title: "Levels", artist: "Avicii" },
                { title: "Titanium", artist: "David Guetta" },
                { title: "Wake Me Up", artist: "Avicii" },
                { title: "Bangarang", artist: "Skrillex" },
                { title: "Clarity", artist: "Zedd" },
                { title: "Animals", artist: "Martin Garrix" },
                { title: "Lean On", artist: "Major Lazer" },
                { title: "Midnight City", artist: "M83" },
                { title: "One More Time", artist: "Daft Punk" },
                { title: "Strobe", artist: "Deadmau5" },
                { title: "Scary Monsters and Nice Sprites", artist: "Skrillex" },
                { title: "Ghosts 'n' Stuff", artist: "Deadmau5" }
            ],
            jazz: [
                { title: "Take Five", artist: "Dave Brubeck" },
                { title: "What a Wonderful World", artist: "Louis Armstrong" },
                { title: "Fly Me to the Moon", artist: "Frank Sinatra" },
                { title: "The Girl from Ipanema", artist: "Stan Getz" },
                { title: "Autumn Leaves", artist: "Miles Davis" },
                { title: "Blue Moon", artist: "Billie Holiday" },
                { title: "Summertime", artist: "Ella Fitzgerald" },
                { title: "Mack the Knife", artist: "Bobby Darin" },
                { title: "Kind of Blue", artist: "Miles Davis" },
                { title: "A Love Supreme", artist: "John Coltrane" },
                { title: "Round Midnight", artist: "Thelonious Monk" },
                { title: "All of Me", artist: "Billie Holiday" }
            ],
            classical: [
                { title: "Eine kleine Nachtmusik", artist: "Mozart" },
                { title: "Canon in D", artist: "Pachelbel" },
                { title: "Symphony No. 9", artist: "Beethoven" },
                { title: "The Four Seasons", artist: "Vivaldi" },
                { title: "Clair de Lune", artist: "Debussy" },
                { title: "Ave Maria", artist: "Schubert" },
                { title: "Moonlight Sonata", artist: "Beethoven" },
                { title: "Swan Lake", artist: "Tchaikovsky" },
                { title: "Für Elise", artist: "Beethoven" },
                { title: "The Blue Danube", artist: "Johann Strauss II" },
                { title: "Carmen Suite", artist: "Bizet" },
                { title: "1812 Overture", artist: "Tchaikovsky" }
            ],
            country: [
                { title: "Friends in Low Places", artist: "Garth Brooks" },
                { title: "Sweet Caroline", artist: "Neil Diamond" },
                { title: "Take Me Home, Country Roads", artist: "John Denver" },
                { title: "Wagon Wheel", artist: "Darius Rucker" },
                { title: "Before He Cheats", artist: "Carrie Underwood" },
                { title: "Cruise", artist: "Florida Georgia Line" },
                { title: "Body Like a Back Road", artist: "Sam Hunt" },
                { title: "The Good Ones", artist: "Gabby Barrett" }
            ],
            rnb: [
                { title: "Blinding Lights", artist: "The Weeknd" },
                { title: "Peaches", artist: "Justin Bieber" },
                { title: "Good as Hell", artist: "Lizzo" },
                { title: "Sunflower", artist: "Post Malone" },
                { title: "Circles", artist: "Post Malone" },
                { title: "Adorn", artist: "Miguel" },
                { title: "Golden", artist: "Jill Scott" },
                { title: "Best Part", artist: "Daniel Caesar" }
            ]
        };

        // Mood-based tracks
        const moodTracks = {
            energetic: [
                { title: "Uptown Funk", artist: "Bruno Mars" },
                { title: "Can't Stop the Feeling", artist: "Justin Timberlake" },
                { title: "Happy", artist: "Pharrell Williams" },
                { title: "Pump It", artist: "Black Eyed Peas" },
                { title: "Dynamite", artist: "BTS" },
                { title: "Shut Up and Dance", artist: "Walk the Moon" }
            ],
            calm: [
                { title: "Weightless", artist: "Marconi Union" },
                { title: "Clair de Lune", artist: "Debussy" },
                { title: "Mad World", artist: "Gary Jules" },
                { title: "The Night We Met", artist: "Lord Huron" },
                { title: "Holocene", artist: "Bon Iver" },
                { title: "River", artist: "Joni Mitchell" }
            ],
            happy: [
                { title: "Walking on Sunshine", artist: "Katrina and the Waves" },
                { title: "Good Vibrations", artist: "The Beach Boys" },
                { title: "I Want It That Way", artist: "Backstreet Boys" },
                { title: "Dancing Queen", artist: "ABBA" },
                { title: "September", artist: "Earth, Wind & Fire" },
                { title: "Good Times", artist: "Chic" }
            ],
            sad: [
                { title: "Someone Like You", artist: "Adele" },
                { title: "Hello", artist: "Adele" },
                { title: "Mad World", artist: "Gary Jules" },
                { title: "Hurt", artist: "Johnny Cash" },
                { title: "Black", artist: "Pearl Jam" },
                { title: "Tears in Heaven", artist: "Eric Clapton" }
            ],
            romantic: [
                { title: "Perfect", artist: "Ed Sheeran" },
                { title: "Thinking Out Loud", artist: "Ed Sheeran" },
                { title: "All of Me", artist: "John Legend" },
                { title: "At Last", artist: "Etta James" },
                { title: "Can't Help Myself", artist: "Four Tops" },
                { title: "La Vie En Rose", artist: "Édith Piaf" }
            ]
        };

        // Use case specific tracks
        const useCaseTracks = {
            workout: [
                { title: "Eye of the Tiger", artist: "Survivor" },
                { title: "Stronger", artist: "Kanye West" },
                { title: "Till I Collapse", artist: "Eminem" },
                { title: "Pump It Up", artist: "Endor" },
                { title: "Thunder", artist: "Imagine Dragons" },
                { title: "Believer", artist: "Imagine Dragons" },
                { title: "We Will Rock You", artist: "Queen" },
                { title: "Don't Stop Me Now", artist: "Queen" }
            ],
            work: [
                { title: "Konzert für Violine", artist: "Vivaldi" },
                { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
                { title: "Near Light", artist: "Ólafur Arnalds" },
                { title: "On The Nature of Daylight", artist: "Max Richter" },
                { title: "Spiegel im Spiegel", artist: "Arvo Pärt" },
                { title: "Metamorphosis Two", artist: "Philip Glass" }
            ],
            studying: [
                { title: "Weightless", artist: "Marconi Union" },
                { title: "Clair de Lune", artist: "Debussy" },
                { title: "Gymnopédie No. 1", artist: "Erik Satie" },
                { title: "Comptine d'un autre été", artist: "Yann Tiersen" },
                { title: "River Flows in You", artist: "Yiruma" },
                { title: "Nuvole Bianche", artist: "Ludovico Einaudi" }
            ],
            relaxing: [
                { title: "Weightless", artist: "Marconi Union" },
                { title: "Aqueous Transmission", artist: "Incubus" },
                { title: "Clair de Lune", artist: "Debussy" },
                { title: "Mad World", artist: "Gary Jules" },
                { title: "The Night We Met", artist: "Lord Huron" },
                { title: "Holocene", artist: "Bon Iver" }
            ],
            sleeping: [
                { title: "Weightless", artist: "Marconi Union" },
                { title: "Clair de Lune", artist: "Debussy" },
                { title: "Gymnopédie No. 1", artist: "Erik Satie" },
                { title: "Spiegel im Spiegel", artist: "Arvo Pärt" },
                { title: "Metamorphosis Two", artist: "Philip Glass" },
                { title: "Sleep Baby Sleep", artist: "Broods" }
            ]
        };

        // Combine tracks based on criteria
        let availableTracks = [];

        // Add use case specific tracks first (highest priority)
        if (useCaseTracks[usecase]) {
            availableTracks = availableTracks.concat(useCaseTracks[usecase]);
        }

        // Add genre-based tracks
        if (genres.length > 0) {
            genres.forEach(genre => {
                if (trackDatabase[genre]) {
                    availableTracks = availableTracks.concat(trackDatabase[genre]);
                }
            });
        }

        // Add mood-based tracks
        if (moods.length > 0) {
            moods.forEach(mood => {
                if (moodTracks[mood]) {
                    availableTracks = availableTracks.concat(moodTracks[mood]);
                }
            });
        }

        // If no specific criteria, use popular tracks
        if (availableTracks.length === 0) {
            availableTracks = [
                ...trackDatabase.pop,
                ...trackDatabase.rock.slice(0, 4),
                ...moodTracks.happy
            ];
        }

        // Remove duplicates and shuffle
        const uniqueTracks = availableTracks.filter((track, index, self) =>
            index === self.findIndex(t => t.title === track.title && t.artist === track.artist)
        );

        // Shuffle array
        for (let i = uniqueTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueTracks[i], uniqueTracks[j]] = [uniqueTracks[j], uniqueTracks[i]];
        }

        // Take the required number of tracks
        const selectedTracks = uniqueTracks.slice(0, trackCount);

        // If we don't have enough, add more popular tracks
        if (selectedTracks.length < trackCount) {
            const morePopular = [
                { title: "Rolling in the Deep", artist: "Adele" },
                { title: "Thinking Out Loud", artist: "Ed Sheeran" },
                { title: "Hello", artist: "Adele" },
                { title: "Despacito", artist: "Luis Fonsi" },
                { title: "Closer", artist: "The Chainsmokers" },
                { title: "Someone You Loved", artist: "Lewis Capaldi" },
                { title: "Sunflower", artist: "Post Malone" },
                { title: "Circles", artist: "Post Malone" }
            ];

            const needed = trackCount - selectedTracks.length;
            selectedTracks.push(...morePopular.slice(0, needed));
        }

        console.log(`✅ Generated ${selectedTracks.length} song recommendations for "${playlistName}"`);

        return {
            playlistName: playlistName,
            songs: selectedTracks.slice(0, trackCount)
        };

    } catch (error) {
        console.error('❌ Error generating recommendations:', error.message);
        throw error;
    }
};

const generatePlaylistImage = async (playlistName, usecase, genres, moods) => {
    try {
        console.log('🎨 Generating playlist image using Unsplash...');

        // Build search terms for Unsplash
        const searchTerms = [];

        // Add use case related terms
        const useCaseTerms = {
            'workout': ['fitness', 'gym', 'exercise', 'sports', 'energy', 'strength'],
            'work': ['office', 'business', 'productivity', 'focus', 'minimalist', 'clean'],
            'studying': ['books', 'library', 'education', 'focus', 'learning', 'knowledge'],
            'relaxing': ['nature', 'calm', 'peaceful', 'zen', 'sunset', 'ocean'],
            'sleeping': ['night', 'moon', 'stars', 'peaceful', 'dark', 'serene']
        };

        if (useCaseTerms[usecase]) {
            searchTerms.push(...useCaseTerms[usecase]);
        }

        // Add mood related terms
        const moodTerms = {
            'happy': ['bright', 'colorful', 'sunshine', 'joy', 'vibrant', 'yellow'],
            'energetic': ['dynamic', 'vibrant', 'electric', 'energy', 'lightning', 'red'],
            'calm': ['peaceful', 'serene', 'blue', 'water', 'clouds', 'minimalist'],
            'sad': ['dark', 'rain', 'melancholy', 'blue', 'storm', 'moody'],
            'romantic': ['sunset', 'hearts', 'pink', 'flowers', 'love', 'warm'],
            'nostalgic': ['vintage', 'retro', 'sepia', 'old', 'memories', 'film'],
            'motivated': ['mountain', 'success', 'achievement', 'goal', 'victory', 'climbing']
        };

        moods.forEach(mood => {
            if (moodTerms[mood]) {
                searchTerms.push(...moodTerms[mood]);
            }
        });

        // Add genre related terms
        const genreTerms = {
            'rock': ['guitar', 'concert', 'stage', 'music', 'instruments', 'band'],
            'jazz': ['saxophone', 'piano', 'vintage', 'music', 'club', 'noir'],
            'classical': ['orchestra', 'piano', 'violin', 'elegant', 'concert hall', 'instruments'],
            'electronic': ['neon', 'digital', 'futuristic', 'lights', 'cyber', 'technology'],
            'pop': ['colorful', 'modern', 'trendy', 'music', 'bright', 'contemporary'],
            'country': ['rural', 'countryside', 'guitar', 'folk', 'americana', 'rustic'],
            'hiphop': ['urban', 'city', 'street', 'graffiti', 'microphone', 'beats']
        };

        genres.forEach(genre => {
            if (genreTerms[genre]) {
                searchTerms.push(...genreTerms[genre]);
            }
        });

        // Default to music related terms if no specific terms
        if (searchTerms.length === 0) {
            searchTerms.push('music', 'headphones', 'sound', 'audio', 'vinyl', 'abstract');
        }

        // Pick a random search term
        const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

        // Use Unsplash Source API (free, no key required)
        const unsplashUrl = `https://source.unsplash.com/400x400/?${searchTerm},music`;

        console.log(`✅ Generated playlist cover using Unsplash (search: ${searchTerm})`);

        return unsplashUrl;

    } catch (error) {
        console.error('❌ Error generating image:', error.message);
        // Return null to use fallback image
        return null;
    }
};

module.exports = {
    generatePlaylistRecommendations,
    generatePlaylistImage
};
