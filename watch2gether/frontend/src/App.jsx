// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import VideoPlayer from './VideoPlayer';

function App() {
  const [room, setRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    // These listeners are set up once and use functional updates
    // to avoid issues with stale state in closures.

    function onRoomCreated(newRoom) {
      setRoom(newRoom);
    }

    function onJoinSuccess(joinedRoom) {
      setRoom(joinedRoom);
    }
    
    function onRoomListUpdate(rooms) {
      setAvailableRooms(rooms);
    }

    function onStateUpdate(updatedRoom) {
      setRoom(prevRoom => {
        if (prevRoom && prevRoom.id === updatedRoom.id) {
          return updatedRoom;
        }
        return prevRoom;
      });
    }
    
    function onUserJoined(data) {
      setRoom(prevRoom => {
        if (prevRoom) {
          return {...prevRoom, users: [...prevRoom.users, {id: data.userId, isHost: false}]};
        }
        return prevRoom;
      });
    }

    function onUserLeft(data) {
      setRoom(prevRoom => {
        if (prevRoom) {
          const newUsers = prevRoom.users.filter(user => user.id !== data.userId);
          if (data.newHostId) {
            const newHostIndex = newUsers.findIndex(user => user.id === data.newHostId);
            if (newHostIndex !== -1) {
              newUsers[newHostIndex].isHost = true;
            }
          }
          return {...prevRoom, users: newUsers};
        }
        return prevRoom;
      });
    }

    socket.on('room-created', onRoomCreated);
    socket.on('join-success', onJoinSuccess);
    socket.on('room-list-update', onRoomListUpdate);
    socket.on('state-update', onStateUpdate);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);

    return () => {
      socket.off('room-created', onRoomCreated);
      socket.off('join-success', onJoinSuccess);
      socket.off('room-list-update', onRoomListUpdate);
      socket.off('state-update', onStateUpdate);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
    };
  }, []); // Empty dependency array ensures this effect runs only once.

  const handleCreateRoom = () => {
    socket.emit('create-room');
  };

  const handleJoinRoom = (roomId) => {
    socket.emit('join-room', roomId);
  };

  // Lobby View
  if (!room) {
    return (
      <div>
        <h1>watch2gether</h1>
        <h2>Lobby</h2>
        <button onClick={handleCreateRoom}>Create New Room</button>
        <hr />
        <h3>Available Rooms</h3>
        {availableRooms.length === 0 ? (
          <p>No rooms available. Why not create one?</p>
        ) : (
          <ul>
            {availableRooms.map((r) => (
              <li key={r.id}>
                Room {r.id} ({r.userCount} user{r.userCount > 1 ? 's' : ''})
                <button onClick={() => handleJoinRoom(r.id)} style={{marginLeft: "10px"}}>
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Room View
  return <VideoPlayer room={room} setRoom={setRoom} />;
}

export default App;
