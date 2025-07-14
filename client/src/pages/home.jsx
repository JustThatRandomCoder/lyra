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

function Home() {
    const [usecase, setUsecase] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);

    const tagVariants = {
        hover: { scale: 1.02 },
        tap: { scale: 0.97 }
    };
    const tagTransition = {
        type: "spring",
        stiffness: 400,
        damping: 22
    };

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
            <h1 className='headline'>Create</h1>
            <div className='container'>
                <div className="usecase">
                    <div className="input-gradient-border">
                        <input
                            placeholder="What is the playlist for?"
                            value={selectedTag === null ? usecase : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className='tag-container'>
                        {TAGS.map((tag, idx) => (
                            <motion.div
                                key={tag.text}
                                className="tag"
                                whileHover="hover"
                                whileTap="tap"
                                variants={tagVariants}
                                transition={tagTransition}
                                onClick={() => handleTagClick(idx, tag.text)}
                                style={{
                                    backgroundColor: selectedTag === idx
                                        ? 'var(--secondary-700)'
                                        : undefined
                                }}
                            >
                                <span>{tag.emoji}</span>
                                <span>{tag.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="btn-container">
                <motion.button
                    whileHover={{
                        scale: 1.02,
                    }}
                    whileTap={{
                        scale: 0.97,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22
                    }}
                >
                    Next
                </motion.button>
            </div>
        </main>
    )
}

export default Home
