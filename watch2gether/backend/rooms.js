// backend/rooms.js

// In-memory store for rooms. A Map is used for efficient lookups and deletions.
// In a production environment, you would replace this with a persistent store like Redis.
const rooms = new Map();

/**
 * Creates a new room with a unique ID.
 * @param {string} hostSocketId The socket ID of the host creating the room.
 * @returns {object} The newly created room object.
 */
const createRoom = (hostSocketId, username) => {
  const roomId = generateRoomId();
  const newRoom = {
    id: roomId,
    videoUrl: null,
    isPlaying: false,
    videoTime: 0,
    lastUpdateTimestamp: Date.now(),
    users: [{ id: hostSocketId, username: username, isHost: true }],
  };
  rooms.set(roomId, newRoom);
  console.log(`Room created: ${roomId}`);
  return newRoom;
};

/**
 * Retrieves a room by its ID.
 * @param {string} roomId The ID of the room to retrieve.
 * @returns {object | undefined} The room object or undefined if not found.
 */
const getRoom = (roomId) => {
  return rooms.get(roomId);
};

/**
 * Adds a user to an existing room.
 * @param {string} roomId The ID of the room to join.
 * @param {string} userSocketId The socket ID of the user joining.
 * @returns {object | null} The updated room object or null if the room doesn't exist.
 */
const addUserToRoom = (roomId, userSocketId, username) => {
  const room = getRoom(roomId);
  if (room) {
    // Check if user is already in the room to prevent duplicates
    if (!room.users.some(user => user.id === userSocketId)) {
      room.users.push({ id: userSocketId, username: username, isHost: false });
    }
    return room;
  }
  return null;
};

/**
 * Removes a user from any room they might be in.
 * This is typically called on socket disconnection.
 * @param {string} userSocketId The socket ID of the user to remove.
 * @returns {{ roomId: string, updatedRoom: object, wasHost: boolean } | null} An object containing the room ID, the updated room, and whether the user was the host, or null if the user wasn't in a room.
 */
const removeUserFromRoom = (userSocketId) => {
  for (const [roomId, room] of rooms.entries()) {
    const userIndex = room.users.findIndex(user => user.id === userSocketId);
    if (userIndex !== -1) {
      const wasHost = room.users[userIndex].isHost;
      room.users.splice(userIndex, 1);

      // If the room is now empty, delete it.
      if (room.users.length === 0) {
        rooms.delete(roomId);
        console.log(`Room deleted: ${roomId}`);
        return { roomId, updatedRoom: null, wasHost }; // No updated room to return
      }

      // If the host disconnected, assign a new host.
      if (wasHost) {
        room.users[0].isHost = true;
        console.log(`New host for room ${roomId}: ${room.users[0].id}`);
      }
      
      return { roomId, updatedRoom: room, wasHost };
    }
  }
  return null;
};

/**
 * Updates the state of a room.
 * @param {string} roomId The ID of the room to update.
 * @param {object} newState The new state properties to merge.
 * @returns {object | undefined} The updated room object.
 */
const updateRoomState = (roomId, newState) => {
    const room = getRoom(roomId);
    if (room) {
        const updatedRoom = { ...room, ...newState, lastUpdateTimestamp: Date.now() };
        rooms.set(roomId, updatedRoom);
        return updatedRoom;
    }
    return undefined;
};


/**
 * Generates a random 4-character string for the room ID.
 * @returns {string} A unique room ID.
 */
const generateRoomId = () => {
  let newId;
  do {
    newId = Math.random().toString(36).substring(2, 6).toUpperCase();
  } while (rooms.has(newId)); // Ensure the ID is unique
  return newId;
};

/**
 * Returns a list of all rooms with public-safe information.
 * @returns {Array<{id: string, userCount: number, videoUrl: string | null}>}
 */
const getPublicRooms = () => {
  const publicRooms = [];
  for (const [roomId, room] of rooms.entries()) {
    publicRooms.push({
      id: roomId,
      userCount: room.users.length,
      videoUrl: room.videoUrl,
    });
  }
  return publicRooms;
};

module.exports = {
  createRoom,
  getRoom,
  addUserToRoom,
  removeUserFromRoom,
  updateRoomState,
  getPublicRooms,
};
