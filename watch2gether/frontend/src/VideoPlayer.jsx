import React, { useState, useRef, useEffect } from 'react';
import { socket } from './socket';
import { correctDrift } from './utils/sync';
import UserList from './UserList';
import './VideoPlayer.css';

const DRIFT_THRESHOLD = 2; // in seconds
const SEEK_AMOUNT = 10; // in seconds

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
    const subtitleTrackRef = useRef(null);
    const subtitleUrlRef = useRef(null);
  
    const [showControls, setShowControls] = useState(false);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    const [bufferProgress, setBufferProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLooping, setLooping] = useState(false);
    const isApplyingRemoteState = useRef(false);

    const isHost = room.users.find(user => user.id === socket.id)?.isHost || false;

    // Effect for subtitles
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Clean up old subtitle blob URL on change or unmount
        const cleanup = () => {
            if (subtitleUrlRef.current) {
                URL.revokeObjectURL(subtitleUrlRef.current);
                subtitleUrlRef.current = null;
            }
        };

        cleanup();

        if (room.subtitle && room.subtitleType) {
            const blob = new Blob([room.subtitle], { type: room.subtitleType });
            const url = URL.createObjectURL(blob);
            subtitleUrlRef.current = url;

            if (!subtitleTrackRef.current) {
                const track = document.createElement('track');
                track.kind = 'subtitles';
                track.label = 'Subtitles';
                track.srclang = 'en';
                videoElement.appendChild(track);
                subtitleTrackRef.current = track;
            }

            subtitleTrackRef.current.src = url;
            videoElement.textTracks[0].mode = 'showing';
        }

        return cleanup;
    }, [room.subtitle, room.subtitleType]);

    // Effect for loop
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.loop = isLooping;
        }
    }, [isLooping]);

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
    }, [room.isPlaying, room.videoTime, room.videoUrl]); // More specific dependencies
  
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

    const handleSeekRelative = (amount) => {
        if (!videoRef.current) return;
        const newTime = Math.max(0, videoRef.current.currentTime + amount);
        videoRef.current.currentTime = newTime;
        socket.emit('sync-state', { roomId: room.id, newState: { ...room, videoTime: newTime } });
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
            const newState = { videoUrl: newUrl, isPlaying: false, videoTime: 0, subtitle: null, subtitleType: null };
            socket.emit('sync-state', { roomId: room.id, newState });
            setRoom(prevRoom => ({...prevRoom, ...newState}));
        } else {
            alert("Please enter a valid video URL.");
        }
    };

    const handleForceSync = () => {
        if (!videoRef.current) return;
        const currentState = {
            ...room,
            isPlaying: !videoRef.current.paused,
            videoTime: videoRef.current.currentTime,
        };
        socket.emit('sync-state', { roomId: room.id, newState: currentState });
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
          
            {isHost && <HostControls onSetVideo={handleSetVideo} onForceSync={handleForceSync} roomId={room.id} />}

            <div className="room-main-content">
                <div className="video-section">
                    {room.videoUrl ? (
                    <div ref={playerContainerRef} className="video-player-container" onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
                        {/* crossOrigin is needed for subtitles to work on cross-origin videos,
                            but it also requires the video server to have a permissive CORS policy.
                            Removing it to prioritize video playback for a wider range of sources. */}
                        <video ref={videoRef} src={room.videoUrl} width="100%" preload="metadata" onClick={!room.isPlaying ? handlePlayRequest : handlePauseRequest}>
                            <track ref={subtitleTrackRef} kind="subtitles" srcLang="en" label="Subtitles" />
                            Your browser does not support the video tag.
                        </video>
                      
                        <div className={`controls-overlay ${showControls || !room.isPlaying ? 'visible' : ''}`}>
                            <div className="progress-bar-container" onClick={handleSeek}>
                                <div className="buffer-bar" style={{width: `${bufferProgress}%`}}></div>
                                <div className="playback-bar" style={{width: `${playbackProgress}%`}}></div>
                            </div>
                            <div className="bottom-controls">
                                <div className="controls-group left">
                                    <button title="Seek Backward" className="control-button" onClick={() => handleSeekRelative(-SEEK_AMOUNT)}>-10s</button>
                                    <button className="control-button" onClick={!room.isPlaying ? handlePlayRequest : handlePauseRequest}>
                                        {room.isPlaying ? 'Pause' : 'Play'}
                                    </button>
                                    <button title="Seek Forward" className="control-button" onClick={() => handleSeekRelative(SEEK_AMOUNT)}>+10s</button>
                                    <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                                </div>
                                <div className="controls-group right">
                                    <button title="Toggle Loop" className={`control-button ${isLooping ? 'active' : ''}`} onClick={() => setLooping(!isLooping)}>Loop</button>
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

const HostControls = ({ onSetVideo, onForceSync, roomId }) => {
    const [videoUrlInput, setVideoUrlInput] = useState('');

    const handleSubtitleUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const extension = file.name.split('.').pop().toLowerCase();
        if (extension !== 'vtt') {
            alert('Please upload a .vtt subtitle file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            socket.emit('sync-subtitle', {
                roomId: roomId,
                subtitle: content,
                subtitleType: 'text/vtt'
            });
        };
        reader.readAsText(file);
    };

    return (
        <div className="host-controls">
            <div className="control-section">
                <h4>Set Video</h4>
                <div className="input-group">
                    <input type="text" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="Enter direct video URL"/>
                    <button onClick={() => onSetVideo(videoUrlInput)} className="btn-primary">Set</button>
                </div>
            </div>
            <div className="control-section">
                <h4>Subtitles</h4>
                <div className="input-group">
                    <label htmlFor="subtitle-upload" className="btn-secondary">Upload .vtt file</label>
                    <input id="subtitle-upload" type="file" accept=".vtt" onChange={handleSubtitleUpload} />
                </div>
            </div>
            <div className="control-section">
                <h4>Sync</h4>
                <div className="input-group">
                    <button onClick={onForceSync} className="btn-secondary">Force Sync for All</button>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
