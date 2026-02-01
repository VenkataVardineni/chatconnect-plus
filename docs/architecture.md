# ChatConnect++ Architecture

## Overview

ChatConnect++ is a real-time multi-room chat platform built with an event-driven microservices architecture. The system is designed to handle many concurrent users while maintaining low latency and high availability.

## Architecture Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ WebSocket/HTTP
       │
┌──────▼─────────────────────────────────────┐
│           API Gateway (Nginx)              │
│         Port: 8081                          │
└──────┬─────────────────────────────────────┘
       │
       │
┌──────▼─────────────────────────────────────┐
│         Chat Service (Spring Boot)          │
│         Port: 8080                          │
│  ┌──────────────────────────────────────┐  │
│  │  WebSocket Endpoint (/ws)            │  │
│  │  - STOMP over SockJS                 │  │
│  │  - Real-time message delivery        │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Kafka Producer                       │  │
│  │  - Publishes messages to Kafka        │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │  Kafka Consumer                       │  │
│  │  - Consumes messages from Kafka       │  │
│  │  - Persists to PostgreSQL             │  │
│  │  - Broadcasts via WebSocket           │  │
│  └──────────────────────────────────────┘  │
└──────┬─────────────────────────────────────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐
│   Kafka     │  │ PostgreSQL  │  │   Frontend   │
│  Port: 9092 │  │ Port: 5432  │  │  Port: 3000  │
└─────────────┘  └─────────────┘  └──────────────┘
```

## Components

### 1. Frontend (React)

**Technology**: React 18, SockJS, STOMP.js

**Responsibilities**:
- User interface for chat rooms
- WebSocket client connection
- Real-time message display
- Room selection and user presence

**Key Features**:
- Nickname setup and persistence
- Multi-room support
- Live message updates
- User list display
- Message history loading

### 2. API Gateway (Nginx)

**Technology**: Nginx

**Responsibilities**:
- Request routing to backend services
- WebSocket proxy configuration
- Load balancing (future scalability)

**Configuration**:
- Routes all requests to chat-service
- Handles WebSocket upgrade requests
- Exposes port 8081

### 3. Chat Service (Spring Boot)

**Technology**: Spring Boot 3.2, Spring WebSocket, Spring Kafka, Spring Data JPA

**Responsibilities**:
- WebSocket connection management
- Message processing and routing
- Kafka message publishing
- Database persistence
- Message history retrieval

**Key Components**:

#### WebSocket Configuration
- STOMP endpoint at `/ws`
- Topic-based message broadcasting (`/topic/room/{roomName}`)
- Application destination prefix: `/app`

#### Kafka Integration
- **Producer**: Publishes messages to `chat-messages` topic
- **Consumer**: Consumes messages, persists to DB, broadcasts via WebSocket
- Topic partitioning by room name for scalability

#### Database Schema
```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    room VARCHAR(255) NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
```

### 4. Kafka

**Technology**: Apache Kafka 7.5.0

**Responsibilities**:
- Message broker for decoupling producers and consumers
- Enables horizontal scaling of chat service instances
- Provides message durability and replay capability

**Configuration**:
- Single broker setup (development)
- Topic: `chat-messages`
- Partitioned by room name

### 5. PostgreSQL

**Technology**: PostgreSQL 15

**Responsibilities**:
- Persistent storage of all chat messages
- Message history retrieval
- Data durability

**Schema**:
- Messages table with room, nickname, content, and timestamp
- Indexed by room for fast queries

## Data Flow

### Message Sending Flow

1. **User sends message** via React frontend
2. **WebSocket** sends message to `/app/send` endpoint
3. **Chat Service** receives message via `@MessageMapping`
4. **Kafka Producer** publishes message to `chat-messages` topic
5. **Kafka Consumer** receives message from topic
6. **Chat Service** persists message to PostgreSQL
7. **Chat Service** broadcasts message via WebSocket to `/topic/room/{room}`
8. **All connected clients** in the room receive the message

### Message History Flow

1. **User joins room** or requests history
2. **Frontend** makes HTTP GET request to `/api/chat/rooms/{room}/history`
3. **Chat Service** queries PostgreSQL for room messages
4. **Chat Service** returns message list to frontend
5. **Frontend** displays message history

## Event-Driven Design

The architecture follows an event-driven pattern:

- **Decoupling**: Kafka decouples message producers (WebSocket handlers) from consumers (persistence and broadcasting)
- **Scalability**: Multiple chat-service instances can consume from the same Kafka topic
- **Reliability**: Messages are persisted even if WebSocket connections fail
- **Replay**: Historical messages can be replayed from Kafka if needed

## Scalability Considerations

### Horizontal Scaling

- **Chat Service**: Multiple instances can run behind a load balancer
- **Kafka**: Supports multiple partitions and consumers
- **PostgreSQL**: Can be replicated for read scaling

### Future Enhancements

1. **Redis**: For user presence tracking and session management
2. **Kafka Partitions**: Partition by room for better parallelism
3. **Message Queue**: Separate queues for different message types
4. **Caching**: Cache recent messages in Redis
5. **CDN**: Serve static frontend assets via CDN

## Security Considerations

### Current Implementation
- CORS enabled for development
- WebSocket origin validation

### Production Recommendations
1. **Authentication**: JWT tokens for user authentication
2. **Authorization**: Room-based access control
3. **HTTPS/WSS**: Encrypted connections
4. **Rate Limiting**: Prevent message spam
5. **Input Validation**: Sanitize user inputs
6. **SQL Injection**: Use parameterized queries (JPA handles this)

## Monitoring and Observability

### Recommended Metrics
- WebSocket connection count
- Message throughput (messages/second)
- Kafka lag
- Database query performance
- Error rates

### Logging
- Structured logging with correlation IDs
- Request/response logging
- Error tracking

## Deployment

### Docker Compose
All services are containerized and can be run with:
```bash
docker-compose -f infra/docker-compose.yml up -d
```

### Services
- Zookeeper: Kafka coordination
- Kafka: Message broker
- PostgreSQL: Database
- Chat Service: Spring Boot application
- Gateway: Nginx reverse proxy
- Frontend: React application

## Development vs Production

### Development
- Single Kafka broker
- Single PostgreSQL instance
- No authentication
- HTTP/WS (not HTTPS/WSS)

### Production
- Kafka cluster with multiple brokers
- PostgreSQL with replication
- Authentication and authorization
- HTTPS/WSS with certificates
- Load balancers
- Monitoring and alerting

