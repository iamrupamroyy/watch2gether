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

    let currentRoomCode = null;
    let lastSeekTime = 0;
    let lastActionSent = null; // Used to ignore our own sync events

    // --- Navigation ---
    function showRoomView() {
        welcomeView.classList.add('hidden');
        roomView.classList.remove('hidden');
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

    // --- Socket Event Handlers ---
    socket.on('roomCreated', ({ roomCode, videoUrl }) => {
        currentRoomCode = roomCode;
        roomInfo.innerHTML = `Room Code: <strong id="room-code-display">${roomCode}</strong> (Share this with friends!)`;
        videoPlayer.src = videoUrl;
        showRoomView();
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
    });

    socket.on('sync', (state) => {
        // A simple mechanism to ignore a sync event that we likely just triggered
        if (lastActionSent) {
            const timeSinceAction = Date.now() - lastActionSent.time;
            if (timeSinceAction < 500) { // If action was sent in the last 500ms
                if (lastActionSent.action === 'play' && state.isPlaying) return;
                if (lastActionSent.action === 'pause' && !state.isPlaying) return;
            }
        }
        
        // Correct for drift if it's significant (more than 1 second)
        const drift = Math.abs(videoPlayer.currentTime - state.currentTime);
        if (drift > 1) {
            videoPlayer.currentTime = state.currentTime;
        }

        if (state.isPlaying && videoPlayer.paused) {
            videoPlayer.play().catch(e => console.error("Sync play error:", e));
        } else if (!state.isPlaying && !videoPlayer.paused) {
            videoPlayer.pause();
        }
    });

    socket.on('error', (message) => {
        alert(message);
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

    videoPlayer.addEventListener('play', () => {
        emitPlaybackAction('play');
    });

    videoPlayer.addEventListener('pause', () => {
        if (!videoPlayer.seeking) { // Do not send pause event while seeking
            emitPlaybackAction('pause');
        }
    });



    videoPlayer.addEventListener('seeked', () => {
        if (isReadyForEvent()) {
            emitPlaybackAction('seek');
        }
    });
});
