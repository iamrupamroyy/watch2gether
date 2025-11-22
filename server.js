// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const axios = require('axios'); // Import axios

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Proxy Route for Video Streaming ---
app.get('/stream/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const googleDriveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        console.log(`Proxying request for fileId: ${fileId}`);

        const response = await axios({
            method: 'get',
            url: googleDriveUrl,
            responseType: 'stream',
        });

        console.log('Successfully connected to Google Drive URL. Piping stream to client...');

        res.setHeader('Content-Type', response.headers['content-type']);

        response.data.on('data', (chunk) => {
          // This will log the size of each chunk of video data received
          // console.log(`Received chunk of size: ${chunk.length}`);
        });

        response.data.on('error', (err) => {
            console.error('[ERROR] Error in stream from Google Drive:', err.message);
            if (!res.headersSent) {
                res.status(500).send('Stream from source failed.');
            }
        });

        response.data.pipe(res);

    } catch (error) {
        console.error('[ERROR] Failed to initiate stream proxy:', error.message);
        if (!res.headersSent) {
            res.status(500).send('Error initiating video stream.');
        }
    }
});

// In-memory storage for rooms
const rooms = {};

// Function to generate a simple random room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // --- Room Creation ---
    socket.on('createRoom', ({ videoUrl }) => {
        let newRoomCode = generateRoomCode();
        while (rooms[newRoomCode]) {
            newRoomCode = generateRoomCode();
        }

        let streamUrl;

        // Check if it's a Google Drive link to proxy it
        if (videoUrl.includes('drive.google.com/file/d/')) {
            try {
                const fileId = videoUrl.split('/d/')[1].split('/')[0];
                streamUrl = `/stream/${fileId}`; // Use our local proxy
            } catch (e) {
                socket.emit('error', 'Invalid Google Drive link format.');
                return;
            }
        } else {
            // Otherwise, assume it's a direct link and use it as-is
            streamUrl = videoUrl;
        }
        
        rooms[newRoomCode] = {
            id: newRoomCode,
            videoUrl: streamUrl, // Store the correct URL (either proxy or direct)
            state: {
                isPlaying: false,
                currentTime: 0,
                lastUpdate: Date.now()
            },
            users: new Set([socket.id])
        };

        socket.join(newRoomCode);
        socket.emit('roomCreated', { roomCode: newRoomCode, videoUrl: streamUrl });
        console.log(`Room created: ${newRoomCode}`);
    });

    // --- Room Joining ---
    socket.on('joinRoom', ({ roomCode }) => {
        if (!rooms[roomCode]) {
            socket.emit('error', 'Room not found.');
            return;
        }

        rooms[roomCode].users.add(socket.id);
        socket.join(roomCode);
        
        socket.emit('roomJoined', { 
            roomCode: roomCode, 
            videoUrl: rooms[roomCode].videoUrl,
            playbackState: rooms[roomCode].state 
        });

        console.log(`User ${socket.id} joined room ${roomCode}`);
    });

    // --- Playback Synchronization ---
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
                io.to(roomCode).emit('sync', newState);
                console.log(`Playback action in room ${roomCode}:`, newState);
            }
        }
    });

    // --- Disconnect Handling ---
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        for (const roomCode in rooms) {
            if (rooms[roomCode].users.has(socket.id)) {
                rooms[roomCode].users.delete(socket.id);
                if (rooms[roomCode].users.size === 0) {
                    delete rooms[roomCode];
                    console.log(`Room ${roomCode} is empty and has been deleted.`);
                }
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
