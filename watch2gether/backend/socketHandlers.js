// backend/socketHandlers.js
const {
  createRoom,
  getRoom,
  addUserToRoom,
  removeUserFromRoom,
  updateRoomState,
  getPublicRooms,
} = require('./rooms');

// Interval for periodic state synchronization (in milliseconds)
const SYNC_INTERVAL = 5000;

// Store intervals for each room to manage them properly
const syncIntervals = new Map();

/**
 * Emits the full list of public rooms to all connected clients.
 * @param {import('socket.io').Server} io The Socket.IO server instance.
 */
const broadcastRoomList = (io) => {
  const rooms = getPublicRooms();
  io.emit('room-list-update', rooms);
};

/**
 * Registers all socket event handlers for a given socket connection.
 * @param {import('socket.io').Server} io The Socket.IO server instance.
 * @param {import('socket.io').Socket} socket The socket instance for the connected client.
 */
const registerSocketHandlers = (io, socket) => {
  
  // --- Initial Connection ---
  // Send the current room list to the newly connected client.
  socket.emit('room-list-update', getPublicRooms());

  // --- Room Management Events ---
  /**
   * Handles room creation. The user who creates the room is the initial host.
   */
  socket.on('create-room', ({ username }) => {
    const newRoom = createRoom(socket.id, username);
    socket.join(newRoom.id);
    socket.emit('room-created', newRoom);
    startSyncingRoom(newRoom.id);
    broadcastRoomList(io); // Update lobby for all clients
  });

  /**
   * Handles a user joining an existing room.
   * @param {string} roomId The ID of the room to join.
   */
  socket.on('join-room', ({ roomId, username }) => {
    const room = addUserToRoom(roomId, socket.id, username);
    if (room) {
      socket.join(roomId);
      socket.emit('join-success', room);
      const newUser = room.users.find(u => u.id === socket.id);
      socket.to(roomId).emit('user-joined', { user: newUser });
      broadcastRoomList(io); // Update user count in lobby
    } else {
      socket.emit('error-joining', 'Room not found.');
    }
  });

  /**
   * Handles a user leaving a room.
   * @param {string} roomId The ID of the room to leave.
   */
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    const result = removeUserFromRoom(socket.id);
    if (result) {
      const { updatedRoom, newHostId } = result;
      if (updatedRoom) {
        // Notify remaining users that someone has left
        io.to(roomId).emit('user-left', { userId: socket.id, newHostId: newHostId });
      } else {
        // If the room was deleted, stop its sync interval
        stopSyncingRoom(roomId);
      }
      broadcastRoomList(io); // Update lobby for all clients
    }
  });

  /**
   * Handles the disconnection of a socket.
   */
  socket.on('disconnect', () => {
    const result = removeUserFromRoom(socket.id);
    if (result) {
      const { roomId, updatedRoom, newHostId } = result;
      
      if (updatedRoom) {
        // Notify remaining users that someone has left
        io.to(roomId).emit('user-left', { userId: socket.id, newHostId: newHostId });
      } else {
        // If the room was deleted, stop its sync interval
        stopSyncingRoom(roomId);
      }
      broadcastRoomList(io); // Update lobby for all clients
    }
  });

  // --- Video Sync Events ---
  socket.on('play-request', ({ roomId, videoTime }) => {
    const room = getRoom(roomId);
    if (room && !room.isPlaying) {
      const newState = { isPlaying: true, videoTime };
      const updatedRoom = updateRoomState(roomId, newState);
      io.to(roomId).emit('state-update', updatedRoom);
    }
  });

  socket.on('pause-request', ({ roomId, videoTime }) => {
    const room = getRoom(roomId);
    if (room && room.isPlaying) {
      const newState = { isPlaying: false, videoTime };
      const updatedRoom = updateRoomState(roomId, newState);
      io.to(roomId).emit('state-update', updatedRoom);
    }
  });

  socket.on('sync-state', ({ roomId, newState }) => {
    const updatedRoom = updateRoomState(roomId, newState);
    if (updatedRoom) {
      io.to(roomId).emit('state-update', updatedRoom);
    }
  });

  // --- Interval Management ---
  const startSyncingRoom = (roomId) => {
    if (syncIntervals.has(roomId)) return;
    const interval = setInterval(() => {
      const room = getRoom(roomId);
      if (room) {
        if (room.isPlaying) {
            const timeElapsed = (Date.now() - room.lastUpdateTimestamp) / 1000;
            room.videoTime += timeElapsed;
            room.lastUpdateTimestamp = Date.now();
        }
        io.to(roomId).emit('sync-state', room);
      } else {
        stopSyncingRoom(roomId);
      }
    }, SYNC_INTERVAL);
    syncIntervals.set(roomId, interval);
  };

  const stopSyncingRoom = (roomId) => {
    if (syncIntervals.has(roomId)) {
      clearInterval(syncIntervals.get(roomId));
      syncIntervals.delete(roomId);
      console.log(`Stopped syncing for room: ${roomId}`);
    }
  };
};

module.exports = registerSocketHandlers;
