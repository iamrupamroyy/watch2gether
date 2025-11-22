// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for rooms
const rooms = {};

// Function to generate a simple random room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Attach a simple username to the socket for tracking
    const username = socket.id.substring(0, 5); // Shortened ID for display
    let currentRoomCode = null; // Track the room the socket is currently in

    socket.on('createRoom', ({ videoUrl }) => {
        let newRoomCode = generateRoomCode();
        while (rooms[newRoomCode]) {
            newRoomCode = generateRoomCode();
        }

        currentRoomCode = newRoomCode;

        rooms[newRoomCode] = {
            id: newRoomCode,
            videoUrl: videoUrl, // Use the provided URL directly
            state: { // Authoritative room state
                isPlaying: false,
                currentTime: 0,
                lastUpdate: Date.now()
            },
            users: new Map(), // Map<socket.id, {username: string, currentTime: number}>
            syncInterval: null // For periodic room state updates
        };

        // Add creator to the room
        rooms[newRoomCode].users.set(socket.id, { username, currentTime: 0 });
        socket.join(newRoomCode);

        socket.emit('roomCreated', { roomCode: newRoomCode, videoUrl: videoUrl });
        console.log(`Room created: ${newRoomCode} by ${username}`);

        // Start periodic broadcast of full room state for user progress display
        rooms[newRoomCode].syncInterval = setInterval(() => {
            const room = rooms[newRoomCode];
            if (room && room.users.size > 0) {
                io.to(newRoomCode).emit('roomStateUpdate', {
                    roomState: room.state,
                    usersProgress: Array.from(room.users.values()) // Convert Map values to array
                });
            }
        }, 2000); // Update every 2 seconds

    });

    socket.on('joinRoom', ({ roomCode }) => {
        if (!rooms[roomCode]) {
            socket.emit('error', 'Room not found.');
            return;
        }

        currentRoomCode = roomCode;

        // Add user to the room
        rooms[roomCode].users.set(socket.id, { username, currentTime: 0 });
        socket.join(roomCode);
        
        // Send current room state to the new user
        socket.emit('roomJoined', { 
            roomCode: roomCode, 
            videoUrl: rooms[roomCode].videoUrl,
            playbackState: rooms[roomCode].state 
        });

        console.log(`User ${username} joined room ${roomCode}`);
        // Immediately broadcast updated user list to everyone
        io.to(roomCode).emit('roomStateUpdate', {
            roomState: rooms[roomCode].state,
            usersProgress: Array.from(rooms[roomCode].users.values())
        });
    });

    // --- Playback Synchronization (Authoritative) ---
    socket.on('playbackAction', ({ roomCode, action, currentTime }) => {
        if (rooms[roomCode]) {
            const room = rooms[roomCode];
            let newState;

            if (action === 'play') {
                newState = { isPlaying: true, currentTime: currentTime, lastUpdate: Date.now() };
            } else if (action === 'pause') {
                newState = { isPlaying: false, currentTime: currentTime, lastUpdate: Date.now() };
            } else if (action === 'seek') {
                newState = { ...room.state, currentTime: currentTime, lastUpdate: Date.now() };
            }

            if (newState) {
                room.state = newState;
                io.to(roomCode).emit('sync', newState); // Broadcast to all clients
                console.log(`Playback action by ${username} in room ${roomCode}:`, newState);
                // Update initiator's current time too
                if (room.users.has(socket.id)) {
                    room.users.get(socket.id).currentTime = currentTime;
                }
            }
        }
    });

    // --- Per-User Progress Tracking (NEW) ---
    socket.on('timeUpdate', ({ roomCode, currentTime }) => {
        if (rooms[roomCode] && rooms[roomCode].users.has(socket.id)) {
            rooms[roomCode].users.get(socket.id).currentTime = currentTime;
        }
    });

    // --- Force Sync Event (NEW) ---
    socket.on('forceSync', ({ roomCode, currentTime }) => {
        if (rooms[roomCode]) {
            const room = rooms[roomCode];
            // Update authoritative state
            const newState = { ...room.state, currentTime: currentTime, lastUpdate: Date.now() };
            room.state = newState;
            // Broadcast the new authoritative state to all clients
            io.to(roomCode).emit('sync', newState);
            console.log(`Force sync initiated by ${username} in room ${roomCode} to time ${currentTime}`);
            // Update initiator's current time too
            if (room.users.has(socket.id)) {
                room.users.get(socket.id).currentTime = currentTime;
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        if (currentRoomCode && rooms[currentRoomCode]) {
            const room = rooms[currentRoomCode];
            room.users.delete(socket.id); // Remove user from the room

            // Clear interval if room becomes empty
            if (room.users.size === 0) {
                clearInterval(room.syncInterval);
                delete rooms[currentRoomCode];
                console.log(`Room ${currentRoomCode} is empty and has been deleted.`);
            } else {
                // Broadcast updated user list to remaining users
                 io.to(currentRoomCode).emit('roomStateUpdate', {
                    roomState: room.state,
                    usersProgress: Array.from(room.users.values())
                });
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
