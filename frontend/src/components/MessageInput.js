import React, { useState } from 'react';
import './MessageInput.css';

function MessageInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? "Connecting..." : "Type a message..."}
          disabled={disabled}
          className="message-input"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default MessageInput;

