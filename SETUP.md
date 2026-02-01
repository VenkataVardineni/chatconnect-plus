# ChatConnect++ Setup Instructions

This guide will walk you through setting up and running ChatConnect++ on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)

### Optional (for local development)
- **Java 17+** (for running chat-service locally)
- **Maven 3.8+** (for building chat-service)
- **Node.js 18+** (for running frontend locally)
- **npm** or **yarn** (for frontend dependencies)

## Quick Start with Docker

The easiest way to run ChatConnect++ is using Docker Compose, which will set up all services automatically.

### Step 1: Clone the Repository

```bash
git clone https://github.com/VenkataVardineni/chatconnect-plus.git
cd chatconnect-plus
```

### Step 2: Start All Services

Navigate to the project root and start all services using Docker Compose:

```bash
docker-compose -f infra/docker-compose.yml up -d
```

This command will:
- Build Docker images for chat-service, frontend, and gateway
- Start all required services (PostgreSQL, Kafka, Zookeeper, chat-service, gateway, frontend)
- Create necessary Docker networks
- Set up volumes for data persistence

### Step 3: Verify Services are Running

Check that all services are up and running:

```bash
docker-compose -f infra/docker-compose.yml ps
```

You should see all services with status "Up":
- zookeeper
- kafka
- postgres
- chat-service
- gateway
- frontend

### Step 4: Access the Application

Once all services are running, access the application:

- **Frontend**: Open your browser and navigate to `http://localhost:3001`
- **Chat Service API**: `http://localhost:8082/api/chat/health`
- **Gateway**: `http://localhost:8083/api/chat/health`

### Step 5: Use the Application

1. **Set Your Nickname**: When you first open the application, you'll be prompted to enter a nickname
2. **Select a Room**: Choose from available rooms (general, random, tech, gaming)
3. **Start Chatting**: Type messages and press Enter or click Send
4. **Switch Rooms**: Click "Back" to return to room selection and join a different room

## Stopping the Application

To stop all services:

```bash
docker-compose -f infra/docker-compose.yml down
```

To stop and remove all data (including database):

```bash
docker-compose -f infra/docker-compose.yml down -v
```

## Local Development Setup

If you prefer to run services locally for development, follow these instructions.

### Backend (Chat Service) Setup

#### Prerequisites
- Java 17 or higher
- Maven 3.8 or higher
- PostgreSQL 15 (running locally or in Docker)
- Kafka (running locally or in Docker)

#### Step 1: Set Up PostgreSQL

If not using Docker, install and start PostgreSQL:

```bash
# Create database
createdb chatconnect

# Or using psql
psql -U postgres
CREATE DATABASE chatconnect;
```

#### Step 2: Set Up Kafka

If not using Docker, download and start Kafka:

```bash
# Download Kafka (if not already installed)
# Extract and navigate to Kafka directory

# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# In another terminal, start Kafka
bin/kafka-server-start.sh config/server.properties
```

#### Step 3: Configure Application

Edit `chat-service/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/chatconnect
    username: your_username
    password: your_password
  kafka:
    bootstrap-servers: localhost:9092
```

#### Step 4: Build and Run

```bash
cd chat-service
./mvnw clean install
./mvnw spring-boot:run
```

The service will start on `http://localhost:8080`

### Frontend Setup

#### Prerequisites
- Node.js 18 or higher
- npm or yarn

#### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

#### Step 2: Configure API URL

If running backend locally, update the API URLs in `frontend/src/components/ChatRoom.js`:

```javascript
// Change from:
const response = await axios.get(`http://localhost:8083/api/chat/rooms/${room}/history`);

// To:
const response = await axios.get(`http://localhost:8080/api/chat/rooms/${room}/history`);
```

And update WebSocket URL:

```javascript
// Change from:
webSocketFactory: () => new SockJS('http://localhost:8083/ws'),

// To:
webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
```

#### Step 3: Start Development Server

```bash
npm start
```

The frontend will start on `http://localhost:3000`

### Gateway Setup (Optional)

If you want to run the gateway locally:

#### Prerequisites
- Nginx installed locally

#### Step 1: Copy Configuration

```bash
cp gateway/nginx.conf /usr/local/etc/nginx/chatconnect.conf
```

#### Step 2: Update Nginx Configuration

Edit the configuration file and update upstream server addresses if needed.

#### Step 3: Start Nginx

```bash
nginx -c /usr/local/etc/nginx/chatconnect.conf
```

## Docker Compose Services

The `infra/docker-compose.yml` file defines the following services:

### Infrastructure Services

1. **Zookeeper**: Kafka coordination service
   - Port: 2181
   - Image: `confluentinc/cp-zookeeper:7.5.0`

2. **Kafka**: Message broker
   - Port: 9092
   - Image: `confluentinc/cp-kafka:7.5.0`
   - Depends on: Zookeeper

3. **PostgreSQL**: Database
   - Port: 5433 (external), 5432 (internal)
   - Image: `postgres:15-alpine`
   - Database: `chatconnect`
   - Username: `postgres`
   - Password: `postgres`

### Application Services

4. **Chat Service**: Spring Boot backend
   - Port: 8082 (external), 8080 (internal)
   - Build: `chat-service/Dockerfile`
   - Depends on: Kafka, PostgreSQL

5. **Gateway**: Nginx API gateway
   - Port: 8083
   - Build: `gateway/Dockerfile`
   - Depends on: Chat Service

6. **Frontend**: React application
   - Port: 3001
   - Build: `frontend/Dockerfile`
   - Served via Nginx

## Building Docker Images

To rebuild Docker images:

```bash
# Rebuild all images
docker-compose -f infra/docker-compose.yml build

# Rebuild specific service
docker-compose -f infra/docker-compose.yml build chat-service

# Rebuild and restart
docker-compose -f infra/docker-compose.yml up -d --build
```

## Viewing Logs

View logs for all services:

```bash
docker-compose -f infra/docker-compose.yml logs
```

View logs for a specific service:

```bash
docker-compose -f infra/docker-compose.yml logs chat-service
docker-compose -f infra/docker-compose.yml logs frontend
docker-compose -f infra/docker-compose.yml logs kafka
```

Follow logs in real-time:

```bash
docker-compose -f infra/docker-compose.yml logs -f chat-service
```

## Environment Configuration

### Chat Service Environment Variables

You can customize the chat-service configuration by setting environment variables in `docker-compose.yml`:

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/chatconnect
  SPRING_DATASOURCE_USERNAME: postgres
  SPRING_DATASOURCE_PASSWORD: postgres
  SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
```

### Kafka Configuration

Kafka is configured with the following environment variables:

```yaml
environment:
  KAFKA_BROKER_ID: 1
  KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
  KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
  KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT
  KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
```

## Database Access

To access the PostgreSQL database:

```bash
# Using Docker
docker exec -it postgres psql -U postgres -d chatconnect

# Or connect from host
psql -h localhost -p 5433 -U postgres -d chatconnect
```

## Verifying Installation

### Check Service Health

1. **Chat Service Health**:
   ```bash
   curl http://localhost:8082/api/chat/health
   ```
   Should return: `Chat service is running`

2. **Gateway Health**:
   ```bash
   curl http://localhost:8083/api/chat/health
   ```
   Should return: `Chat service is running`

3. **Frontend**:
   Open `http://localhost:3001` in your browser

### Check Kafka Topic

```bash
# List topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Should show: chat-messages
```

### Check Database

```bash
# Connect to database
docker exec -it postgres psql -U postgres -d chatconnect

# Check messages table
\dt
SELECT * FROM messages LIMIT 10;
```

## Development Workflow

### Making Changes

1. **Backend Changes**:
   - Edit Java files in `chat-service/src/main/java`
   - Rebuild: `docker-compose -f infra/docker-compose.yml build chat-service`
   - Restart: `docker-compose -f infra/docker-compose.yml restart chat-service`

2. **Frontend Changes**:
   - Edit React files in `frontend/src`
   - Rebuild: `docker-compose -f infra/docker-compose.yml build frontend`
   - Restart: `docker-compose -f infra/docker-compose.yml restart frontend`

3. **Configuration Changes**:
   - Edit `docker-compose.yml` or service configuration files
   - Restart affected services: `docker-compose -f infra/docker-compose.yml restart <service>`

### Hot Reload (Local Development)

For faster development, run services locally:

- **Backend**: Use Spring Boot DevTools for automatic restarts
- **Frontend**: React development server supports hot reload automatically

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Use production-grade PostgreSQL and Kafka configurations
3. Set up proper SSL/TLS certificates
4. Configure firewall rules
5. Set up monitoring and logging
6. Use a reverse proxy (e.g., Nginx) for SSL termination
7. Configure backup strategies for PostgreSQL

## Additional Resources

- [Architecture Documentation](docs/architecture.md)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Support

For issues or questions, please refer to the project repository or create an issue on GitHub.

