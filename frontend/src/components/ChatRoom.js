import React, { useState, useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
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

  const loadHistory = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8083/api/chat/rooms/${room}/history`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, [room]);

  useEffect(() => {
    // Load message history
    loadHistory();

    // Connect to WebSocket using @stomp/stompjs
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8083/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected!');
        setConnected(true);
        setStompClient(client);
        
        // Subscribe to room messages
        client.subscribe(`/topic/room/${room}`, (message) => {
          console.log('Received message from WebSocket:', message.body);
          const newMessage = JSON.parse(message.body);
          console.log('Parsed message:', newMessage);
          setMessages((prev) => [...prev, newMessage]);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setConnected(false);
      },
      onWebSocketClose: () => {
        setConnected(false);
      }
    });

    client.activate();

    return () => {
      if (client && client.active) {
        client.deactivate();
      }
    };
  }, [room, loadHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


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
      
      console.log('Sending message:', message);
      stompClient.publish({
        destination: '/app/send',
        body: JSON.stringify(message)
      });
    } else {
      console.log('Cannot send message - stompClient:', !!stompClient, 'connected:', connected, 'content:', content);
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

