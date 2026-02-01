# ChatConnect++

A real-time multi-room chat platform using WebSockets and Kafka, designed to handle many concurrent users with a Slack-like interface.

## Features

- **Multi-room chat**: Users can join different chat rooms/channels
- **Live updates**: Real-time message delivery via WebSockets
- **Persistent history**: All messages are stored in PostgreSQL for retrieval
- **Scalable architecture**: Event-driven design with Kafka for message distribution
- **User presence**: See active users in each room

## Architecture

ChatConnect++ uses an event-driven microservices architecture:

- **Frontend**: React application with WebSocket client
- **Gateway**: API gateway for routing requests
- **Chat Service**: Spring Boot microservice handling WebSocket connections, Kafka messaging, and persistence
- **Kafka**: Message broker for decoupling message producers and consumers
- **PostgreSQL**: Database for persistent message storage

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Java 17+ (for local development)
- Node.js 18+ (for local development)

### Running with Docker

1. Clone the repository:
```bash
git clone https://github.com/VenkataVardineni/chatconnect-plus.git
cd chatconnect-plus
```

2. Start all services:
```bash
docker-compose -f infra/docker-compose.yml up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Chat Service API: http://localhost:8080
   - Gateway: http://localhost:8081

### Local Development

#### Backend (Chat Service)

```bash
cd chat-service
./mvnw spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## Project Structure

```
chatconnect-plus/
├── gateway/           # API Gateway service
├── chat-service/      # Spring Boot chat microservice
├── frontend/          # React frontend application
├── infra/             # Docker infrastructure files
└── docs/              # Architecture and documentation
```

## Technology Stack

- **Backend**: Spring Boot, WebSocket, Kafka, PostgreSQL
- **Frontend**: React, WebSocket API
- **Infrastructure**: Docker, Docker Compose
- **Message Broker**: Apache Kafka
- **Database**: PostgreSQL

## License

MIT

