// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import VideoPlayer from './VideoPlayer';
import ThemeToggler from './ThemeToggler';

function App() {
  const [room, setRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    // Persist username
    localStorage.setItem('username', username);
  }, [username]);

  useEffect(() => {
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
    
    function onUserJoined({ user }) {
        setRoom(prevRoom => {
          if (prevRoom && user) {
            // Avoid adding duplicate users
            if (prevRoom.users.some(u => u.id === user.id)) {
              return prevRoom;
            }
            return {...prevRoom, users: [...prevRoom.users, user]};
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
  }, []);

  const handleCreateRoom = () => {
    if (username.trim()) {
      socket.emit('create-room', { username });
    } else {
      alert('Please enter a username.');
    }
  };

  const handleJoinRoom = (roomId) => {
    if (username.trim()) {
      socket.emit('join-room', { roomId, username });
    } else {
      alert('Please enter a username.');
    }
  };

  const handleLeaveRoom = () => {
    if (room) {
      socket.emit('leave-room', room.id);
      setRoom(null);
    }
  };

  return (
    <div className="app-container">
      <ThemeToggler />
      {!room ? (
        <div className="lobby-container">
          <div className="lobby-card">
            <h1>watch2gether</h1>
            <p>Your personal space to watch videos with friends.</p>
            
            <div className="username-form">
                <input 
                    type="text" 
                    placeholder="Enter your username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />
            </div>

            <button onClick={handleCreateRoom} className="btn-primary" disabled={!username.trim()}>
              Create New Room
            </button>
            <hr />
            <div className="room-list">
              <h3>Available Rooms</h3>
              {availableRooms.length === 0 ? (
                <p className="no-rooms-message">No rooms available. Why not create one?</p>
              ) : (
                <ul>
                  {availableRooms.map((r) => (
                    <li key={r.id} className="room-item">
                      <span>
                        Room {r.id} ({r.userCount} user{r.userCount > 1 ? 's' : ''})
                      </span>
                      <button onClick={() => handleJoinRoom(r.id)} className="btn-secondary" disabled={!username.trim()}>
                        Join
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <VideoPlayer room={room} setRoom={setRoom} onLeaveRoom={handleLeaveRoom} />
      )}
    </div>
  );
}

export default App;
