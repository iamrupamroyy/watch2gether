import React, { useState, useRef, useEffect } from 'react';
import { socket } from './socket';
import { correctDrift } from './utils/sync';
import UserList from './UserList';
import { 
    PlayIcon, PauseIcon, FullscreenIcon, ExitFullscreenIcon, 
    LoopIcon, Replay10Icon, Forward10Icon 
} from './PlayerIcons';
import './VideoPlayer.css';

const DRIFT_THRESHOLD = 2; // in seconds
const SEEK_AMOUNT = 10; // in seconds

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === 0) return '00:00';
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
    const [isBuffering, setBuffering] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isLooping, setLooping] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const isApplyingRemoteState = useRef(false);

    const currentTime = room.videoTime || 0;
    const playbackProgress = (duration > 0) ? (currentTime / duration) * 100 : 0;

    const isHost = room.users.find(user => user.id === socket.id)?.isHost || false;

    // Effect for subtitles
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

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

            let track = subtitleTrackRef.current;
            if (!track) {
                track = document.createElement('track');
                track.kind = 'subtitles';
                track.label = 'Subtitles';
                track.srclang = 'en';
                videoElement.appendChild(track);
                subtitleTrackRef.current = track;
            }

            track.src = url;
            if (videoElement.textTracks && videoElement.textTracks[0]) {
                videoElement.textTracks[0].mode = 'showing';
            }
        }
        return cleanup;
    }, [room.subtitle, room.subtitleType]);

    // Effect for loop
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.loop = isLooping;
        }
    }, [isLooping]);

    // Fullscreen change handler
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Effect for handling server state updates
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        isApplyingRemoteState.current = true;
        correctDrift(videoElement, room, DRIFT_THRESHOLD);

        if (room.isPlaying && videoElement.paused) {
            videoElement.play()
                .catch(e => console.error("Autoplay was prevented:", e))
                .finally(() => { isApplyingRemoteState.current = false; });
        } else if (!room.isPlaying && !videoElement.paused) {
            videoElement.pause();
            isApplyingRemoteState.current = false;
        } else {
            isApplyingRemoteState.current = false;
        }
    }, [room.isPlaying, room.videoTime, room.videoUrl]);
  
    // Effect for binding local video events
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;
        
        const handleMetadata = () => setDuration(videoElement.duration);
        const handleTimeUpdate = () => {
            const now = Date.now();
            if (!videoElement.paused && isHost && (!room.lastUpdateTimestamp || (now - room.lastUpdateTimestamp > 2000))) {
                // ONLY sync time and timestamp. Do not spread the old room state.
                const timeSyncState = { videoTime: videoElement.currentTime, lastUpdateTimestamp: now };
                socket.emit('sync-state', {
                    roomId: room.id,
                    newState: timeSyncState
                });
            }
        };
        const handleWaiting = () => setBuffering(true);
        const handlePlaying = () => setBuffering(false);

        videoElement.addEventListener('loadedmetadata', handleMetadata);
        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('waiting', handleWaiting);
        videoElement.addEventListener('playing', handlePlaying);
        videoElement.addEventListener('canplay', handlePlaying);

        return () => {
            videoElement.removeEventListener('loadedmetadata', handleMetadata);
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            videoElement.removeEventListener('waiting', handleWaiting);
            videoElement.removeEventListener('playing', handlePlaying);
            videoElement.removeEventListener('canplay', handlePlaying);
        };
    }, [room.videoUrl, isHost, room.id]);

    const handlePlayRequest = () => {
        if (!videoRef.current) return;
        socket.emit('play-request', { roomId: room.id, videoTime: videoRef.current.currentTime });
    };

    const handlePauseRequest = () => {
        if (!videoRef.current) return;
        socket.emit('pause-request', { roomId: room.id, videoTime: videoRef.current.currentTime });
    };

    const handleSeek = (event) => {
        if (!videoRef.current || !duration) return;
        const progressBar = event.currentTarget;
        const clickPosition = event.nativeEvent.offsetX;
        const progressBarWidth = progressBar.clientWidth;
        const seekRatio = clickPosition / progressBarWidth;
        const seekTime = duration * seekRatio;
        
        videoRef.current.currentTime = seekTime;
        socket.emit('sync-state', { roomId: room.id, newState: { ...room, videoTime: seekTime } });
    };

    const handleSeekRelative = (amount) => {
        if (!videoRef.current || !duration) return;
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
        } else {
            alert("Please enter a valid video URL.");
        }
    };

    const handleForceSync = () => {
        if (!videoRef.current) return;
        const hostState = {
            ...room,
            isPlaying: !videoRef.current.paused,
            videoTime: videoRef.current.currentTime,
        };
        socket.emit('sync-state', { roomId: room.id, newState: hostState });
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
                        {isBuffering && <div className="loading-spinner"></div>}
                        <video ref={videoRef} src={room.videoUrl} width="100%" preload="metadata" />
                      
                        <div className={`controls-overlay ${showControls || !room.isPlaying ? 'visible' : ''}`} onClick={!room.isPlaying ? handlePlayRequest : handlePauseRequest}>
                            <div className="progress-bar-container" onClick={(e) => { e.stopPropagation(); handleSeek(e); }}>
                                <div className="playback-bar" style={{width: `${playbackProgress}%`}}></div>
                            </div>
                            <div className="bottom-controls">
                                <div className="controls-group left">
                                    <button title="Seek Backward 10s" className="control-button" onClick={(e) => { e.stopPropagation(); handleSeekRelative(-SEEK_AMOUNT); }}><Replay10Icon /></button>
                                    <button title={room.isPlaying ? 'Pause' : 'Play'} className="control-button" onClick={(e) => { e.stopPropagation(); !room.isPlaying ? handlePlayRequest() : handlePauseRequest(); }}>
                                        {room.isPlaying ? <PauseIcon /> : <PlayIcon />}
                                    </button>
                                    <button title="Seek Forward 10s" className="control-button" onClick={(e) => { e.stopPropagation(); handleSeekRelative(SEEK_AMOUNT); }}><Forward10Icon /></button>
                                    <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                                </div>
                                <div className="controls-group right">
                                    <button title="Toggle Loop" className={`control-button ${isLooping ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setLooping(!isLooping);}}><LoopIcon /></button>
                                    <button title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} className="control-button" onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}>
                                        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                                    </button>
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
            <div className="input-group">
                <input type="text" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="Enter direct video URL"/>
                <button onClick={() => onSetVideo(videoUrlInput)} className="btn-primary">Set Video</button>
            </div>
            <div className="input-group">
                <label htmlFor="subtitle-upload" className="btn-secondary">Upload .vtt Subtitles</label>
                <input id="subtitle-upload" type="file" accept=".vtt" onChange={handleSubtitleUpload} />
                <button onClick={onForceSync} className="btn-secondary">Force Sync</button>
            </div>
        </div>
    );
};

export default VideoPlayer;