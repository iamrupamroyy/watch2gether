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
    const syncBtn = document.getElementById('sync-btn'); // NEW Sync button
    const userList = document.getElementById('user-list'); // NEW User list for progress

    let currentRoomCode = null;
    let lastSeekTime = 0;
    let lastActionSent = null; // Used to prevent immediate re-sync from own actions
    let userId = socket.id; // Store this client's unique ID
    let timeUpdateInterval = null; // For periodic time updates

    // --- Navigation ---
    function showRoomView() {
        welcomeView.classList.add('hidden');
        roomView.classList.remove('hidden');
        videoPlayer.focus(); // Focus player for keyboard controls
    }

    // --- Utility: Format time ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // --- Event Listeners ---
    createRoomBtn.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        if (videoUrl) {
            socket.emit('createRoom', { videoUrl });
        } else {
            alert('Please provide a video URL.');
        }
    });

    joinRoomBtn.addEventListener('click', () => {
        const roomCode = roomCodeInput.value.trim().toUpperCase();
        if (roomCode) {
            socket.emit('joinRoom', { roomCode });
        } else {
            alert('Please enter a room code.');
        }
    });

    syncBtn.addEventListener('click', () => { // NEW Sync button listener
        if (currentRoomCode && videoPlayer) {
            emitPlaybackAction('forceSync'); // Use the same action emitter
        }
    });

    // --- Socket Event Handlers ---
    socket.on('roomCreated', ({ roomCode, videoUrl }) => {
        currentRoomCode = roomCode;
        roomInfo.innerHTML = `Room Code: <strong id="room-code-display">${roomCode}</strong> (Share this with friends!)`;
        videoPlayer.src = videoUrl;
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
            } else {
                videoPlayer.pause();
            }
        }
        showRoomView();
        startSendingTimeUpdates();
    });

    socket.on('sync', (state) => { // Authoritative sync event
        // If this sync event was triggered by our own recent action, ignore it
        if (lastActionSent && state.lastUpdate >= lastActionSent.time) {
             const timeDiff = Date.now() - lastActionSent.time;
             if (timeDiff < 500) { // Give some leeway for network latency
                lastActionSent = null; // Clear to allow future syncs
                return;
             }
        }

        const timeSinceUpdate = (Date.now() - state.lastUpdate) / 1000;
        const expectedTime = state.currentTime + (state.isPlaying ? timeSinceUpdate : 0);
        
        const drift = Math.abs(videoPlayer.currentTime - expectedTime);
        const SYNC_THRESHOLD = 0.5; // If drift is more than 0.5 seconds, force seek
        const RATE_ADJUST_THRESHOLD = 0.2; // If drift is more than 0.2 seconds, adjust rate

        if (drift > SYNC_THRESHOLD) {
            videoPlayer.currentTime = expectedTime;
            console.log(`[SYNC] Forced seek due to ${drift.toFixed(2)}s drift.`);
        } else if (drift > RATE_ADJUST_THRESHOLD) {
            videoPlayer.playbackRate = 1 + (drift / 2); // Small adjustment
            setTimeout(() => videoPlayer.playbackRate = 1, 500); // Reset after a bit
            console.log(`[SYNC] Adjusted rate due to ${drift.toFixed(2)}s drift.`);
        } else {
            videoPlayer.playbackRate = 1; // Ensure normal rate
        }

        if (state.isPlaying && videoPlayer.paused) {
            videoPlayer.play().catch(e => console.error("Sync play error:", e));
        } else if (!state.isPlaying && !videoPlayer.paused) {
            videoPlayer.pause();
        }
    });

    socket.on('roomStateUpdate', ({ roomState, usersProgress }) => { // NEW Room state update
        // Update user list display
        userList.innerHTML = ''; // Clear current list
        usersProgress.forEach(userP => {
            const li = document.createElement('li');
            const progressRatio = videoPlayer.duration ? (userP.currentTime / videoPlayer.duration) : 0;
            const progressBarFillWidth = (progressRatio * 100).toFixed(0);

            li.innerHTML = `
                <span class="user-name">${userP.username} ${userP.username === userId.substring(0, 5) ? '(You)' : ''}</span>
                <div class="user-progress-bar">
                    <div class="user-progress-bar-fill" style="width: ${progressBarFillWidth}%"></div>
                </div>
                <span class="user-time">${formatTime(userP.currentTime)} / ${formatTime(videoPlayer.duration)}</span>
            `;
            userList.appendChild(li);
        });
    });

    socket.on('error', (message) => {
        errorMessage.textContent = message;
        setTimeout(() => errorMessage.textContent = '', 3000);
    });

    // --- Video Player Event Listeners (for everyone) ---
    function isReadyForEvent() {
        const now = Date.now();
        if (now - lastSeekTime < 500) { // Debounce seek events
            return false;
        }
        lastSeekTime = now;
        return true;
    }

    function emitPlaybackAction(action) {
        lastActionSent = { action, time: Date.now() };
        socket.emit('playbackAction', { 
            roomCode: currentRoomCode, 
            action: action, 
            currentTime: videoPlayer.currentTime 
        });
    }

    // NEW: Function to send periodic time updates
    function startSendingTimeUpdates() {
        if (timeUpdateInterval) clearInterval(timeUpdateInterval);
        timeUpdateInterval = setInterval(() => {
            if (currentRoomCode && videoPlayer && !videoPlayer.paused && !videoPlayer.seeking) {
                socket.emit('timeUpdate', {
                    roomCode: currentRoomCode,
                    currentTime: videoPlayer.currentTime
                });
            }
        }, 3000); // Send update every 3 seconds
    }

    // Stop sending updates on disconnect
    socket.on('disconnect', () => {
        if (timeUpdateInterval) clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
    });


    videoPlayer.addEventListener('play', () => {
        emitPlaybackAction('play');
    });

    videoPlayer.addEventListener('pause', () => {
        if (!videoPlayer.seeking) {
            emitPlaybackAction('pause');
        }
    });

    videoPlayer.addEventListener('seeked', () => {
        if (isReadyForEvent()) {
            emitPlaybackAction('seek');
        }
    });
});
