import React, { useState } from 'react';
import './UserSetup.css';

function UserSetup({ onNicknameSet }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onNicknameSet(input.trim());
    }
  };

  return (
    <div className="user-setup">
      <div className="user-setup-card">
        <h1>Welcome to ChatConnect++</h1>
        <p>Enter your nickname to get started</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your nickname"
            maxLength={20}
            autoFocus
          />
          <button type="submit">Join Chat</button>
        </form>
      </div>
    </div>
  );
}

export default UserSetup;

