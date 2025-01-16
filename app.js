// File: App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io("http://localhost:5000");  // Connect to the server

const App = () => {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch videos on page load
    axios.get('/api/videos').then(response => {
      setVideos(response.data);
    });

    // Listen for new video uploads
    socket.on('newVideo', (video) => {
      setVideos(prevVideos => [video, ...prevVideos]);
    });

    // Check if the user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleVideoUpload = async (e) => {
    const formData = new FormData();
    formData.append("video", newVideo);

    const response = await axios.post('/api/upload', formData);
    socket.emit('newVideo', response.data); // Notify others about the new video
    setNewVideo(null);
  };

  return (
    <div className="App">
      <h1>Welcome to TikTok Alternative</h1>
      <div>
        {user ? (
          <div>
            <input 
              type="file" 
              accept="video/*" 
              onChange={(e) => setNewVideo(e.target.files[0])} 
            />
            <button onClick={handleVideoUpload}>Upload Video</button>
          </div>
        ) : (
          <div>Please log in</div>
        )}
      </div>
      <div className="video-feed">
        {videos.map(video => (
          <div key={video._id} className="video-card">
            <video width="300" controls>
              <source src={video.url} type="video/mp4" />
            </video>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
