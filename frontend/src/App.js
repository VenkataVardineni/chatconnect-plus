import React, { useState, useEffect } from 'react';
import './App.css';
import ChatRoom from './components/ChatRoom';
import RoomSelector from './components/RoomSelector';
import UserSetup from './components/UserSetup';

function App() {
  const [nickname, setNickname] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [rooms, setRooms] = useState(['general', 'random', 'tech', 'gaming']);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  const handleNicknameSet = (name) => {
    setNickname(name);
    localStorage.setItem('nickname', name);
  };

  const handleRoomJoin = (room) => {
    setCurrentRoom(room);
    setIsConnected(true);
  };

  const handleRoomLeave = () => {
    setCurrentRoom('');
    setIsConnected(false);
  };

  if (!nickname) {
    return <UserSetup onNicknameSet={handleNicknameSet} />;
  }

  if (!currentRoom) {
    return (
      <RoomSelector
        rooms={rooms}
        onJoinRoom={handleRoomJoin}
        nickname={nickname}
      />
    );
  }

  return (
    <ChatRoom
      room={currentRoom}
      nickname={nickname}
      onLeaveRoom={handleRoomLeave}
    />
  );
}

export default App;

