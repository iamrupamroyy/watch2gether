// public/client.js
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Views
    const welcomeView = document.getElementById('welcome-view');
    const roomView = document.getElementById('room-view');

    // Welcome View Elements
    const createRoomBtn = document.getElementById('create-room-btn');
    const videoUrlInput = document.getElementById('video-url-input');
    const joinRoomBtn = document.getElementById('join-room-btn');
    const roomCodeInput = document.getElementById('room-code-input');

    // Room View Elements
    const roomInfo = document.getElementById('room-info');
    const videoPlayer = document.getElementById('video-player');
    const errorMessage = document.getElementById('error-message');
    const hostControls = document.getElementById('host-controls'); // Host-only controls container
    const syncBtn = document.getElementById('sync-btn');
    const userList = document.getElementById('user-list');

    let currentRoomCode = null;
    let timeUpdateInterval = null;
    let isSeeking = false;
    let lastSentAction = null;

    // --- Utility Functions ---
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

    // --- User Actions ---
    function getUsername() {
        let username = localStorage.getItem('watch2gether_username');
        if (!username) {
            username = prompt("Please enter your name for this session:", `User${Math.floor(Math.random() * 1000)}`);
            if (username) {
                localStorage.setItem('watch2gether_username', username);
            }
        }
        return username || `User${socket.id.substring(0,4)}`;
    }

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
        roomInfo.innerHTML = `Room Code: <strong>${roomCode}</strong> (Share this with friends!)`;
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

        if (playbackState) {
            const timeSinceUpdate = (Date.now() - playbackState.lastUpdate) / 1000;
            const expectedTime = playbackState.currentTime + (playbackState.isPlaying ? timeSinceUpdate : 0);
            videoPlayer.currentTime = expectedTime;
            
            if (playbackState.isPlaying) {
                videoPlayer.play().catch(e => console.error("Playback error on join:", e));
            }
        }
        showRoomView();
        startSendingTimeUpdates();
    });

    socket.on('sync', (state) => {
        if (lastActionSent && (Date.now() - lastActionSent.time < 1000)) {
            return; // Ignore syncs that immediately follow our own actions
        }

        const drift = Math.abs(videoPlayer.currentTime - state.currentTime);
        if (drift > 1.5) { // Only sync if drift is significant
            videoPlayer.currentTime = state.currentTime;
        }

        if (state.isPlaying && videoPlayer.paused) {
            videoPlayer.play().catch(e => console.error("Sync play error:", e));
        } else if (!state.isPlaying && !videoPlayer.paused) {
            videoPlayer.pause();
        }
    });

    socket.on('usersUpdate', (users) => {
        userList.innerHTML = '';
        const videoDuration = videoPlayer.duration;
        users.forEach(user => {
            const li = document.createElement('li');
            const progressPercent = videoDuration ? (user.currentTime / videoDuration) * 100 : 0;
            const isYou = user.id === socket.id;

            li.innerHTML = `
                <span class="user-name">${user.username} ${isYou ? '(You)' : ''}</span>
                <div class="user-progress-bar">
                    <div class="user-progress-bar-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="user-time">${formatTime(user.currentTime)}</span>
            `;
            userList.appendChild(li);
        });
    });
    
    socket.on('error', (message) => alert(message));
    socket.on('disconnect', () => {
        if (timeUpdateInterval) clearInterval(timeUpdateInterval);
    });

    // --- Video Player Event Emitters ---
    function emitPlaybackAction(action) {
        lastActionSent = { action, time: Date.now() };
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
        }, 2000); // Send update every 2 seconds
    }

    videoPlayer.addEventListener('play', () => emitPlaybackAction('play'));
    videoPlayer.addEventListener('pause', () => !isSeeking && emitPlaybackAction('pause'));
    videoPlayer.addEventListener('seeking', () => isSeeking = true);
    videoPlayer.addEventListener('seeked', () => {
        isSeeking = false;
        emitPlaybackAction('seek');
    });
});
