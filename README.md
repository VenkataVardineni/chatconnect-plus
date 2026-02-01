# ChatConnect++

A real-time multi-room chat platform using WebSockets and Kafka, designed to handle many concurrent users with a Slack-like interface.

## Overview

ChatConnect++ is a scalable, event-driven chat application that enables real-time communication across multiple chat rooms. Built with modern microservices architecture, it provides instant message delivery, persistent message history, and a clean, intuitive user interface.

## Features

### Core Functionality

- **Multi-Room Chat**: Users can join and participate in multiple chat rooms/channels simultaneously
- **Real-Time Messaging**: Instant message delivery using WebSocket technology (STOMP over SockJS)
- **Persistent History**: All messages are stored in PostgreSQL and can be retrieved when joining a room
- **User Presence**: Display active users in each chat room
- **Nickname Management**: Set and persist your nickname across sessions
- **Room Selection**: Easy navigation between different chat rooms

### Technical Features

- **Event-Driven Architecture**: Kafka-based message broker for scalable message distribution
- **Microservices Design**: Separated frontend, gateway, and backend services
- **Horizontal Scalability**: Architecture supports multiple chat-service instances
- **Message Durability**: All messages are persisted to ensure no data loss
- **Low Latency**: Optimized for real-time communication with minimal delay

## Architecture

ChatConnect++ uses an event-driven microservices architecture with the following components:

```
┌─────────────┐
│   Client    │  React Frontend (Port 3001)
│  (Browser)  │
└──────┬──────┘
       │
       │ WebSocket/HTTP
       │
┌──────▼─────────────────────────────────────┐
│           API Gateway (Nginx)              │  Port 8083
│         - Request Routing                  │
│         - WebSocket Proxying               │
│         - CORS Handling                    │
└──────┬─────────────────────────────────────┘
       │
┌──────▼─────────────────────────────────────┐
│         Chat Service (Spring Boot)          │  Port 8082
│  ┌──────────────────────────────────────┐  │
│  │  WebSocket Handler                   │  │
│  │  - STOMP over SockJS                 │  │
│  │  - Real-time message delivery        │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Kafka Producer                      │  │
│  │  - Publishes messages to Kafka       │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │  Kafka Consumer                      │  │
│  │  - Consumes messages from Kafka      │  │
│  │  - Persists to PostgreSQL            │  │
│  │  - Broadcasts via WebSocket          │  │
│  └──────────────────────────────────────┘  │
└──────┬─────────────────────────────────────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐
│   Kafka     │  │ PostgreSQL  │  │   Frontend   │
│  Port: 9092 │  │ Port: 5433  │  │  Port: 3001  │
└─────────────┘  └─────────────┘  └──────────────┘
```

## Components

### Frontend (React)

**Location**: `frontend/`

**Technology Stack**:
- React 18
- SockJS Client
- STOMP.js
- Axios for HTTP requests

**Key Components**:

1. **App.js**: Main application component managing application state
   - Handles nickname setup and persistence
   - Manages room selection flow
   - Coordinates between UserSetup, RoomSelector, and ChatRoom components

2. **UserSetup.js**: Initial user setup screen
   - Allows users to set their nickname
   - Persists nickname to localStorage
   - Validates nickname input

3. **RoomSelector.js**: Room selection interface
   - Displays available chat rooms
   - Allows users to join a room
   - Shows predefined rooms (general, random, tech, gaming)

4. **ChatRoom.js**: Main chat interface
   - Establishes WebSocket connection using STOMP over SockJS
   - Subscribes to room-specific message topics
   - Loads message history on room join
   - Handles sending and receiving messages
   - Displays connection status
   - Auto-scrolls to latest messages

5. **MessageList.js**: Message display component
   - Renders list of messages
   - Highlights current user's messages
   - Formats timestamps
   - Displays message content and sender

6. **MessageInput.js**: Message input component
   - Text input for composing messages
   - Send button functionality
   - Enter key support for sending
   - Disabled state when disconnected

7. **UserList.js**: Active users display
   - Shows list of users in current room
   - Updates dynamically as users join/leave

**Functionality**:
- Real-time WebSocket connection management
- Message sending and receiving
- Room history loading
- Connection status monitoring
- Automatic reconnection on disconnect

### API Gateway (Nginx)

**Location**: `gateway/`

**Technology**: Nginx

**Responsibilities**:
- Routes HTTP requests to chat-service
- Proxies WebSocket connections
- Handles CORS headers for cross-origin requests
- Provides single entry point for all client requests

**Configuration**:
- Listens on port 8083
- Routes `/api/*` to chat-service API endpoints
- Routes `/ws/*` to chat-service WebSocket endpoint
- Adds CORS headers for `http://localhost:3001`

### Chat Service (Spring Boot)

**Location**: `chat-service/`

**Technology Stack**:
- Spring Boot 3.2.0
- Spring WebSocket (STOMP)
- Spring Kafka
- Spring Data JPA
- PostgreSQL Driver

**Key Components**:

1. **ChatController.java**: REST and WebSocket controller
   - `@MessageMapping("/send")`: Receives messages via WebSocket
   - `GET /api/chat/rooms/{room}/history`: Retrieves message history for a room
   - `GET /api/chat/health`: Health check endpoint

2. **WebSocketConfig.java**: WebSocket configuration
   - Configures STOMP endpoint at `/ws`
   - Sets up message broker for topic-based broadcasting
   - Configures application destination prefix `/app`
   - Enables SockJS fallback support

3. **KafkaProducer.java**: Kafka message producer
   - Publishes messages to `chat-messages` topic
   - Uses room name as message key for partitioning
   - Serializes messages as JSON

4. **KafkaConsumer.java**: Kafka message consumer
   - Consumes messages from `chat-messages` topic
   - Persists messages to PostgreSQL database
   - Broadcasts messages to WebSocket subscribers
   - Handles message deserialization

5. **ChatService.java**: Business logic service
   - Saves messages to database
   - Retrieves room message history
   - Converts between Entity and DTO objects

6. **Message.java**: JPA Entity
   - Represents message in database
   - Fields: id, room, nickname, content, timestamp
   - Auto-generated ID and timestamps

7. **MessageDTO.java**: Data Transfer Object
   - Used for API communication
   - JSON serialization/deserialization
   - Timestamp formatting

8. **MessageRepository.java**: Spring Data JPA repository
   - Provides database access methods
   - Query methods for room history retrieval

**Functionality**:
- WebSocket connection management
- Message processing and validation
- Kafka message publishing and consumption
- Database persistence
- Real-time message broadcasting
- Message history retrieval

### Kafka

**Technology**: Apache Kafka 7.5.0

**Configuration**:
- Single broker setup (suitable for development)
- Topic: `chat-messages`
- Messages partitioned by room name
- Enables horizontal scaling of chat-service instances

**Role**:
- Decouples message producers and consumers
- Provides message durability
- Enables multiple service instances to process messages
- Supports message replay capability

### PostgreSQL

**Technology**: PostgreSQL 15

**Schema**:
```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    room VARCHAR(255) NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
```

**Functionality**:
- Persistent storage of all chat messages
- Fast retrieval of room-specific message history
- Data durability and reliability

## Data Flow

### Message Sending Flow

1. **User Input**: User types a message in the frontend and clicks send
2. **WebSocket Send**: Frontend sends message via STOMP to `/app/send` endpoint
3. **Controller Receives**: ChatController receives message via `@MessageMapping("/send")`
4. **Kafka Publish**: KafkaProducer publishes message to `chat-messages` topic
5. **Kafka Consume**: KafkaConsumer receives message from topic
6. **Database Persist**: Message is saved to PostgreSQL via ChatService
7. **WebSocket Broadcast**: Message is broadcast to all subscribers of `/topic/room/{roomName}`
8. **Client Receives**: All connected clients in the room receive the message via WebSocket
9. **UI Update**: Frontend updates the message list with the new message

### Message History Flow

1. **Room Join**: User selects a room in the frontend
2. **History Request**: Frontend makes HTTP GET request to `/api/chat/rooms/{room}/history`
3. **Database Query**: ChatService queries PostgreSQL for messages in the room
4. **Response**: Messages are returned as JSON array
5. **Display**: Frontend displays the message history in chronological order

### WebSocket Connection Flow

1. **Client Connect**: Frontend establishes WebSocket connection to `/ws` endpoint
2. **STOMP Handshake**: STOMP protocol handshake completes
3. **Topic Subscribe**: Client subscribes to `/topic/room/{roomName}` for the current room
4. **Connection Active**: Connection remains open for real-time message delivery
5. **Auto-Reconnect**: If connection drops, client automatically reconnects

## Technology Stack

### Backend
- **Spring Boot 3.2.0**: Application framework
- **Spring WebSocket**: WebSocket support with STOMP protocol
- **Spring Kafka**: Kafka integration for messaging
- **Spring Data JPA**: Database access layer
- **PostgreSQL**: Relational database
- **Lombok**: Reduces boilerplate code

### Frontend
- **React 18**: UI framework
- **SockJS**: WebSocket client library
- **STOMP.js**: STOMP protocol implementation
- **Axios**: HTTP client for API calls
- **react-app-rewired**: Webpack configuration customization

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: API gateway and reverse proxy
- **Apache Kafka**: Message broker
- **Zookeeper**: Kafka coordination service

## Project Structure

```
chatconnect-plus/
├── chat-service/          # Spring Boot backend service
│   ├── src/
│   │   └── main/
│   │       ├── java/com/chatconnect/chatservice/
│   │       │   ├── config/          # Configuration classes
│   │       │   ├── controller/     # REST and WebSocket controllers
│   │       │   ├── kafka/          # Kafka producer and consumer
│   │       │   ├── model/          # Entity and DTO classes
│   │       │   ├── repository/    # Data access layer
│   │       │   └── service/        # Business logic
│   │       └── resources/
│   │           └── application.yml # Application configuration
│   └── Dockerfile
│
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ChatRoom.js
│   │   │   ├── MessageList.js
│   │   │   ├── MessageInput.js
│   │   │   ├── RoomSelector.js
│   │   │   ├── UserSetup.js
│   │   │   └── UserList.js
│   │   ├── App.js         # Main application component
│   │   └── index.js       # Application entry point
│   ├── public/
│   └── Dockerfile
│
├── gateway/               # Nginx API gateway
│   ├── nginx.conf        # Nginx configuration
│   └── Dockerfile
│
├── infra/                # Infrastructure configuration
│   └── docker-compose.yml # Docker Compose configuration
│
└── docs/                 # Documentation
    └── architecture.md   # Detailed architecture documentation
```

## API Endpoints

### WebSocket Endpoints

- **Connection**: `ws://localhost:8083/ws`
- **Send Message**: `/app/send` (STOMP destination)
- **Subscribe to Room**: `/topic/room/{roomName}` (STOMP subscription)

### REST Endpoints

- **GET** `/api/chat/rooms/{room}/history` - Get message history for a room
- **GET** `/api/chat/health` - Health check endpoint

## Environment Variables

### Chat Service
- `SPRING_DATASOURCE_URL`: PostgreSQL connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `SPRING_KAFKA_BOOTSTRAP_SERVERS`: Kafka bootstrap servers

### Frontend
- `REACT_APP_API_URL`: Backend API URL (for local development)

## Ports

- **Frontend**: 3001
- **Gateway**: 8083
- **Chat Service**: 8082 (external), 8080 (internal)
- **PostgreSQL**: 5433 (external), 5432 (internal)
- **Kafka**: 9092
- **Zookeeper**: 2181

## License

MIT
