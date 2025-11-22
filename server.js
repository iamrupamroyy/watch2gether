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

function broadcastUsersUpdate(roomCode) {
    if (rooms[roomCode]) {
        const usersList = Array.from(rooms[roomCode].users.values());
        io.to(roomCode).emit('usersUpdate', usersList);
    }
}



io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    const username = socket.id.substring(0, 5);
    let currentRoomCode = null;

    socket.on('createRoom', ({ videoUrl, username: clientUsername }) => {
        const newRoomCode = generateRoomCode();
        currentRoomCode = newRoomCode;
        const finalUsername = clientUsername || username;

        const room = {
            id: newRoomCode,
            hostId: socket.id,
            videoUrl: videoUrl,
            state: { isPlaying: false, currentTime: 0, lastUpdate: Date.now() },
            users: new Map(),
            readyUsers: new Set(), // NEW: Set to track ready users
            syncInterval: setInterval(() => broadcastUsersUpdate(newRoomCode), 2000)
        };
        rooms[newRoomCode] = room;

        room.users.set(socket.id, { id: socket.id, username: finalUsername, currentTime: 0 });
        socket.join(newRoomCode);

        socket.emit('roomCreated', { roomCode: newRoomCode, videoUrl: videoUrl, isHost: true });
        console.log(`Room created: ${newRoomCode} by host ${username}`);
        broadcastUsersUpdate(newRoomCode);
    });

    socket.on('joinRoom', ({ roomCode, username: clientUsername }) => {
        const room = rooms[roomCode];
        if (!room) return socket.emit('error', 'Room not found.');
        
        currentRoomCode = roomCode;
        const finalUsername = clientUsername || username;

        room.users.set(socket.id, { id: socket.id, username: finalUsername, currentTime: 0 });
        socket.join(roomCode);
        
        socket.emit('roomJoined', { 
            roomCode: roomCode, 
            videoUrl: room.videoUrl,
            playbackState: room.state 
        });

        console.log(`User ${finalUsername} joined room ${roomCode}`);
        broadcastUsersUpdate(roomCode);
    });

    socket.on('clientReady', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (room) {
            console.log(`User ${username} in room ${roomCode} is ready.`);
            room.readyUsers.add(socket.id);
        }
    });

    socket.on('playbackAction', ({ roomCode, action, currentTime }) => {
        const room = rooms[roomCode];
        if (!room) return;

        let newState;
        if (action === 'play') newState = { isPlaying: true, currentTime, lastUpdate: Date.now() };
        if (action === 'pause') newState = { isPlaying: false, currentTime, lastUpdate: Date.now() };
        if (action === 'seek') {
            newState = { ...room.state, currentTime, lastUpdate: Date.now() };
        }

        if (newState) {
            room.state = newState;
            io.to(roomCode).emit('sync', newState);
        }
    });
    
    socket.on('forceSync', ({ roomCode, currentTime }) => {
        const room = rooms[roomCode];
        if (room) {
            if (socket.id !== room.hostId) return socket.emit('error', 'Only the host can force a sync.');
            
            const newState = { ...room.state, currentTime, lastUpdate: Date.now() };
            room.state = newState;
            room.readyUsers.clear(); // A force sync is like a seek, require all to be ready again
            io.to(roomCode).emit('sync', newState);
            io.to(roomCode).emit('waitingForUsers');
            console.log(`Force sync by host in room ${roomCode}`);
        }
    });

    socket.on('timeUpdate', ({ roomCode, currentTime }) => {
        if (rooms[roomCode] && rooms[roomCode].users.has(socket.id)) {
            rooms[roomCode].users.get(socket.id).currentTime = currentTime;
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        // ROBUST DISCONNECT: Iterate over all rooms to find the disconnected user
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            if (room.users.has(socket.id)) {
                room.users.delete(socket.id);
                room.readyUsers.delete(socket.id); // Also remove from ready set

                if (room.users.size === 0) {
                    clearInterval(room.syncInterval);
                    delete rooms[roomCode];
                    console.log(`Room ${roomCode} is empty and has been deleted.`);
                } else {
                    // Broadcast updated user list to remaining users
                    broadcastUsersUpdate(roomCode);
                }
                // Once found and handled, break the loop
                break; 
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
