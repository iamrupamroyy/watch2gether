// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Function to broadcast the full user list for a room
function broadcastUsersUpdate(roomCode) {
    if (rooms[roomCode]) {
        const usersList = Array.from(rooms[roomCode].users.values());
        io.to(roomCode).emit('usersUpdate', usersList);
        // console.log(`Sent user update for room ${roomCode}:`, usersList);
    }
}

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    let currentRoomCode = null;

    socket.on('createRoom', ({ videoUrl, username }) => {
        let newRoomCode = generateRoomCode();
        while (rooms[newRoomCode]) {
            newRoomCode = generateRoomCode();
        }
        currentRoomCode = newRoomCode;

        rooms[newRoomCode] = {
            id: newRoomCode,
            hostId: socket.id, // The creator is the host
            videoUrl: videoUrl,
            state: { isPlaying: false, currentTime: 0, lastUpdate: Date.now() },
            users: new Map(),
        };

        // Add creator to the room
        rooms[newRoomCode].users.set(socket.id, { id: socket.id, username: username || `User-${socket.id.substring(0,4)}` });
        socket.join(newRoomCode);

        socket.emit('roomCreated', { roomCode: newRoomCode, videoUrl: videoUrl, isHost: true });
        console.log(`Room created: ${newRoomCode} by host ${username}`);
        broadcastUsersUpdate(newRoomCode);
    });

    socket.on('joinRoom', ({ roomCode, username }) => {
        if (!rooms[roomCode]) {
            return socket.emit('error', 'Room not found.');
        }
        currentRoomCode = roomCode;

        rooms[roomCode].users.set(socket.id, { id: socket.id, username: username || `User-${socket.id.substring(0,4)}` });
        socket.join(roomCode);
        
        socket.emit('roomJoined', { 
            roomCode: roomCode, 
            videoUrl: rooms[roomCode].videoUrl,
            playbackState: rooms[roomCode].state 
        });

        console.log(`User ${username} joined room ${roomCode}`);
        broadcastUsersUpdate(roomCode);
    });

    socket.on('playbackAction', ({ roomCode, action, currentTime }) => {
        if (rooms[roomCode]) {
            const room = rooms[roomCode];
            let newState;
            if (action === 'play') newState = { isPlaying: true, currentTime, lastUpdate: Date.now() };
            if (action === 'pause') newState = { isPlaying: false, currentTime, lastUpdate: Date.now() };
            if (action === 'seek') newState = { ...room.state, currentTime, lastUpdate: Date.now() };

            if (newState) {
                room.state = newState;
                io.to(roomCode).emit('sync', newState);
                // console.log(`Playback action from ${socket.id} in room ${roomCode}`);
            }
        }
    });
    
    socket.on('forceSync', ({ roomCode, currentTime }) => {
        if (rooms[roomCode]) {
            const room = rooms[roomCode];
            // Only allow the host to force sync
            if (socket.id !== room.hostId) {
                return socket.emit('error', 'Only the host can force a sync.');
            }
            const newState = { ...room.state, currentTime, lastUpdate: Date.now() };
            room.state = newState;
            io.to(roomCode).emit('sync', newState);
            console.log(`Force sync initiated by host ${socket.id} in room ${roomCode}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        if (currentRoomCode && rooms[currentRoomCode]) {
            rooms[currentRoomCode].users.delete(socket.id);
            if (rooms[currentRoomCode].users.size === 0) {
                delete rooms[currentRoomCode];
                console.log(`Room ${currentRoomCode} is empty and has been deleted.`);
            } else {
                broadcastUsersUpdate(currentRoomCode);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
