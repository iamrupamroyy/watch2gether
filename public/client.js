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
    let isHost = false;
    let lastSeekTime = 0;

    // --- Navigation ---
    function showRoomView() {
        welcomeView.classList.add('hidden');
        roomView.classList.remove('hidden');
    }

    // --- Event Listeners ---
    createRoomBtn.addEventListener('click', () => {
        const videoUrl = videoUrlInput.value.trim();
        if (videoUrl) {
            isHost = true;
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
        roomInfo.textContent = `You are the host. Room Code: ${roomCode}`;
        videoPlayer.src = videoUrl;
        showRoomView();
    });

    socket.on('roomJoined', ({ roomCode, videoUrl, playbackState }) => {
        currentRoomCode = roomCode;
        roomInfo.textContent = `You are in room: ${roomCode}`;
        videoPlayer.src = videoUrl;
        
        // Sync initial state
        if (playbackState) {
            videoPlayer.currentTime = playbackState.currentTime;
            if (playbackState.isPlaying) {
                videoPlayer.play().catch(e => console.error("Playback error:", e));
            } else {
                videoPlayer.pause();
            }
        }
        showRoomView();
    });

    socket.on('sync', (state) => {
        if (isHost) return; // Host drives the state, doesn't listen for syncs

        videoPlayer.currentTime = state.currentTime;
        if (state.isPlaying && videoPlayer.paused) {
            videoPlayer.play().catch(e => console.error("Sync play error:", e));
        } else if (!state.isPlaying && !videoPlayer.paused) {
            videoPlayer.pause();
        }
    });

    socket.on('error', (message) => {
        errorMessage.textContent = message;
        setTimeout(() => errorMessage.textContent = '', 3000);
    });

    // --- Video Player Event Listeners (for the host) ---
    function isReadyForEvent() {
        // Prevents spamming seek events
        const now = Date.now();
        if (now - lastSeekTime < 500) {
            return false;
        }
        lastSeekTime = now;
        return true;
    }

    videoPlayer.addEventListener('play', () => {
        if (isHost) {
            socket.emit('playbackAction', { 
                roomCode: currentRoomCode, 
                action: 'play', 
                currentTime: videoPlayer.currentTime 
            });
        }
    });

    videoPlayer.addEventListener('pause', () => {
        // Don't emit pause event on seek
        if (isHost && !videoPlayer.seeking) {
            socket.emit('playbackAction', { 
                roomCode: currentRoomCode, 
                action: 'pause', 
                currentTime: videoPlayer.currentTime 
            });
        }
    });

    videoPlayer.addEventListener('seeked', () => {
        if (isHost && isReadyForEvent()) {
            socket.emit('playbackAction', { 
                roomCode: currentRoomCode, 
                action: 'seek', 
                currentTime: videoPlayer.currentTime 
            });
        }
    });
});
