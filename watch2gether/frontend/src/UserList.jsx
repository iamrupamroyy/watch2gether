// frontend/src/UserList.jsx
import React from 'react';
import './UserList.css';

const UserList = ({ users }) => {
  return (
    <div className="user-list-container">
      <h3>Users in Room</h3>
      <ul className="user-list">
        {users.map(user => (
          <li key={user.id} className="user-list-item">
            {user.username}
            {user.isHost && <span className="host-badge">Host</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
