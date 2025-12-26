// frontend/src/VideoPlayer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { socket } from './socket';
import { correctDrift } from './utils/sync';

const DRIFT_THRESHOLD = 2; // in seconds
const PLAYER_SIZES = {
  small: '640px',
  medium: '800px',
  large: '1024px',
};

function VideoPlayer({ room, setRoom }) {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  
  const [playerSize, setPlayerSize] = useState('medium');
  const [showControls, setShowControls] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);
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
      }
    };
    
    const handleProgress = () => {
      if (videoElement.duration && videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        setBufferProgress((bufferedEnd / videoElement.duration) * 100);
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('progress', handleProgress);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('progress', handleProgress);
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
    
    // Set the time locally and emit event to sync others
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

  const styles = {
    container: { position: 'relative', backgroundColor: 'black', width: PLAYER_SIZES[playerSize], margin: '0 auto' },
    controlsOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, opacity: (showControls || !room.isPlaying) ? 1 : 0, transition: 'opacity 0.3s' },
    progressBarContainer: { width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.3)', cursor: 'pointer', position: 'relative' },
    bufferBar: { position: 'absolute', height: '100%', backgroundColor: 'rgba(255,255,255,0.5)', width: `${bufferProgress}%` },
    playbackBar: { position: 'absolute', height: '100%', backgroundColor: '#646cff', width: `${playbackProgress}%` },
    bottomControls: { padding: '10px', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'space-between' },
    controlsGroup: { display: 'flex', alignItems: 'center', gap: '10px' }
  };

  return (
    <div>
      <h1>Room: {room.id}</h1>
      <p>{room.users.length} user(s) online.</p>
      
      {isHost && <HostControls onSetVideo={handleSetVideo} />}

      {room.videoUrl ? (
        <div ref={playerContainerRef} style={styles.container} onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
          <video ref={videoRef} src={room.videoUrl} width="100%" preload="metadata" onClick={!room.isPlaying ? handlePlayRequest : handlePauseRequest}>
            Your browser does not support the video tag.
          </video>
          
          <div style={styles.controlsOverlay}>
            <div style={styles.progressBarContainer} onClick={handleSeek}>
              <div style={styles.bufferBar}></div>
              <div style={styles.playbackBar}></div>
            </div>
            <div style={styles.bottomControls}>
              <div style={styles.controlsGroup}>
                  {!room.isPlaying ? <button onClick={handlePlayRequest}>Play</button> : <button onClick={handlePauseRequest}>Pause</button>}
              </div>
              <div style={styles.controlsGroup}>
                  <span>Size:</span>
                  <button onClick={() => setPlayerSize('small')}>S</button>
                  <button onClick={() => setPlayerSize('medium')}>M</button>
                  <button onClick={() => setPlayerSize('large')}>L</button>
                  <button onClick={handleFullscreen}>Fullscreen</button>
              </div>
            </div>
          </div>
        </div>
      ) : ( <p>The host needs to set a video URL.</p> )}
    </div>
  );
}

const HostControls = ({ onSetVideo }) => {
    const [videoUrlInput, setVideoUrlInput] = useState('');
    return (
        <div style={{margin: '10px 0'}}>
          <input type="text" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="Enter direct video URL" style={{width: "300px"}}/>
          <button onClick={() => onSetVideo(videoUrlInput)}>Set Video</button>
        </div>
    );
};

export default VideoPlayer;
