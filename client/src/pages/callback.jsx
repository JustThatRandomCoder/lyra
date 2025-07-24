import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            fetch('/api/spotify/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            })
                .then(res => res.json())
                .then(data => {
                    console.log('Spotify login successful!');
                    // Store the access token for later use
                    if (data.access_token) {
                        localStorage.setItem('spotify_access_token', data.access_token);
                    }
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
