// backend/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const registerSocketHandlers = require('./socketHandlers');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend's domain
    methods: ['GET', 'POST'],
  },
});

// Centralized connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register all event handlers for this socket
  registerSocketHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Disconnect logic is handled within socketHandlers.js
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
