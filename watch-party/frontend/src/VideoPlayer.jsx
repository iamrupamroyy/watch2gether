// frontend/src/VideoPlayer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { socket } from './socket';
import { correctDrift } from './utils/sync';

const DRIFT_THRESHOLD = 2; // in seconds

function VideoPlayer({ room, setRoom }) {
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');
  
  // This ref is crucial to prevent feedback loops.
  // It tracks if the current playback change is due to a remote action.
  const isApplyingRemoteState = useRef(false);

  const isHost = room.users.find(user => user.id === socket.id)?.isHost || false;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // This effect applies the authoritative state from the server to the video player.
    isApplyingRemoteState.current = true;

    // Correct drift if the video is playing, but only if the video has loaded enough.
    if (room.isPlaying && videoElement.readyState > 0) {
      correctDrift(videoElement, room, DRIFT_THRESHOLD);
    }

    // Apply play/pause state
    if (room.isPlaying && videoElement.paused) {
      // The play() method is async and returns a promise.
      // We reset the flag only after the promise resolves (or rejects).
      videoElement.play()
        .catch(e => console.error("Autoplay was prevented or failed:", e))
        .finally(() => {
          isApplyingRemoteState.current = false;
        });
    } else if (!room.isPlaying && !videoElement.paused) {
      videoElement.pause();
      // pause() is synchronous, so we can reset the flag immediately.
      isApplyingRemoteState.current = false;
    } else {
      // If the state already matches, we can reset the flag.
      isApplyingRemoteState.current = false;
    }
    // The dependency array ensures this effect re-runs whenever the server state changes.
  }, [room]); // Re-run whenever the authoritative room state changes


  // --- Event Emitters ---
  // These functions are called by user interactions (e.g., clicking the video).

  const handlePlayRequest = () => {
    if (isApplyingRemoteState.current || !videoRef.current) return; // Prevent loop
    socket.emit('play-request', { roomId: room.id, videoTime: videoRef.current.currentTime });
  };

  const handlePauseRequest = () => {
    if (isApplyingRemoteState.current || !videoRef.current) return; // Prevent loop
    socket.emit('pause-request', { roomId: room.id, videoTime: videoRef.current.currentTime });
  };

  const handleUrlChange = (e) => {
    setVideoUrl(e.target.value);
  };

  const handleSetVideo = () => {
    // A simple validation for the URL
    if (videoUrl.startsWith('http')) {
      const newState = {
        videoUrl: videoUrl,
        isPlaying: false,
        videoTime: 0,
      };
      // Send the new state to the server
      socket.emit('sync-state', { roomId: room.id, newState });
      setRoom(prevRoom => ({...prevRoom, ...newState})); // Optimistic update
    } else {
        alert("Please enter a valid video URL (e.g., from archive.org)");
    }
  };

  return (
    <div>
      <h1>Room: {room.id}</h1>
      <p>{room.users.length} user(s) online.</p>
      
      {isHost && (
        <div>
          <input
            type="text"
            value={videoUrl}
            onChange={handleUrlChange}
            placeholder="Enter direct video URL"
            style={{width: "300px"}}
          />
          <button onClick={handleSetVideo}>Set Video</button>
        </div>
      )}

      {room.videoUrl ? (
        <div>
          <video
            ref={videoRef}
            src={room.videoUrl}
            width="800"
            preload="metadata"
            // The 'seeking' event can also be used for more robust sync
            // onSeeking={() => socket.emit('sync-request', { roomId: room.id, videoTime: videoRef.current.currentTime })}
          >
            Your browser does not support the video tag.
          </video>
          <div>
            {!room.isPlaying ? (
              <button onClick={handlePlayRequest}>Play</button>
            ) : (
              <button onClick={handlePauseRequest}>Pause</button>
            )}
          </div>
        </div>
      ) : (
        <p>The host needs to set a video URL.</p>
      )}
    </div>
  );
}

export default VideoPlayer;
