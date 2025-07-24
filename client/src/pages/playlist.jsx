import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

const songVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

function Playlist() {
    const navigate = useNavigate();
    const [showTopGradient, setShowTopGradient] = useState(false);
    const [showBottomGradient, setShowBottomGradient] = useState(true);
    const [playlistData, setPlaylistData] = useState(null);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

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

    const handleAddToSpotify = async () => {
        const accessToken = localStorage.getItem('spotify_access_token');

        if (!accessToken) {
            alert('Please connect to Spotify first');
            navigate('/');
            return;
        }

        if (!playlistData) {
            alert('No playlist data available');
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

            // Open Spotify playlist in new tab
            if (data.playlistUrl) {
                window.open(data.playlistUrl, '_blank');
            }

            // Clear stored data
            localStorage.removeItem('generatedPlaylist');

            alert('Playlist created successfully and added to your Spotify library!');
            navigate('/home');

        } catch (error) {
            console.error('Error creating playlist:', error);
            alert('Failed to create playlist. Please try again.');
        } finally {
            setIsCreatingPlaylist(false);
        }
    };

    if (!playlistData) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            <div className={`gradient-top ${showTopGradient ? 'visible' : ''}`}></div>
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
                <div className="playlist-header">
                    <div
                        className="cover"
                        style={{
                            backgroundImage: playlistData.tracks[0]?.cover_url ?
                                `url(${playlistData.tracks[0].cover_url})` :
                                'linear-gradient(90deg, var(--primary-800), var(--primary-900))',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    ></div>
                    <div className="information-container">
                        <div className="title">{playlistData.playlistName}</div>
                        <div className="general">
                            <div className="tag">
                                <span>🎧</span><span>{playlistData.totalTracks} Songs</span>
                            </div>
                            <div className="tag">
                                <span>⏱️</span><span>{playlistData.totalDuration} Minutes</span>
                            </div>
                        </div>
                        <button
                            className="tag add"
                            onClick={handleAddToSpotify}
                            disabled={isCreatingPlaylist}
                        >
                            <span>💿</span>
                            <span>{isCreatingPlaylist ? 'Creating...' : 'Add to Spotify'}</span>
                        </button>
                    </div>
                </div>
                <div className="song-container">
                    {playlistData.tracks.map((track, index) => (
                        <motion.div
                            key={track.id}
                            className="song-outer"
                            variants={songVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="song-inner">
                                <div
                                    className="cover"
                                    style={{
                                        backgroundImage: track.cover_url ?
                                            `url(${track.cover_url})` :
                                            'linear-gradient(90deg, var(--primary-800), var(--primary-900))',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                ></div>
                                <div className="song-data">
                                    <div className="title">{track.name}</div>
                                    <div className="artist">{track.artist}</div>
                                </div>
                                <div className="duration">{track.durationFormatted}</div>
                            </div>
                            <hr />
                        </motion.div>
                    ))}
                </div>
            </motion.div>
            <div className={`gradient ${showBottomGradient ? 'visible' : ''}`}></div>
        </main>
    )
}

export default Playlist
