// frontend/src/UserList.jsx
import React from 'react';
import './UserList.css';

const UserAvatar = () => (
  <svg className="user-avatar" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const UserList = ({ users }) => {
  return (
    <div className="user-list-container">
      <h3>Users in Room</h3>
      <ul className="user-list">
        {users.map(user => (
          <li key={user.id} className="user-list-item">
            <div className="user-info-container">
              <UserAvatar />
              <span className="username">{user.username}</span>
            </div>
            {user.isHost && <span className="host-badge">Host</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
