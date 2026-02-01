import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from 'stompjs';
import axios from 'axios';
import './ChatRoom.css';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';

function ChatRoom({ room, nickname, onLeaveRoom }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([nickname]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load message history
    loadHistory();

    // Connect to WebSocket
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Client.over(socket);
    
    client.connect({}, () => {
      setConnected(true);
      setStompClient(client);
      
      // Subscribe to room messages
      client.subscribe(`/topic/room/${room}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMessage]);
      });
    }, (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, [room]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/chat/rooms/${room}/history`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (content) => {
    if (stompClient && connected && content.trim()) {
      const message = {
        room: room,
        nickname: nickname,
        content: content.trim(),
        timestamp: new Date().toISOString()
      };
      
      stompClient.send('/app/send', {}, JSON.stringify(message));
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="back-button" onClick={onLeaveRoom}>← Back</button>
          <h2>#{room}</h2>
        </div>
        <div className="chat-header-right">
          <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="chat-main">
        <div className="chat-messages-container">
          <MessageList messages={messages} currentUser={nickname} />
          <div ref={messagesEndRef} />
        </div>
        
        <UserList users={users} />
      </div>
      
      <MessageInput onSendMessage={sendMessage} disabled={!connected} />
    </div>
  );
}

export default ChatRoom;

