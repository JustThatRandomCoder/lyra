import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const TAGS = [
    { emoji: "🏋️", text: "workout" },
    { emoji: "👔", text: "work" },
    { emoji: "📚", text: "studying" },
    { emoji: "🛋️", text: "relaxing" },
    { emoji: "🛌", text: "sleeping" }
];

const containerVariants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.2
        }
    }
};

const tagVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
    hover: { scale: 1.02 },
    tap: { scale: 0.97 }
};

const GENRES = [
    { value: "pop", label: "Pop" },
    { value: "rock", label: "Rock" },
    { value: "hiphop", label: "Hip-Hop" },
    { value: "jazz", label: "Jazz" },
    { value: "classical", label: "Classical" },
    { value: "electronic", label: "Electronic" },
    { value: "country", label: "Country" },
    { value: "reggae", label: "Reggae" },
    { value: "blues", label: "Blues" },
    { value: "metal", label: "Metal" },
    { value: "folk", label: "Folk" },
    { value: "rnb", label: "R&B" },
    { value: "soul", label: "Soul" },
    { value: "punk", label: "Punk" },
    { value: "indie", label: "Indie" },
    { value: "funk", label: "Funk" },
    { value: "disco", label: "Disco" },
    { value: "latin", label: "Latin" },
    { value: "house", label: "House" },
    { value: "techno", label: "Techno" }
];

const MOODS = [
    { value: "happy", label: "Happy" },
    { value: "sad", label: "Sad" },
    { value: "energetic", label: "Energetic" },
    { value: "calm", label: "Calm" },
    { value: "romantic", label: "Romantic" },
    { value: "melancholic", label: "Melancholic" },
    { value: "upbeat", label: "Upbeat" },
    { value: "chill", label: "Chill" },
    { value: "aggressive", label: "Aggressive" },
    { value: "nostalgic", label: "Nostalgic" },
    { value: "motivated", label: "Motivated" },
    { value: "peaceful", label: "Peaceful" }
];

function Home() {
    const navigate = useNavigate();
    const [usecase, setUsecase] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [artists, setArtists] = useState('');
    const [length, setLength] = useState('');
    const [showTopGradient, setShowTopGradient] = useState(false);
    const [showBottomGradient, setShowBottomGradient] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;

            setShowTopGradient(scrollTop > 0);
            setShowBottomGradient(scrollTop + clientHeight < scrollHeight);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleTagClick = (idx, text) => {
        setUsecase(text);
        setSelectedTag(idx);
    };

    const handleInputChange = (e) => {
        setUsecase(e.target.value);
        setSelectedTag(null);
    };

    const handleGenreToggle = (genreValue) => {
        setSelectedGenres(prev => {
            if (prev.includes(genreValue)) {
                return prev.filter(g => g !== genreValue);
            } else {
                return [...prev, genreValue];
            }
        });
    };

    const isGenreSelected = (genreValue) => {
        return selectedGenres.includes(genreValue);
    };

    const handleMoodToggle = (moodValue) => {
        setSelectedMoods(prev => {
            if (prev.includes(moodValue)) {
                return prev.filter(m => m !== moodValue);
            } else {
                return [...prev, moodValue];
            }
        });
    };

    const isMoodSelected = (moodValue) => {
        return selectedMoods.includes(moodValue);
    };

    const handleArtistsChange = (e) => {
        setArtists(e.target.value);
    };

    const handleLengthChange = (e) => {
        setLength(e.target.value);
    };

    const isFormValid = () => {
        return usecase.trim() !== '' &&
            selectedGenres.length > 0 &&
            selectedMoods.length > 0;
        // Artists and length are now optional
    };

    const handleNextClick = async () => {
        if (!isFormValid()) return;

        const payload = {
            usecase: usecase.trim(),
            genre: selectedGenres,
            mood: selectedMoods,
            artists: artists.trim(),
            length: length.trim()
        };

        try {
            const res = await fetch('/api/spotify/generate-playlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            console.log("🎧 Playlist generated:", data);

            // Store the playlist data and redirect to playlist page
            localStorage.setItem('generatedPlaylist', JSON.stringify(data));
            navigate('/playlist');

        } catch (err) {
            console.error("❌ Error generating playlist:", err);
        }
    };





    return (
        <main>
            <div className={`gradient-top ${showTopGradient ? 'visible' : ''}`}></div>
            <motion.h1
                className='headline'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Create
            </motion.h1>
            <motion.div
                className='container'
                initial="initial"
                animate="animate"
                variants={containerVariants}
            >
                <motion.div className="usecase" variants={tagVariants}>
                    <motion.div className="input-gradient-border" variants={tagVariants}>
                        <motion.input
                            placeholder="What is the playlist for?"
                            value={selectedTag === null ? usecase : ''}
                            onChange={handleInputChange}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                        />
                    </motion.div>
                    <motion.div
                        className='tag-container'
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                    >
                        {TAGS.map((tag, idx) => (
                            <motion.div
                                key={tag.text}
                                className="tag"
                                variants={tagVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => handleTagClick(idx, tag.text)}
                                style={{
                                    backgroundColor: selectedTag === idx
                                        ? 'var(--secondary-700)'
                                        : undefined
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 22
                                }}
                            >
                                <span>{tag.emoji}</span>
                                <span>{tag.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
                <motion.div className="usecase" variants={tagVariants}>
                    <motion.h2
                        className='headline'
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Genre
                    </motion.h2>
                    <motion.div
                        className='tag-container genres'
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                    >
                        {GENRES.map((genre) => (
                            <motion.div
                                key={genre.value}
                                className="tag"
                                variants={tagVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => handleGenreToggle(genre.value)}
                                style={{
                                    backgroundColor: isGenreSelected(genre.value)
                                        ? 'var(--secondary-700)'
                                        : undefined
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 22
                                }}
                            >
                                <span>{genre.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.input
                        type="hidden"
                        value={selectedGenres.join(',')}
                    />
                </motion.div>
                <motion.div className="usecase" variants={tagVariants}>
                    <motion.h2
                        className='headline'
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Mood
                    </motion.h2>
                    <motion.div
                        className='tag-container moods'
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                    >
                        {MOODS.map((mood) => (
                            <motion.div
                                key={mood.value}
                                className="tag"
                                variants={tagVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => handleMoodToggle(mood.value)}
                                style={{
                                    backgroundColor: isMoodSelected(mood.value)
                                        ? 'var(--secondary-700)'
                                        : undefined
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 22
                                }}
                            >
                                <span>{mood.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.input
                        type="hidden"
                        value={selectedMoods.join(',')}
                    />
                </motion.div>
                <motion.div className="usecase" variants={tagVariants}>
                    <motion.h2
                        className='headline'
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Playlist Length (Optional)
                    </motion.h2>
                    <motion.div
                        className='tag-container lengths'
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                    >
                        {[
                            { value: "short", label: "Quick Mix", emoji: "⚡", desc: "~10 songs" },
                            { value: "medium", label: "Standard", emoji: "🎵", desc: "~20 songs" },
                            { value: "long", label: "Extended", emoji: "🎧", desc: "~40 songs" }
                        ].map((lengthOption) => (
                            <motion.div
                                key={lengthOption.value}
                                className="tag length-tag"
                                variants={tagVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => setLength(lengthOption.value)}
                                style={{
                                    backgroundColor: length === lengthOption.value
                                        ? 'var(--secondary-700)'
                                        : undefined
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 22
                                }}
                            >
                                <span>{lengthOption.emoji}</span>
                                <div className="length-info">
                                    <span className="length-label">{lengthOption.label}</span>
                                    <span className="length-desc">{lengthOption.desc}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
                <motion.div className="input-row" variants={tagVariants}>
                    <motion.div className="input-gradient-border" variants={tagVariants}>
                        <motion.input
                            placeholder="What artists do you prefer? (Optional)"
                            value={artists}
                            onChange={handleArtistsChange}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>
            <motion.div
                className="btn-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <motion.button
                    whileHover={isFormValid() ? { scale: 1.02 } : {}}
                    whileTap={isFormValid() ? { scale: 0.97 } : {}}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22
                    }}
                    disabled={!isFormValid()}
                    onClick={handleNextClick}
                    animate={{
                        opacity: isFormValid() ? 1 : 0.5
                    }}
                    style={{
                        cursor: isFormValid() ? 'pointer' : 'not-allowed'
                    }}
                    initial={false}
                >
                    Next
                </motion.button>
            </motion.div>
            <div className={`gradient ${showBottomGradient ? 'visible' : ''}`}></div>
        </main>
    )
}

export default Home
