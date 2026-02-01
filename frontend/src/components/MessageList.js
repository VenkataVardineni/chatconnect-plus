import React from 'react';
import './MessageList.css';

function MessageList({ messages, currentUser }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id || `${message.timestamp}-${message.nickname}`}
            className={`message ${message.nickname === currentUser ? 'own-message' : ''}`}
          >
            <div className="message-header">
              <span className="message-nickname">{message.nickname}</span>
              <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))
      )}
    </div>
  );
}

export default MessageList;

