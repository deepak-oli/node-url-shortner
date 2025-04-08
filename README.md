# Node URL Shortener

A URL shortening service built with Node.js, Express, TypeScript, and Prisma ORM with advanced features including authentication, caching, and logging.

## Features

- **URL Shortening**: Create compact, shareable URLs
- **User Authentication**: Secure account management using JWT and cookies
- **Statistics**: Track URL access and performance
- **Caching**: Redis implementation for high performance
- **Validation**: Request validation with Zod
- **Logging**: Structured logging with Winston
- **Database**: PostgreSQL with Prisma ORM for type-safe database access
- **Docker Support**: Containerized for easy deployment and consistent environments

## Technology Stack

- **Backend**: Node.js, Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Package Manager**: pnpm
- **Containerization**: Docker
- **Caching**: Redis
- **Validation**: Zod
- **Logging**: Winston
- **Authentication**: JWT, Cookie-based

## Prerequisites

- Docker and Docker Compose
- Git
- Postman or similar tool (for API testing)

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/deepak-oli/node-url-shortner.git
   cd node-url-shortner
   ```

2. **Set up environment variables**:
   Copy the example environment configuration file and adjust settings:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your database, Redis connection details, JWT secret, and other configuration.

## Running with Docker

### Development Environment

1. **Start the application**:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

2. **Set up the database**:

   Initialize the database schema:

   ```bash
   docker exec -it app-dev sh -c "pnpm prisma:migrate --name init"
   ```

   Seed the database with initial data:

   ```bash
   docker exec -it app-dev sh -c "pnpm prisma:seed"
   ```

3. **For subsequent migrations**:
   After schema changes:
   ```bash
   docker exec -it app-dev sh -c "pnpm prisma:migrate"
   ```

### Production Environment

1. **Deploy using production configuration**:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
   ```

2. **Access the application**:
   The API will be available at `http://localhost:8000` (or the port specified in your configuration).

## API Documentation

### Endpoints

`Todo`

## Project Structure

```
.
├── prisma/               # Prisma schema and migrations
├── src/
│   ├── config/           # Application configuration
│   ├── controllers/      # Route controllers
│   ├── db/              # Database connection and utilities
│   ├── middlewares/      # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   │   ├── logger.util.ts  # Winston logger configuration
│   │   ├── cookie.util.ts  # Cookie handling utilities
│   │   └── response.util.ts # Response formatting
│   ├── index.ts          # Application entry point
│   └── server.ts         # Express server configuration
├── docker-compose.yml    # Base Docker configuration
├── docker-compose.dev.yml # Development Docker overrides
├── docker-compose.prod.yml # Production Docker overrides
└── Dockerfile            # Docker container definition
```

## Development Scripts

- **Start development server**: `pnpm dev`
- **Build for production**: `pnpm build`
- **Start production server**: `pnpm start`
- **Run prisma migrations**: `pnpm prisma:migrate`
- **Seed database**: `pnpm prisma:seed`
- **Generate Prisma client**: `pnpm prisma:generate`

## Environment Variables

Example `.env` file:

```
# Server
PORT="8000"

# Database
DB_USER=
DB_HOST=
DB_NAME=
DB_PASS=
DB_PORT="5432"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# JWT and URLs
JWT_SECRET=
FRONTEND_URL=
BASE_URL=

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD="pass"

# Admin User
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## Caching Strategy

The application uses Redis to cache:

- Recently accessed URLs to reduce database load

## Future Enhancements

- **Rate Limiting**: Implement rate limiting using Redis to prevent API abuse
- **Session Management**: Store session data in Redis for faster authentication checks
- **Analytics Dashboard**: Create a user interface for URL statistics
- **Custom Short URLs**: Allow users to create custom short URL codes
- **URL Expiration**: Add the ability to set expiration dates for short URLs

## Error Handling and Validation

- Request validation using Zod schemas
- Structured error responses with appropriate HTTP status codes
- Custom error handling middleware

## Logging

Winston is configured for structured logging with:

- Console output during development
- File-based logging for production
- Different log levels (error, warn, info, http, debug)
- Request logging middleware

## License

This project is licensed under the ISC License.
