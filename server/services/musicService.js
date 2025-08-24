const axios = require('axios');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'gsk_your_free_key_here'
});

const postProcessPlaylist = (playlist, artists, targetCount) => {
    console.log('🔧 Post-processing playlist for uniqueness and artist requirements...');

    const seenTitles = new Set();
    const seenTitleArtist = new Set();
    const uniqueSongs = playlist.songs.filter(song => {
        const ultraCleanTitle = song.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '')
            .replace(/\b(feat|ft|featuring|vs|versus|with|and|&|remix|radio|edit|version|remaster)\b/g, '')
            .trim();

        const cleanArtist = song.artist
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '')
            .trim();

        const titleKey = ultraCleanTitle;
        const titleArtistKey = `${ultraCleanTitle}|||${cleanArtist}`;

        if (seenTitles.has(titleKey)) {
            console.log(`⚠️ Removed duplicate TITLE: "${song.title}" by ${song.artist} (title already exists)`);
            return false;
        }

        if (seenTitleArtist.has(titleArtistKey)) {
            console.log(`⚠️ Removed duplicate SONG: "${song.title}" by ${song.artist}`);
            return false;
        }

        seenTitles.add(titleKey);
        seenTitleArtist.add(titleArtistKey);
        return true;
    });
    if (artists && artists.trim()) {
        const artistList = artists.split(',').map(a => a.trim().toLowerCase()).filter(a => a.length > 0);
        const includedArtists = new Set();

        uniqueSongs.forEach(song => {
            const songArtist = song.artist.toLowerCase();
            artistList.forEach(requestedArtist => {
                if (songArtist.includes(requestedArtist) || requestedArtist.includes(songArtist)) {
                    includedArtists.add(requestedArtist);
                }
            });
        });

        console.log(`✅ Included requested artists: ${Array.from(includedArtists).join(', ')}`);

        const missingArtists = artistList.filter(artist => !includedArtists.has(artist));
        if (missingArtists.length > 0) {
            console.log(`⚠️ Missing requested artists: ${missingArtists.join(', ')}`);
        }
    }

    const finalSongs = uniqueSongs.slice(0, targetCount);

    console.log(`🎵 Final playlist: ${finalSongs.length} unique songs (removed ${playlist.songs.length - uniqueSongs.length} duplicates)`);

    const finalTitles = finalSongs.map(song => song.title.toLowerCase().trim());
    const uniqueTitles = new Set(finalTitles);
    const duplicateCount = finalTitles.length - uniqueTitles.size;

    if (duplicateCount > 0) {
        console.log(`🚨 CRITICAL WARNING: Still found ${duplicateCount} duplicate titles after processing!`);
        console.log('Final song list:');
        finalSongs.forEach((song, index) => {
            console.log(`${index + 1}. "${song.title}" by ${song.artist}`);
        });
    } else {
        console.log(`✅ SUCCESS: All ${finalSongs.length} songs have unique titles`);
    }

    return {
        ...playlist,
        songs: finalSongs
    };
};

const generatePlaylistRecommendations = async (usecase, genres, moods, artists, length) => {
    try {
        console.log('🎵 Generating AI-powered genre-specific playlist recommendations...');

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

        const genresText = genres.length > 0 ? genres.join(', ') : 'various genres';
        const moodsText = moods.length > 0 ? moods.join(', ') : 'any mood';

        let artistInstruction = '';
        if (artists && artists.trim()) {
            const artistList = artists.split(',').map(a => a.trim()).filter(a => a.length > 0);
            if (artistList.length > 0) {
                artistInstruction = `
ARTIST PRIORITY: This is CRITICAL - Include songs from these specific artists: ${artistList.join(', ')}.
- MANDATORY: At least 60% of the playlist MUST be from these exact artists
- Find songs from these artists that fit the specified genres and moods
- If these artists don't have enough songs in the specified genre, find their closest songs that match the vibe
- The remaining 40% should be from artists with very similar style/sound within the same genre
- Focus heavily on these preferred artists - they are the main request`;
            }
        } else {
            artistInstruction = `
ARTIST DIVERSITY: Find diverse artists within the specified genres, but ensure all are authentic to the genre.`;
        }

        let specificGenreMoodCombos = [];
        if (genres.length > 0 && moods.length > 0) {
            genres.forEach(genre => {
                moods.forEach(mood => {
                    specificGenreMoodCombos.push(`${mood} ${genre}`);
                });
            });
        }

        const comboText = specificGenreMoodCombos.length > 0
            ? `Focus specifically on these genre-mood combinations: ${specificGenreMoodCombos.join(', ')}. `
            : '';

        const prompt = `Create a playlist of exactly ${trackCount} songs for ${usecase}.

${comboText}The playlist should feature ${genresText} music with ${moodsText} vibes.

${artistInstruction}

🚨 CRITICAL UNIQUENESS REQUIREMENTS - THIS IS MANDATORY:
- ZERO DUPLICATES: Each song title must be completely unique in the playlist
- NO REPEATED TITLES: If "Song A" appears once, it CANNOT appear again by ANY artist
- NO REMIXES/VERSIONS: Don't include "Song - Radio Edit" and "Song - Extended Mix"
- NO SIMILAR TITLES: Avoid songs with nearly identical titles
- VERIFY UNIQUENESS: Before adding each song, check if the title already exists in your response
- EXAMPLE: If you include "Bohemian Rhapsody" by Queen, you CANNOT include any other "Bohemian Rhapsody" by anyone

ULTRA-STRICT GENRE REQUIREMENTS:
- ABSOLUTE GENRE PURITY: Every single song MUST be authentically from the specified genre(s)
- NO CROSSOVER: If I ask for "techno", give me ONLY techno tracks, not house, EDM, or electronic
- NO MAINSTREAM POP: Don't suggest pop songs that "sound like" the genre - find real genre artists
- GENRE AUTHENTICITY: Each song must be recognized by the genre community as belonging to that style
- DEEP CUTS WELCOME: Include both popular and underground tracks that are genuinely from the genre

SONG SELECTION CRITERIA:
- Use ONLY real, existing songs that are available on Spotify
- Mix of different eras within the genre (classic and contemporary)
- Include both mainstream hits and lesser-known gems from the genre
- Ensure track titles and artist names are spelled correctly
- No made-up or fictional songs
- If artists are specified, GUARANTEE at least one song from each specified artist

SPECIAL GENRE HANDLING:
- Lo-Fi: ONLY lo-fi hip-hop, chillhop beats, study music (Nujabes, ChilledCow, j'san, Kupla)
- Ambient: ONLY atmospheric soundscapes, drone music (Brian Eno, Stars of the Lid, Tim Hecker)
- Techno: ONLY real techno music (Carl Cox, Richie Hawtin, Charlotte de Witte, not house or EDM)
- Jazz: ONLY jazz music (Miles Davis, John Coltrane, Bill Evans, not jazz-influenced pop)
- Classical: ONLY classical compositions (Bach, Mozart, Beethoven, contemporary classical)

Return ONLY valid JSON with this exact format:
{
  "playlistName": "Creative Playlist Name",
  "songs": [
    {
      "title": "Exact Song Title",
      "artist": "Exact Artist Name"
    }
  ]
}

CRITICAL: Respond with ONLY the JSON, no additional text or explanation.`;

        console.log('🤖 Sending request to Groq AI for genre-specific recommendations...');

        let aiResponse;
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an expert music curator with deep knowledge of all music genres and artists. You ONLY recommend real, existing songs that are authentically from the specified genres. You never cross genres or suggest mainstream songs that merely 'sound like' a genre. You know thousands of real songs from every genre and always respond with valid JSON only. You prioritize specified artists heavily while maintaining strict genre purity."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "llama3-8b-8192",
                temperature: 0.9,
                max_tokens: 3000,
                top_p: 0.95
            });

            const response = completion.choices[0].message.content;
            console.log('✅ Groq AI response received');

            try {
                let cleanResponse = response;

                if (response.includes('```json')) {
                    cleanResponse = response.split('```json')[1].split('```')[0];
                } else if (response.includes('```')) {
                    cleanResponse = response.split('```')[1];
                }

                const jsonStart = cleanResponse.indexOf('{');
                const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
                }

                aiResponse = JSON.parse(cleanResponse);

                if (!aiResponse.playlistName || !Array.isArray(aiResponse.songs)) {
                    throw new Error('Invalid response structure from AI');
                }

                if (aiResponse.songs.length === 0) {
                    throw new Error('AI returned empty playlist');
                }

                aiResponse = postProcessPlaylist(aiResponse, artists, trackCount);

                console.log(`🎵 AI generated playlist: "${aiResponse.playlistName}" with ${aiResponse.songs.length} songs`);

            } catch (parseError) {
                console.error('❌ Failed to parse AI response:', parseError.message);
                console.log('Raw response:', response);
                throw parseError;
            }
        } catch (aiError) {
            console.error('❌ Groq AI Error:', aiError.message);

            console.log('🔄 Trying simplified AI request...');
            try {
                const simplePrompt = `Generate ${trackCount} ${genresText} songs${artists ? ` featuring ${artists}` : ''}. Response must be valid JSON only:
{
  "playlistName": "Playlist Name",
  "songs": [{"title": "Song Title", "artist": "Artist Name"}]
}`;

                const simpleCompletion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: "You are a music expert. Respond with valid JSON only containing real songs."
                        },
                        {
                            role: "user",
                            content: simplePrompt
                        }
                    ],
                    model: "llama3-8b-8192",
                    temperature: 0.7,
                    max_tokens: 1500
                });

                const simpleResponse = simpleCompletion.choices[0].message.content;
                console.log('Simple AI response:', simpleResponse);

                aiResponse = JSON.parse(simpleResponse);

                if (aiResponse.songs && Array.isArray(aiResponse.songs)) {
                    aiResponse = postProcessPlaylist(aiResponse, artists, trackCount);
                }

                console.log('✅ Simplified AI request successful');

            } catch (simpleError) {
                console.error('❌ Simplified AI request also failed:', simpleError.message);

                aiResponse = {
                    playlistName: `${genresText} Mix for ${usecase}`,
                    songs: [],
                    error: "AI service temporarily unavailable. Please try again."
                };
            }
        }

        return aiResponse;

    } catch (error) {
        console.error('❌ Error generating recommendations:', error.message);
        throw error;
    }
};

const generateFallbackRecommendations = (usecase, genres, moods, artists, trackCount) => {
    const generatePlaylistName = (usecase, genres, moods) => {
        const useCaseNames = {
            'workout': ['Power Hour', 'Beast Mode', 'Gym Fuel', 'Sweat Session', 'High Energy'],
            'work': ['Focus Flow', 'Productivity Boost', 'Deep Work', 'Office Vibes', 'Work Mode'],
            'studying': ['Study Zone', 'Brain Fuel', 'Focus Mode', 'Study Beats', 'Learning Lounge'],
            'relaxing': ['Chill Out', 'Peaceful Moments', 'Zen Mode', 'Calm Vibes', 'Serenity'],
            'sleeping': ['Night Sounds', 'Sleep Waves', 'Dreamscape', 'Bedtime Stories', 'Midnight Calm']
        };

        const moodAdjectives = {
            'happy': ['Bright', 'Sunny', 'Joyful', 'Uplifting', 'Cheerful'],
            'energetic': ['Electric', 'Dynamic', 'High Energy', 'Pumped', 'Charged'],
            'calm': ['Serene', 'Peaceful', 'Tranquil', 'Soothing', 'Gentle'],
            'sad': ['Melancholy', 'Blue', 'Reflective', 'Emotional', 'Somber'],
            'romantic': ['Love Songs', 'Heart Beats', 'Romance', 'Sweet Moments', 'Passion']
        };

        const baseNames = useCaseNames[usecase] || ['Perfect Playlist', 'Music Mix', 'Song Collection', 'Vibe Check'];
        const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];

        if (genres.length > 0 && moods.length > 0) {
            const genre = genres[0];
            const mood = moods[0];
            const adjectives = moodAdjectives[mood];
            if (adjectives) {
                const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                return `${adjective} ${genre.charAt(0).toUpperCase() + genre.slice(1)} ${baseName}`;
            }
        }

        return baseName;
    };

    const playlistName = generatePlaylistName(usecase, genres, moods);

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
            { title: "drivers license", artist: "Olivia Rodrigo" },
            { title: "As It Was", artist: "Harry Styles" },
            { title: "Flowers", artist: "Miley Cyrus" },
            { title: "Cruel Summer", artist: "Taylor Swift" },
            { title: "Don't Start Now", artist: "Dua Lipa" },
            { title: "positions", artist: "Ariana Grande" },
            { title: "34+35", artist: "Ariana Grande" },
            { title: "Peaches", artist: "Justin Bieber" },
            { title: "Leave The Door Open", artist: "Bruno Mars" }
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
            { title: "Paradise City", artist: "Guns N' Roses" },
            { title: "Stairway to Heaven", artist: "Led Zeppelin" },
            { title: "Hotel California", artist: "Eagles" },
            { title: "Free Bird", artist: "Lynyrd Skynyrd" },
            { title: "More Than a Feeling", artist: "Boston" },
            { title: "Come As You Are", artist: "Nirvana" },
            { title: "Black", artist: "Pearl Jam" },
            { title: "Enter Sandman", artist: "Metallica" },
            { title: "Back in Black", artist: "AC/DC" }
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
            { title: "Started From The Bottom", artist: "Drake" },
            { title: "No Role Modelz", artist: "J. Cole" },
            { title: "LOVE.", artist: "Kendrick Lamar" },
            { title: "XO TOUR Llif3", artist: "Lil Uzi Vert" },
            { title: "Lucid Dreams", artist: "Juice WRLD" },
            { title: "Goosebumps", artist: "Travis Scott" },
            { title: "Life Is Good", artist: "Future" },
            { title: "The Box", artist: "Roddy Ricch" },
            { title: "Rockstar", artist: "Post Malone" }
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
            { title: "Ghosts 'n' Stuff", artist: "Deadmau5" },
            { title: "Sandstorm", artist: "Darude" },
            { title: "Alive", artist: "Daft Punk" },
            { title: "Harder Better Faster Stronger", artist: "Daft Punk" },
            { title: "Around the World", artist: "Daft Punk" },
            { title: "Summertime Sadness", artist: "Lana Del Rey" },
            { title: "Safe & Sound", artist: "Capital Cities" },
            { title: "Spectrum", artist: "Zedd" },
            { title: "Stay The Night", artist: "Zedd" }
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
            { title: "All of Me", artist: "Billie Holiday" },
            { title: "My Way", artist: "Frank Sinatra" },
            { title: "Feeling Good", artist: "Nina Simone" },
            { title: "Cheek to Cheek", artist: "Ella Fitzgerald" },
            { title: "Strange Fruit", artist: "Billie Holiday" },
            { title: "Dream a Little Dream", artist: "Ella Fitzgerald" },
            { title: "Georgia on My Mind", artist: "Ray Charles" },
            { title: "Ain't Misbehavin'", artist: "Fats Waller" },
            { title: "Body and Soul", artist: "Coleman Hawkins" }
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
            { title: "1812 Overture", artist: "Tchaikovsky" },
            { title: "Bolero", artist: "Ravel" },
            { title: "Prelude in C Major", artist: "Bach" },
            { title: "Air on the G String", artist: "Bach" },
            { title: "William Tell Overture", artist: "Rossini" },
            { title: "Ode to Joy", artist: "Beethoven" },
            { title: "Spring", artist: "Vivaldi" },
            { title: "Gymnopédie No. 1", artist: "Erik Satie" },
            { title: "Ride of the Valkyries", artist: "Wagner" }
        ],
        country: [
            { title: "Friends in Low Places", artist: "Garth Brooks" },
            { title: "Sweet Caroline", artist: "Neil Diamond" },
            { title: "Take Me Home, Country Roads", artist: "John Denver" },
            { title: "Wagon Wheel", artist: "Darius Rucker" },
            { title: "Before He Cheats", artist: "Carrie Underwood" },
            { title: "Cruise", artist: "Florida Georgia Line" },
            { title: "Body Like a Back Road", artist: "Sam Hunt" },
            { title: "The Good Ones", artist: "Gabby Barrett" },
            { title: "Tennessee Whiskey", artist: "Chris Stapleton" },
            { title: "God's Country", artist: "Blake Shelton" },
            { title: "The Bones", artist: "Maren Morris" },
            { title: "10,000 Hours", artist: "Dan + Shay" },
            { title: "Speechless", artist: "Dan + Shay" },
            { title: "Girl", artist: "Maren Morris" },
            { title: "Heaven", artist: "Kane Brown" },
            { title: "Beautiful Crazy", artist: "Luke Combs" },
            { title: "Hurricane", artist: "Luke Combs" },
            { title: "Heartbreak Hotel", artist: "Elvis Presley" },
            { title: "Ring of Fire", artist: "Johnny Cash" },
            { title: "Jolene", artist: "Dolly Parton" }
        ],
        rnb: [
            { title: "Blinding Lights", artist: "The Weeknd" },
            { title: "Peaches", artist: "Justin Bieber" },
            { title: "Good as Hell", artist: "Lizzo" },
            { title: "Sunflower", artist: "Post Malone" },
            { title: "Circles", artist: "Post Malone" },
            { title: "Adorn", artist: "Miguel" },
            { title: "Golden", artist: "Jill Scott" },
            { title: "Best Part", artist: "Daniel Caesar" },
            { title: "Come Through and Chill", artist: "Miguel" },
            { title: "Get You", artist: "Daniel Caesar" },
            { title: "Earned It", artist: "The Weeknd" },
            { title: "Can't Feel My Face", artist: "The Weeknd" },
            { title: "Starboy", artist: "The Weeknd" },
            { title: "Formation", artist: "Beyoncé" },
            { title: "Crazy in Love", artist: "Beyoncé" },
            { title: "Single Ladies", artist: "Beyoncé" },
            { title: "Love on Top", artist: "Beyoncé" },
            { title: "Truth Hurts", artist: "Lizzo" },
            { title: "Juice", artist: "Lizzo" },
            { title: "About Damn Time", artist: "Lizzo" }
        ],
        reggae: [
            { title: "No Woman No Cry", artist: "Bob Marley" },
            { title: "Three Little Birds", artist: "Bob Marley" },
            { title: "One Love", artist: "Bob Marley" },
            { title: "Is This Love", artist: "Bob Marley" },
            { title: "Could You Be Loved", artist: "Bob Marley" },
            { title: "Buffalo Soldier", artist: "Bob Marley" },
            { title: "I Shot the Sheriff", artist: "Bob Marley" },
            { title: "Get Up, Stand Up", artist: "Bob Marley" },
            { title: "Red Red Wine", artist: "UB40" },
            { title: "Can't Help Myself", artist: "UB40" },
            { title: "Kingston Town", artist: "UB40" },
            { title: "The Tide Is High", artist: "Blondie" },
            { title: "Electric Avenue", artist: "Eddy Grant" },
            { title: "Here Comes the Hotstepper", artist: "Ini Kamoze" },
            { title: "Police and Thieves", artist: "The Clash" },
            { title: "Legalize It", artist: "Peter Tosh" },
            { title: "Many Rivers to Cross", artist: "Jimmy Cliff" },
            { title: "The Harder They Come", artist: "Jimmy Cliff" },
            { title: "Pass the Dutchie", artist: "Musical Youth" },
            { title: "Israelites", artist: "Desmond Dekker" }
        ],
        metal: [
            { title: "Enter Sandman", artist: "Metallica" },
            { title: "Master of Puppets", artist: "Metallica" },
            { title: "One", artist: "Metallica" },
            { title: "Nothing Else Matters", artist: "Metallica" },
            { title: "Paranoid", artist: "Black Sabbath" },
            { title: "Iron Man", artist: "Black Sabbath" },
            { title: "War Pigs", artist: "Black Sabbath" },
            { title: "Crazy Train", artist: "Ozzy Osbourne" },
            { title: "Mr. Crowley", artist: "Ozzy Osbourne" },
            { title: "Cemetery Gates", artist: "Pantera" },
            { title: "Walk", artist: "Pantera" },
            { title: "Holy Wars", artist: "Megadeth" },
            { title: "Peace Sells", artist: "Megadeth" },
            { title: "Ace of Spades", artist: "Motörhead" },
            { title: "Breaking the Law", artist: "Judas Priest" },
            { title: "Painkiller", artist: "Judas Priest" },
            { title: "Run to the Hills", artist: "Iron Maiden" },
            { title: "The Number of the Beast", artist: "Iron Maiden" },
            { title: "Hallowed Be Thy Name", artist: "Iron Maiden" },
            { title: "Chop Suey!", artist: "System of a Down" }
        ],
        lofi: [
            { title: "In Love", artist: "Kina" },
            { title: "Snowman", artist: "WYS" },
            { title: "Coffee", artist: "Kainbeats" },
            { title: "Rainy Days", artist: "Lofi Hip Hop" },
            { title: "Study Session", artist: "ChilledCow" },
            { title: "Midnight", artist: "Philanthrope" },
            { title: "Warm Nights", artist: "Idealism" },
            { title: "Morning Coffee", artist: "Sleepy Fish" },
            { title: "Lazy Sunday", artist: "Kupla" },
            { title: "Dreamscape", artist: "eazykill" },
            { title: "Sunset", artist: "Lomea" },
            { title: "Memories", artist: "Vanilla" },
            { title: "Focus", artist: "j'san" },
            { title: "Chill Vibes", artist: "Steezy Prime" },
            { title: "Study Time", artist: "Lofi Fruits Music" },
            { title: "Peaceful Mind", artist: "Purrple Cat" },
            { title: "Gentle Rain", artist: "Globular" },
            { title: "Café Atmosphere", artist: "Masked Man" },
            { title: "Homework", artist: "Jinsang" },
            { title: "Relax", artist: "Jhfly" }
        ],
        ambient: [
            { title: "Music for Airports", artist: "Brian Eno" },
            { title: "An Ending (Ascent)", artist: "Brian Eno" },
            { title: "Stars of the Lid", artist: "Stars of the Lid" },
            { title: "Discreet Music", artist: "Brian Eno" },
            { title: "Sleep", artist: "Max Richter" },
            { title: "The Blue Notebooks", artist: "Max Richter" },
            { title: "Substrata", artist: "Biosphere" },
            { title: "Ambient 1", artist: "Brian Eno" },
            { title: "Overgrown", artist: "James Blake" },
            { title: "Selected Ambient Works", artist: "Aphex Twin" },
            { title: "Immunity", artist: "Jon Hopkins" },
            { title: "Weightless", artist: "Marconi Union" },
            { title: "Polar Sequence", artist: "Biosphere" },
            { title: "Music for Films", artist: "Brian Eno" },
            { title: "Ambient Works", artist: "Aphex Twin" },
            { title: "Thursday Afternoon", artist: "Brian Eno" },
            { title: "Apollo", artist: "Brian Eno" },
            { title: "Lux", artist: "Brian Eno" },
            { title: "Reflection", artist: "Brian Eno" },
            { title: "Slow Movement", artist: "Trent Reznor" }
        ],
        chillhop: [
            { title: "Bliss", artist: "Mura Masa" },
            { title: "Shiloh", artist: "Shiloh Dynasty" },
            { title: "Nymph", artist: "Hiatus Kaiyote" },
            { title: "Sundial", artist: "Noname" },
            { title: "Aqueous", artist: "FloFilz" },
            { title: "Golden", artist: "joji" },
            { title: "Feather", artist: "Nujabes" },
            { title: "Aruarian Dance", artist: "Nujabes" },
            { title: "Modal Soul", artist: "Nujabes" },
            { title: "Mystline", artist: "Nujabes" },
            { title: "Blessing It", artist: "Nujabes" },
            { title: "Luv(sic)", artist: "Nujabes" },
            { title: "Horizon", artist: "Tycho" },
            { title: "A Walk", artist: "Tycho" },
            { title: "Montana", artist: "Tycho" },
            { title: "Dive", artist: "Tycho" },
            { title: "Elegy", artist: "Tycho" },
            { title: "Past Is Prologue", artist: "Tycho" },
            { title: "Coastal Brake", artist: "Tycho" },
            { title: "Daydream", artist: "Tycho" }
        ],
        study: [
            { title: "Lofi Study", artist: "ChilledCow" },
            { title: "Focus Music", artist: "Brain.fm" },
            { title: "Study Beats", artist: "Lofi Hip Hop" },
            { title: "Concentration", artist: "StudyMD" },
            { title: "Brain Food", artist: "Focus Music" },
            { title: "Deep Focus", artist: "Spotify" },
            { title: "Study Session", artist: "Lofi Fruits Music" },
            { title: "Productive", artist: "Study Music" },
            { title: "Mental Clarity", artist: "Focus Sounds" },
            { title: "Academic Flow", artist: "Study Vibes" },
            { title: "Reading Time", artist: "Calm Study" },
            { title: "Library Vibes", artist: "Silent Study" },
            { title: "Homework Help", artist: "Study Beats" },
            { title: "Exam Prep", artist: "Focus Flow" },
            { title: "Learning Mode", artist: "Study Music Project" },
            { title: "Think Tank", artist: "Brain Waves" },
            { title: "Scholar", artist: "Academic Music" },
            { title: "Mind Palace", artist: "Memory Music" },
            { title: "Study Hall", artist: "Education Sounds" },
            { title: "Wisdom", artist: "Learning Beats" }
        ],
        nature: [
            { title: "Rain Sounds", artist: "Nature Sounds" },
            { title: "Ocean Waves", artist: "Relaxing Sounds" },
            { title: "Forest Ambience", artist: "Nature Audio" },
            { title: "Thunderstorm", artist: "Weather Sounds" },
            { title: "Bird Songs", artist: "Nature Collection" },
            { title: "Waterfall", artist: "Natural Sounds" },
            { title: "Wind in Trees", artist: "Forest Sounds" },
            { title: "Creek Flowing", artist: "Water Sounds" },
            { title: "Campfire", artist: "Cozy Sounds" },
            { title: "Morning Birds", artist: "Dawn Chorus" },
            { title: "Gentle Rain", artist: "Sleep Sounds" },
            { title: "Mountain Stream", artist: "Nature Therapy" },
            { title: "Night Forest", artist: "Peaceful Nature" },
            { title: "Lake Waves", artist: "Calm Waters" },
            { title: "Desert Wind", artist: "Ambient Nature" },
            { title: "Jungle Sounds", artist: "Tropical Nature" },
            { title: "Snow Falling", artist: "Winter Sounds" },
            { title: "Spring Rain", artist: "Season Sounds" },
            { title: "Countryside", artist: "Rural Ambience" },
            { title: "Seashore", artist: "Coastal Sounds" }
        ],
        whitenoise: [
            { title: "White Noise", artist: "White Noise Baby Sleep" },
            { title: "Pink Noise", artist: "Sleep Sounds" },
            { title: "Brown Noise", artist: "Focus Sounds" },
            { title: "Fan Noise", artist: "Sleep Aid" },
            { title: "Air Conditioner", artist: "Background Noise" },
            { title: "Static", artist: "White Noise Generator" },
            { title: "Vacuum Cleaner", artist: "Household Sounds" },
            { title: "Hair Dryer", artist: "Consistent Noise" },
            { title: "TV Static", artist: "Retro Sounds" },
            { title: "Radio Static", artist: "Static Sounds" },
            { title: "Deep Sleep", artist: "Sleep Therapy" },
            { title: "Focus Noise", artist: "Concentration Aid" },
            { title: "Blocking Sound", artist: "Noise Masking" },
            { title: "Study Noise", artist: "Academic Focus" },
            { title: "Work Sounds", artist: "Office Ambience" },
            { title: "Meditation Noise", artist: "Mindfulness Sounds" },
            { title: "Tinnitus Relief", artist: "Hearing Therapy" },
            { title: "Baby Sleep", artist: "Infant Care" },
            { title: "Relaxation", artist: "Stress Relief" },
            { title: "Calm Mind", artist: "Mental Peace" }
        ],
        instrumental: [
            { title: "River Flows in You", artist: "Yiruma" },
            { title: "Kiss the Rain", artist: "Yiruma" },
            { title: "Comptine d'un autre été", artist: "Yann Tiersen" },
            { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
            { title: "Una Mattina", artist: "Ludovico Einaudi" },
            { title: "Divenire", artist: "Ludovico Einaudi" },
            { title: "Primavera", artist: "Ludovico Einaudi" },
            { title: "Canon in D", artist: "Johann Pachelbel" },
            { title: "Clair de Lune", artist: "Claude Debussy" },
            { title: "Gymnopedie No. 1", artist: "Erik Satie" },
            { title: "Spiegel im Spiegel", artist: "Arvo Pärt" },
            { title: "On the Nature of Daylight", artist: "Max Richter" },
            { title: "Written on the Sky", artist: "Max Richter" },
            { title: "Experience", artist: "Ludovico Einaudi" },
            { title: "Elegy for Dunkirk", artist: "Dario Marianelli" },
            { title: "Metamorphosis", artist: "Philip Glass" },
            { title: "Opening", artist: "Philip Glass" },
            { title: "Mad Rush", artist: "Philip Glass" },
            { title: "Für Elise", artist: "Ludwig van Beethoven" },
            { title: "Moonlight Sonata", artist: "Ludwig van Beethoven" }
        ]
    };

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

    let selectedTracks = [];

    if (artists && artists.trim()) {
        const artistList = artists.split(',').map(a => a.trim().toLowerCase()).filter(a => a.length > 0);
        const artistTrackCount = Math.ceil(trackCount * 0.4);
        let artistTracks = [];

        Object.values(trackDatabase).forEach(genreTracks => {
            genreTracks.forEach(track => {
                const trackArtist = track.artist.toLowerCase();
                if (artistList.some(artist => trackArtist.includes(artist) || artist.includes(trackArtist))) {
                    artistTracks.push(track);
                }
            });
        });

        const uniqueArtistTracks = artistTracks.filter((track, index, self) =>
            index === self.findIndex(t => t.title === track.title && t.artist === track.artist)
        );

        for (let i = uniqueArtistTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueArtistTracks[i], uniqueArtistTracks[j]] = [uniqueArtistTracks[j], uniqueArtistTracks[i]];
        }

        selectedTracks = uniqueArtistTracks.slice(0, Math.min(artistTrackCount, uniqueArtistTracks.length));
        console.log(`🎵 Selected ${selectedTracks.length} tracks from specified artists: ${artists}`);
    }

    const remainingForGenres = trackCount - selectedTracks.length;
    if (genres.length > 0 && remainingForGenres > 0) {
        const genreTrackCount = Math.ceil(remainingForGenres * 0.7);
        let genreTracks = [];

        genres.forEach(genre => {
            if (trackDatabase[genre]) {
                genreTracks = genreTracks.concat(trackDatabase[genre]);
            }
        });

        const filteredGenreTracks = genreTracks.filter(track =>
            !selectedTracks.some(selected =>
                selected.title === track.title && selected.artist === track.artist
            )
        );

        const uniqueGenreTracks = filteredGenreTracks.filter((track, index, self) =>
            index === self.findIndex(t => t.title === track.title && t.artist === track.artist)
        );

        for (let i = uniqueGenreTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueGenreTracks[i], uniqueGenreTracks[j]] = [uniqueGenreTracks[j], uniqueGenreTracks[i]];
        }

        const genreTracksToAdd = uniqueGenreTracks.slice(0, Math.min(genreTrackCount, uniqueGenreTracks.length));
        selectedTracks = selectedTracks.concat(genreTracksToAdd);
        console.log(`🎵 Added ${genreTracksToAdd.length} tracks from genres: ${genres.join(', ')}`);
    }

    const remainingSlots = trackCount - selectedTracks.length;
    if (remainingSlots > 0) {
        let additionalTracks = [];

        if (useCaseTracks[usecase]) {
            additionalTracks = additionalTracks.concat(useCaseTracks[usecase]);
        }

        if (moods.length > 0) {
            moods.forEach(mood => {
                if (moodTracks[mood]) {
                    additionalTracks = additionalTracks.concat(moodTracks[mood]);
                }
            });
        }

        const filteredAdditional = additionalTracks.filter(track =>
            !selectedTracks.some(selected =>
                selected.title === track.title && selected.artist === track.artist
            )
        );

        const uniqueAdditional = filteredAdditional.filter((track, index, self) =>
            index === self.findIndex(t => t.title === track.title && t.artist === track.artist)
        );

        for (let i = uniqueAdditional.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueAdditional[i], uniqueAdditional[j]] = [uniqueAdditional[j], uniqueAdditional[i]];
        }

        selectedTracks = selectedTracks.concat(uniqueAdditional.slice(0, remainingSlots));
        console.log(`🎵 Added ${Math.min(remainingSlots, uniqueAdditional.length)} tracks from use case/mood`);
    }

    const stillNeedMore = trackCount - selectedTracks.length;
    if (stillNeedMore > 0) {
        let fallbackTracks = [];

        if (genres.length > 0) {
            genres.forEach(genre => {
                if (trackDatabase[genre]) {
                    fallbackTracks = fallbackTracks.concat(trackDatabase[genre]);
                }
            });
        }

        if (fallbackTracks.length === 0) {
            fallbackTracks = [
                ...trackDatabase.pop,
                ...trackDatabase.rock.slice(0, 4),
                ...moodTracks.happy
            ];
        }

        const filteredFallback = fallbackTracks.filter(track =>
            !selectedTracks.some(selected =>
                selected.title === track.title && selected.artist === track.artist
            )
        );

        if (filteredFallback.length > 0) {
            for (let i = filteredFallback.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [filteredFallback[i], filteredFallback[j]] = [filteredFallback[j], filteredFallback[i]];
            }

            selectedTracks = selectedTracks.concat(filteredFallback.slice(0, stillNeedMore));
        }

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
            ].filter(track =>
                !selectedTracks.some(selected =>
                    selected.title === track.title && selected.artist === track.artist
                )
            );

            const needed = trackCount - selectedTracks.length;
            selectedTracks = selectedTracks.concat(morePopular.slice(0, needed));
        }
    }

    for (let i = selectedTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selectedTracks[i], selectedTracks[j]] = [selectedTracks[j], selectedTracks[i]];
    }

    console.log(`✅ Generated ${selectedTracks.length} song recommendations for "${playlistName}"`);

    return {
        playlistName: playlistName,
        songs: selectedTracks.slice(0, trackCount)
    };
};

const generatePlaylistImage = async (playlistName, usecase, genres, moods) => {
    try {
        console.log('🎨 Generating playlist image...');

        const searchTerms = [];

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

        if (searchTerms.length === 0) {
            searchTerms.push('music', 'headphones', 'sound', 'audio', 'vinyl', 'abstract');
        }

        const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

        const imageSources = [
            `https://picsum.photos/400/400?random=${Date.now()}`,
            `https://source.unsplash.com/400x400/?${searchTerm}`,
            `https://picsum.photos/400/400?grayscale&blur=1&random=${Date.now() + 1}`,
            `https://via.placeholder.com/400x400/8a3d1b/f5f1f0?text=${encodeURIComponent(playlistName.slice(0, 20))}`
        ];

        const selectedImage = imageSources[0];

        console.log(`✅ Generated playlist cover (search: ${searchTerm})`);

        return selectedImage;

    } catch (error) {
        console.error('❌ Error generating image:', error.message);
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#8a3d1b;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#eb5f1f;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="400" height="400" fill="url(#grad)" />
                <text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">
                    ${playlistName.slice(0, 15)}
                </text>
            </svg>
        `)}`;
    }
};

module.exports = {
    generatePlaylistRecommendations,
    generatePlaylistImage
};
