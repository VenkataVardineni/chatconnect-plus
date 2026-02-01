import React from 'react';
import './UserList.css';

function UserList({ users }) {
  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Online ({users.length})</h3>
      </div>
      <div className="user-list-content">
        {users.map((user, index) => (
          <div key={index} className="user-item">
            <span className="user-indicator">●</span>
            <span className="user-name">{user}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;

