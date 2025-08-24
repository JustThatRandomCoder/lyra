# 🎵 Lyra: AI-Powered Playlist Generator

> **Case Study Only!**
> This project is the original work of Julius Grimm. Please do not use this code in your own projects. It is provided for educational and case study purposes only.

---

## 🚀 What is Lyra?

Lyra is an intelligent playlist generator that uses Groq AI to create genre- and mood-specific playlists, blending popular hits with hidden gems. It features a beautiful, animated UI and seamless Spotify integration.

### ✨ Features

- 🤖 **AI-Powered Recommendations**: Get playlists tailored to your exact genre + mood combinations (e.g., "happy techno", "chill jazz")
- 🎶 **Genre-Specific Results**: Only get songs that match your selected genre and mood
- 🧠 **Creative Playlist Names**: AI generates catchy playlist names to match your vibe
- 🌀 **Smooth Animations**: Modern UI with fluid transitions and micro-interactions
- 🛡️ **Fallback System**: If AI is unavailable, Lyra uses a curated music database
- 🖼️ **Playlist Cover Images**: AI-generated covers for each playlist
- 🔗 **Spotify Integration**: Authenticate and add playlists directly to your Spotify account
- 📱 **Responsive Design**: Works beautifully on desktop and mobile

---

## 🛠️ Local Setup Instructions

### 1. **Clone the Repository**

```bash
git clone <your-repo-url>
cd lyra
```

### 2. **Install Dependencies**

```bash
cd server
npm install
cd ../client
npm install
```

### 3. **Configure Environment Variables**

- Get your free Groq API key from [Groq Console](https://console.groq.com/keys)
- Add your Spotify API credentials
- Edit `/server/.env`:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
GROQ_API_KEY=your_groq_api_key
```

### 4. **Start the Backend Server**

```bash
cd server
npm start
```

### 5. **Start the Frontend (Vite) Dev Server**

```bash
cd ../client
npm run dev
```

### 6. **Access Lyra Locally**

- Open [http://localhost:5173](http://localhost:5173) in your browser
- Authenticate with Spotify to enable playlist creation

---

## 🧑‍💻 How Lyra Works

1. **User selects use case, genres, moods, and artists**
2. **Lyra uses Groq AI to generate a unique playlist**
3. **Fallback to curated database if AI is unavailable**
4. **Playlist is matched with Spotify tracks and cover image**
5. **User can add the playlist directly to their Spotify account**

---

## ⚠️ Disclaimer

This code is the intellectual property of Julius Grimm. It is provided as a case study and should not be used, copied, or distributed for other projects.

---

## 📚 Case Study Notes

- Demonstrates integration of AI APIs (Groq) with music services (Spotify)
- Shows advanced UI/UX with React, Vite, and CSS animations
- Example of secure API key management and fallback logic
- Illustrates best practices for modern full-stack app development

---

## 📝 Author

**Julius Grimm**

---

## 💬 Questions?

Feel free to reach out for case study discussions or feedback!
