import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            fetch('http://localhost:3000/api/spotify/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            })
                .then(res => res.json())
                .then(data => {
                    console.log('Spotify login successful!');
                    console.log('Playlist URL:', data.playlistUrl);
                    navigate('/home');
                })
                .catch(err => {
                    console.error('Spotify token exchange failed:', err);
                    navigate('/home');
                });
        }
    }, [navigate]);

    return <p>Authenticating with Spotify...</p>;
}

export default Callback;
