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
    let serverState = { isPlaying: false, currentTime: 0, lastUpdate: Date.now() };

    // --- Core Functions ---
    function showRoomView() {
        welcomeView.classList.add('hidden');
        roomView.classList.remove('hidden');
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
        updateAndCorrect(playbackState);
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

    // --- Robust Sync/Correction Logic ---
    function updateAndCorrect(newState) {
        serverState = newState;
        const timeSinceUpdate = (Date.now() - new Date(serverState.lastUpdate).getTime()) / 1000;
        const expectedTime = serverState.currentTime + (serverState.isPlaying ? timeSinceUpdate : 0);
        
        const drift = videoPlayer.currentTime - expectedTime;
        const DRIFT_SEEK_THRESHOLD = 1.5;
        
        if (Math.abs(drift) > DRIFT_SEEK_THRESHOLD) {
            videoPlayer.currentTime = expectedTime;
        }

        if (serverState.isPlaying && videoPlayer.paused) {
            videoPlayer.play().catch(e => console.error("Sync play error:", e));
        } else if (!serverState.isPlaying && !videoPlayer.paused) {
            videoPlayer.pause();
        }
    }

    // --- Client-Side Action Emitters ---
    function emitPlaybackAction(action) {
        if (!currentRoomCode) return;
        socket.emit('playbackAction', { 
            roomCode: currentRoomCode, 
            action: action, 
            currentTime: videoPlayer.currentTime 
        });
    }

    function startSendingTimeUpdates() {
        if (timeUpdateInterval) clearInterval(timeUpdateInterval);
        timeUpdateInterval = setInterval(() => {
            if (!videoPlayer.paused && !videoPlayer.seeking) {
                socket.emit('timeUpdate', {
                    roomCode: currentRoomCode,
                    currentTime: videoPlayer.currentTime
                });
            }
        }, 2000);
    }
    
    // --- Video Player Event Listeners ---
    videoPlayer.addEventListener('play', () => emitPlaybackAction('play'));
    videoPlayer.addEventListener('pause', () => !isSeeking && emitPlaybackAction('pause'));
    videoPlayer.addEventListener('seeking', () => isSeeking = true);
    videoPlayer.addEventListener('seeked', () => {
        isSeeking = false;
        emitPlaybackAction('seek');
    });
    
    // "Ready Check" listener
    videoPlayer.addEventListener('canplaythrough', () => {
        console.log('Video is ready to play through.');
        if (currentRoomCode) {
            socket.emit('clientReady', { roomCode: currentRoomCode });
        }
    });
});
