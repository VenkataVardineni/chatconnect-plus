# Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- Git installed

## Running the Application

### Option 1: Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/VenkataVardineni/chatconnect-plus.git
cd chatconnect-plus
```

2. Start all services:
```bash
docker-compose -f infra/docker-compose.yml up -d
```

3. Wait for all services to start (this may take a minute or two):
```bash
docker-compose -f infra/docker-compose.yml ps
```

4. Access the application:
   - **Frontend**: http://localhost:3000
   - **Chat Service API**: http://localhost:8080
   - **Gateway**: http://localhost:8081

5. To stop all services:
```bash
docker-compose -f infra/docker-compose.yml down
```

### Option 2: Local Development

#### Backend (Chat Service)

1. Ensure PostgreSQL and Kafka are running (use Docker Compose for infrastructure only):
```bash
docker-compose -f infra/docker-compose.yml up -d zookeeper kafka postgres
```

2. Navigate to chat-service:
```bash
cd chat-service
```

3. Build and run:
```bash
./mvnw spring-boot:run
```

Or if you have Maven installed:
```bash
mvn spring-boot:run
```

#### Frontend

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000

## Testing the Application

1. Open http://localhost:3000 in your browser
2. Enter a nickname
3. Select a room (e.g., "general", "random", "tech", "gaming")
4. Start chatting!

## Troubleshooting

### Services not starting
- Check if ports 3000, 8080, 8081, 5432, 9092, 2181 are available
- Check Docker logs: `docker-compose -f infra/docker-compose.yml logs`

### Frontend can't connect to backend
- Ensure chat-service is running on port 8080
- Check CORS settings if running locally
- Verify WebSocket endpoint is accessible

### Database connection issues
- Ensure PostgreSQL container is running: `docker ps | grep postgres`
- Check database credentials in `chat-service/src/main/resources/application.yml`

### Kafka connection issues
- Ensure Kafka and Zookeeper containers are running
- Check Kafka logs: `docker logs kafka`

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

