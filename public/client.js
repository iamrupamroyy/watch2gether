// public/client.js
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // --- DOM Elements ---
    const welcomeView = document.getElementById('welcome-view');
    const roomView = document.getElementById('room-view');
    const createRoomBtn = document.getElementById('create-room-btn');
    const videoUrlInput = document.getElementById('video-url-input');
    const joinRoomBtn = document.getElementById('join-room-btn');
    const roomCodeInput = document.getElementById('room-code-input');
    const roomInfo = document.getElementById('room-info');
    const videoPlayer = document.getElementById('video-player');
    const hostControls = document.getElementById('host-controls');
    const syncBtn = document.getElementById('sync-btn');
    const userList = document.getElementById('user-list');

    // --- State Variables ---
    let currentRoomCode = null;
    let timeUpdateInterval = null;
    let isSeeking = false;
    let serverState = { isPlaying: false, currentTime: 0, lastUpdate: Date.now() }; // Local cache of server state

    // --- Core Functions ---
    function showRoomView() {
        welcomeView.classList.add('hidden');
        roomView.classList.remove('hidden');
        videoPlayer.focus();
    }

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function getUsername() {
        let username = localStorage.getItem('watch2gether_username');
        if (!username) {
            username = prompt("Please enter your name for this session:", `User${Math.floor(Math.random() * 1000)}`);
            if (username) localStorage.setItem('watch2gether_username', username);
        }
        return username || `User-${socket.id.substring(0, 4)}`;
    }

    // --- UI Event Listeners ---
    createRoomBtn.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        if (!videoUrl) return alert('Please provide a video URL.');
        const username = getUsername();
        socket.emit('createRoom', { videoUrl, username });
    });

    joinRoomBtn.addEventListener('click', () => {
        const roomCode = roomCodeInput.value.trim().toUpperCase();
        if (!roomCode) return alert('Please enter a room code.');
        const username = getUsername();
        socket.emit('joinRoom', { roomCode, username });
    });

    syncBtn.addEventListener('click', () => {
        if (currentRoomCode && videoPlayer) {
            socket.emit('forceSync', {
                roomCode: currentRoomCode,
                currentTime: videoPlayer.currentTime
            });
        }
    });

    // --- Socket Event Handlers ---
    socket.on('connect', () => {
        userId = socket.id;
    });
    
    socket.on('roomCreated', ({ roomCode, videoUrl, isHost }) => {
        currentRoomCode = roomCode;
        roomInfo.innerHTML = `Room Code: <strong>${roomCode}</strong> (Share this!)`;
        videoPlayer.src = videoUrl;
        if (isHost) {
            hostControls.classList.remove('hidden');
        }
        showRoomView();
        startSendingTimeUpdates();
    });

    socket.on('roomJoined', ({ roomCode, videoUrl, playbackState }) => {
        currentRoomCode = roomCode;
        roomInfo.textContent = `You are in room: ${roomCode}`;
        videoPlayer.src = videoUrl;
        updateAndCorrect(playbackState); // Use the robust sync handler
        showRoomView();
        startSendingTimeUpdates();
    });

    socket.on('sync', (newState) => {
        updateAndCorrect(newState);
    });

    socket.on('usersUpdate', (users) => {
        userList.innerHTML = '';
        const videoDuration = videoPlayer.duration || 0;
        users.forEach(user => {
            const li = document.createElement('li');
            const progressPercent = videoDuration > 0 ? (user.currentTime / videoDuration) * 100 : 0;
            const isYou = user.id === socket.id;
            li.innerHTML = `
                <span class="user-name">${user.username} ${isYou ? '(You)' : ''}</span>
                <div class="user-progress-bar">
                    <div class="user-progress-bar-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="user-time">${formatTime(user.currentTime)}</span>`;
            userList.appendChild(li);
        });
    });

    socket.on('error', (message) => alert(message));
    socket.on('disconnect', () => clearInterval(timeUpdateInterval));

    // --- The New Robust Sync/Correction Logic ---
    function updateAndCorrect(newState) {
        serverState = newState; // Always update our local cache of the server's state

        // Calculate where the video *should* be right now
        const timeSinceUpdate = (Date.now() - new Date(serverState.lastUpdate).getTime()) / 1000;
        const expectedTime = serverState.currentTime + (serverState.isPlaying ? timeSinceUpdate : 0);
        
        const drift = videoPlayer.currentTime - expectedTime;
        const DRIFT_SEEK_THRESHOLD = 1.5;  // If off by more than 1.5s, hard seek
        const DRIFT_RATE_THRESHOLD = 0.2; // If off by more than 0.2s, adjust playback speed
        
        // --- Correction Step 1: Time (The most important) ---
        if (Math.abs(drift) > DRIFT_SEEK_THRESHOLD) {
            console.warn(`[SYNC] Large drift of ${drift.toFixed(2)}s detected. Forcing seek.`);
            videoPlayer.currentTime = expectedTime;
            videoPlayer.playbackRate = 1;
        } else if (Math.abs(drift) > DRIFT_RATE_THRESHOLD) {
            console.log(`[SYNC] Minor drift of ${drift.toFixed(2)}s detected. Adjusting playback rate.`);
            // If we are ahead, slow down. If we are behind, speed up.
            videoPlayer.playbackRate = drift > 0 ? 0.9 : 1.1;
        } else {
            videoPlayer.playbackRate = 1; // We are in sync, ensure normal speed
        }

        // --- Correction Step 2: Play/Pause State ---
        // This should run after time correction
        if (serverState.isPlaying && videoPlayer.paused) {
            videoPlayer.play().catch(e => console.error("Sync play error:", e));
        } else if (!serverState.isPlaying && !videoPlayer.paused) {
            videoPlayer.pause();
        }
    }

    // --- Client-Side Action Emitters ---
    function emitPlaybackAction(action) {
        if (!currentRoomCode) return;
        // The user's action feels instant locally, but we immediately tell the server.
        // The server will then broadcast back the authoritative state.
        socket.emit('playbackAction', { 
            roomCode: currentRoomCode, 
            action: action, 
            currentTime: videoPlayer.currentTime 
        });
    }

    function startSendingTimeUpdates() {
        if (timeUpdateInterval) clearInterval(timeUpdateInterval);
        timeUpdateInterval = setInterval(() => {
            if (!videoPlayer.paused) {
                socket.emit('timeUpdate', {
                    roomCode: currentRoomCode,
                    currentTime: videoPlayer.currentTime
                });
            }
        }, 2000); // Send an update every 2 seconds
    }

    videoPlayer.addEventListener('play', () => emitPlaybackAction('play'));
    videoPlayer.addEventListener('pause', () => !isSeeking && emitPlaybackAction('pause'));
    videoPlayer.addEventListener('seeking', () => isSeeking = true);
    videoPlayer.addEventListener('seeked', () => {
        isSeeking = false;
        emitPlaybackAction('seek');
    });
});
