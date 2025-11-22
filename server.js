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

        // Make a request to Google Drive and get the response as a stream
        const response = await axios({
            method: 'get',
            url: googleDriveUrl,
            responseType: 'stream',
        });

        // Set the content type header to what Google Drive provides
        res.setHeader('Content-Type', response.headers['content-type']);

        // Pipe the stream from Google Drive directly to the client's response
        response.data.pipe(res);

    } catch (error) {
        console.error('Error proxying stream:', error.message);
        res.status(500).send('Error fetching video stream.');
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

        let fileId = null;
        // Transform Google Drive URL to get the file ID
        if (videoUrl.includes('drive.google.com/file/d/')) {
            try {
                fileId = videoUrl.split('/d/')[1].split('/')[0];
            } catch (e) {
                socket.emit('error', 'Invalid Google Drive link format.');
                return;
            }
        } else {
            socket.emit('error', 'Please provide a valid Google Drive shareable link.');
            return;
        }

        // The URL for the video player will now be our local proxy
        const localStreamUrl = `/stream/${fileId}`;
        
        rooms[newRoomCode] = {
            id: newRoomCode,
            videoUrl: localStreamUrl, // Store the proxy URL
            state: {
                isPlaying: false,
                currentTime: 0,
                lastUpdate: Date.now()
            },
            users: new Set([socket.id])
        };

        socket.join(newRoomCode);
        // Send the proxy URL to the client
        socket.emit('roomCreated', { roomCode: newRoomCode, videoUrl: localStreamUrl });
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
