import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/playlist.css';

const containerVariants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.15
        }
    }
};

const songVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 1
        }
    },
    hover: {
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: {
        scale: 0.98,
        transition: { type: "spring", stiffness: 500, damping: 30 }
    }
};

const headerVariants = {
    initial: { opacity: 0, y: -30, scale: 0.9 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 30,
            delay: 0.05
        }
    }
};

const imageVariants = {
    initial: { opacity: 0, scale: 0.8, rotate: -5 },
    animate: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: 0.1
        }
    },
    hover: {
        scale: 1.05,
        rotate: 2,
        transition: { type: "spring", stiffness: 400, damping: 25 }
    }
};

const buttonVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 30,
            delay: 0.3
        }
    },
    hover: {
        scale: 1.05,
        transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: {
        scale: 0.95,
        transition: { type: "spring", stiffness: 500, damping: 30 }
    }
};

const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

const notificationVariants = {
    initial: { opacity: 0, scale: 0.8, y: 50 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 500,
            damping: 30
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 50,
        transition: { duration: 0.2 }
    }
};

function Playlist() {
    const navigate = useNavigate();
    const [showTopGradient, setShowTopGradient] = useState(false);
    const [showBottomGradient, setShowBottomGradient] = useState(true);
    const [playlistData, setPlaylistData] = useState(null);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const [notification, setNotification] = useState(null);
    const [playlistAdded, setPlaylistAdded] = useState(false);

    useEffect(() => {
        // Load playlist data from localStorage
        const storedData = localStorage.getItem('generatedPlaylist');
        if (storedData) {
            setPlaylistData(JSON.parse(storedData));
        } else {
            // No playlist data, redirect to home
            navigate('/home');
        }

        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;

            setShowTopGradient(scrollTop > 0);
            setShowBottomGradient(scrollTop + clientHeight < scrollHeight);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [navigate]);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleAddToSpotify = async () => {
        const accessToken = localStorage.getItem('spotify_access_token');

        if (!accessToken) {
            showNotification('error', 'Please connect to Spotify first');
            setTimeout(() => navigate('/'), 2000);
            return;
        }

        if (!playlistData) {
            showNotification('error', 'No playlist data available');
            return;
        }

        setIsCreatingPlaylist(true);

        try {
            const response = await fetch('/api/spotify/create-playlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playlistName: playlistData.playlistName,
                    tracks: playlistData.tracks,
                    accessToken: accessToken
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create playlist');
            }

            const data = await response.json();

            // Mark playlist as successfully added
            setPlaylistAdded(true);

            // Show success notification
            showNotification('success', 'Playlist created successfully! 🎉');

            // Open Spotify playlist in new tab
            if (data.playlistUrl) {
                setTimeout(() => {
                    window.open(data.playlistUrl, '_blank');
                }, 1000);
            }

            // Clear stored data after successful creation
            localStorage.removeItem('generatedPlaylist');

        } catch (error) {
            console.error('Error creating playlist:', error);
            showNotification('error', 'Failed to create playlist. Please try again.');
        } finally {
            setIsCreatingPlaylist(false);
        }
    };

    const handleBackToHome = () => {
        navigate('/home');
    };

    if (!playlistData) {
        return (
            <motion.div
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="loading-spinner"
                >
                    🎵
                </motion.div>
                <p>Loading your playlist...</p>
            </motion.div>
        );
    }

    return (
        <main>
            <motion.div
                className={`gradient-top ${showTopGradient ? 'visible' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: showTopGradient ? 0.7 : 0 }}
                transition={{ duration: 0.3 }}
            />

            <motion.h1
                className='headline'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Your Playlist
            </motion.h1>

            <motion.div
                className='container'
                initial="initial"
                animate="animate"
                variants={containerVariants}
            >
                <motion.div
                    className="playlist-header"
                    variants={headerVariants}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div
                        className="cover"
                        variants={imageVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        style={{
                            backgroundImage: playlistData.playlistImage ?
                                `url(${playlistData.playlistImage})` :
                                playlistData.tracks[0]?.cover_url ?
                                    `url(${playlistData.tracks[0].cover_url})` :
                                    'linear-gradient(90deg, var(--primary-800), var(--primary-900))',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />

                    <motion.div
                        className="information-container"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <motion.div
                            className="title"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            {playlistData.playlistName}
                        </motion.div>

                        <motion.div
                            className="general"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <motion.div
                                className="tag"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <span>🎧</span><span>{playlistData.totalTracks} Songs</span>
                            </motion.div>
                            <motion.div
                                className="tag"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <span>⏱️</span><span>{playlistData.totalDuration} Minutes</span>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="button-container"
                        >
                            {!playlistAdded ? (
                                <motion.button
                                    className="tag add"
                                    onClick={handleAddToSpotify}
                                    disabled={isCreatingPlaylist}
                                    variants={buttonVariants}
                                    initial="initial"
                                    animate="animate"
                                    whileHover={!isCreatingPlaylist ? "hover" : {}}
                                    whileTap={!isCreatingPlaylist ? "tap" : {}}
                                >
                                    <motion.span
                                        animate={isCreatingPlaylist ? { rotate: 360 } : {}}
                                        transition={isCreatingPlaylist ? {
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear"
                                        } : {}}
                                    >
                                        {isCreatingPlaylist ? '⏳' : '💿'}
                                    </motion.span>
                                    <span>{isCreatingPlaylist ? 'Creating...' : 'Add to Spotify'}</span>
                                </motion.button>
                            ) : (
                                <motion.button
                                    className="tag back add"
                                    onClick={handleBackToHome}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <span>🏠</span>
                                    <span>Create Another Playlist</span>
                                </motion.button>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="song-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    {playlistData.tracks.map((track, index) => (
                        <motion.div
                            key={track.id}
                            className="song-outer"
                            variants={songVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <motion.div className="song-inner">
                                <motion.div
                                    className="cover"
                                    whileHover={{
                                        scale: 1.1,
                                        transition: { type: "spring", stiffness: 500, damping: 25 }
                                    }}
                                    style={{
                                        backgroundImage: track.cover_url ?
                                            `url(${track.cover_url})` :
                                            'linear-gradient(90deg, var(--primary-800), var(--primary-900))',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />
                                <motion.div
                                    className="song-data"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.02 }}
                                >
                                    <motion.div
                                        className="title"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 + index * 0.02 }}
                                    >
                                        {track.name}
                                    </motion.div>
                                    <motion.div
                                        className="artist"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 + index * 0.02 }}
                                    >
                                        {track.artist}
                                    </motion.div>
                                </motion.div>
                                <motion.div
                                    className="duration"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 + index * 0.02 }}
                                >
                                    {track.durationFormatted}
                                </motion.div>
                            </motion.div>
                            <motion.hr
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                    delay: 0.5 + index * 0.02,
                                    duration: 0.3,
                                    ease: "easeOut"
                                }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            <motion.div
                className={`gradient ${showBottomGradient ? 'visible' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: showBottomGradient ? 0.7 : 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Notification Overlay */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        className="notification-overlay"
                        variants={overlayVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <motion.div
                            className={`notification ${notification.type}`}
                            variants={notificationVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <div className="notification-content">
                                <span className="notification-icon">
                                    {notification.type === 'success' ? '✅' : '❌'}
                                </span>
                                <span className="notification-message">
                                    {notification.message}
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

export default Playlist
