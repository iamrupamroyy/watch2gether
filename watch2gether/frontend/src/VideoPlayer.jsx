import React, { useState, useRef, useEffect } from 'react';
import { socket } from './socket';
import { correctDrift } from './utils/sync';
import UserList from './UserList'; // Import UserList
import './VideoPlayer.css'; // Import the CSS file

const DRIFT_THRESHOLD = 2; // in seconds

function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00';
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

function VideoPlayer({ room, setRoom, onLeaveRoom }) {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  
  const [showControls, setShowControls] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isApplyingRemoteState = useRef(false);

  const isHost = room.users.find(user => user.id === socket.id)?.isHost || false;

  // Effect for handling server state updates
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    isApplyingRemoteState.current = true;

    if (room.isPlaying && videoElement.readyState > 0) {
      correctDrift(videoElement, room, DRIFT_THRESHOLD);
    }

    if (room.isPlaying && videoElement.paused) {
      videoElement.play()
        .catch(e => console.error("Autoplay was prevented or failed:", e))
        .finally(() => { isApplyingRemoteState.current = false; });
    } else if (!room.isPlaying && !videoElement.paused) {
      videoElement.pause();
      isApplyingRemoteState.current = false;
    } else {
      isApplyingRemoteState.current = false;
    }
  }, [room]);
  
  // Effect for handling local video events (progress, timeupdate)
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      if (videoElement.duration) {
        setPlaybackProgress((videoElement.currentTime / videoElement.duration) * 100);
        setCurrentTime(videoElement.currentTime);
      }
    };

    const handleDurationChange = () => {
        if (videoElement.duration) {
            setDuration(videoElement.duration);
        }
    }
    
    const handleProgress = () => {
      if (videoElement.duration && videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        setBufferProgress((bufferedEnd / videoElement.duration) * 100);
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('progress', handleProgress);
    videoElement.addEventListener('durationchange', handleDurationChange);


    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('progress', handleProgress);
      videoElement.removeEventListener('durationchange', handleDurationChange);
    };
  }, []);

  const handlePlayRequest = () => {
    if (isApplyingRemoteState.current || !videoRef.current) return;
    socket.emit('play-request', { roomId: room.id, videoTime: videoRef.current.currentTime });
  };

  const handlePauseRequest = () => {
    if (isApplyingRemoteState.current || !videoRef.current) return;
    socket.emit('pause-request', { roomId: room.id, videoTime: videoRef.current.currentTime });
  };

  const handleSeek = (event) => {
    if (isApplyingRemoteState.current || !videoRef.current) return;
    const progressBar = event.currentTarget;
    const clickPosition = event.nativeEvent.offsetX;
    const progressBarWidth = progressBar.clientWidth;
    const seekRatio = clickPosition / progressBarWidth;
    const seekTime = videoRef.current.duration * seekRatio;
    
    videoRef.current.currentTime = seekTime;
    socket.emit('sync-state', { roomId: room.id, newState: { ...room, videoTime: seekTime } });
  };

  const handleFullscreen = () => {
    const playerElement = playerContainerRef.current;
    if (!playerElement) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerElement.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };
  
  const handleSetVideo = (newUrl) => {
    if (newUrl.startsWith('http')) {
      const newState = { videoUrl: newUrl, isPlaying: false, videoTime: 0 };
      socket.emit('sync-state', { roomId: room.id, newState });
      setRoom(prevRoom => ({...prevRoom, ...newState}));
    } else {
      alert("Please enter a valid video URL.");
    }
  };

  return (
    <div className="room-container">
      <header className="room-header">
        <div className="room-info">
            <h2>Room: {room.id}</h2>
            <span className="user-count">{room.users.length} user(s) online</span>
        </div>
        <button onClick={onLeaveRoom} className="btn-secondary">Leave Room</button>
      </header>
      
      {isHost && <HostControls onSetVideo={handleSetVideo} />}

      <div className="room-main-content">
        <div className="video-section">
            {room.videoUrl ? (
            <div ref={playerContainerRef} className="video-player-container" onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
              <video ref={videoRef} src={room.videoUrl} width="100%" preload="metadata" onClick={!room.isPlaying ? handlePlayRequest : handlePauseRequest}>
                Your browser does not support the video tag.
              </video>
              
              <div className={`controls-overlay ${showControls || !room.isPlaying ? 'visible' : ''}`}>
                <div className="progress-bar-container" onClick={handleSeek}>
                  <div className="buffer-bar" style={{width: `${bufferProgress}%`}}></div>
                  <div className="playback-bar" style={{width: `${playbackProgress}%`}}></div>
                </div>
                <div className="bottom-controls">
                    <div className="controls-group left">
                        <button className="control-button" onClick={!room.isPlaying ? handlePlayRequest : handlePauseRequest}>
                            {room.isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    <div className="controls-group right">
                        <button className="control-button" onClick={handleFullscreen}>Fullscreen</button>
                    </div>
                </div>
              </div>
            </div>
          ) : ( 
            <div className="no-video-placeholder">
                <p>The host needs to set a video URL.</p>
            </div>
          )}
        </div>
        <div className="user-list-section">
            <UserList users={room.users} />
        </div>
      </div>
    </div>
  );
}

const HostControls = ({ onSetVideo }) => {
    const [videoUrlInput, setVideoUrlInput] = useState('');
    return (
        <div className="host-controls">
          <input type="text" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="Enter direct video URL"/>
          <button onClick={() => onSetVideo(videoUrlInput)} className="btn-primary">Set Video</button>
        </div>
    );
};

export default VideoPlayer;