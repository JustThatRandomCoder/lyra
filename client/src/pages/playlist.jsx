import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'
import '../styles/playlist.css';

const containerVariants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.2
        }
    }
};

function Playlist() {
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
                <div className="playlist-header">
                    <div className="cover"></div>
                    <div className="information-container">
                        <div className="title">Your VibeMix Playlist</div>
                        <div className="general">
                            <div className="tag">
                                <span>🎧</span><span>20 Songs</span>
                            </div>
                            <div className="tag">
                                <span>⏱️</span><span>65 Minutes</span>
                            </div>
                        </div>
                        <div className="tag add"><span>💿</span><span>Add to Spotify</span></div>
                    </div>
                </div>
            </motion.div>
            <div className={`gradient ${showBottomGradient ? 'visible' : ''}`}></div>
        </main>
    )
}

export default Playlist
