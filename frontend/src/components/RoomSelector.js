import React from 'react';
import './RoomSelector.css';

function RoomSelector({ rooms, onJoinRoom, nickname }) {
  return (
    <div className="room-selector">
      <div className="room-selector-header">
        <h1>ChatConnect++</h1>
        <p>Welcome, <strong>{nickname}</strong>!</p>
      </div>
      <div className="room-selector-content">
        <h2>Select a Room</h2>
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div
              key={room}
              className="room-card"
              onClick={() => onJoinRoom(room)}
            >
              <div className="room-icon">#</div>
              <div className="room-name">{room}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoomSelector;

