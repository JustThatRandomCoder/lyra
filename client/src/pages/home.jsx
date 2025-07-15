import { useState } from 'react';
import { motion } from 'framer-motion'
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
    const [usecase, setUsecase] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedMoods, setSelectedMoods] = useState([]);

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



    return (
        <main>
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
            </motion.div>
            <motion.div
                className="btn-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22
                    }}
                >
                    Next
                </motion.button>
            </motion.div>
        </main>
    )
}

export default Home
