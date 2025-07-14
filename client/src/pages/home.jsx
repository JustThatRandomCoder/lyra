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

function Home() {
    const [usecase, setUsecase] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);

    const handleTagClick = (idx, text) => {
        setUsecase(text);
        setSelectedTag(idx);
    };

    const handleInputChange = (e) => {
        setUsecase(e.target.value);
        setSelectedTag(null);
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
