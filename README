# Node URL Shortener

A modern URL shortening service built with Node.js, Express, TypeScript, and Prisma ORM.

## Technology Stack

- **Backend**: Node.js, Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Package Manager**: pnpm
- **Containerization**: Docker

## Prerequisites

- Docker and Docker Compose
- Git

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/deepak-oli/node-url-shortner.git
   cd node-url-shortner
   ```

2. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then edit `.env` file with your database connection details:

## Running with Docker

1. Start the application and database:

   ```
   docker-compose up -d
   ```

2. For the first-time setup, run database migrations:

   ```
   docker exec -it app sh -c "pnpm prisma:migrate --name \"init\""
   ```

   For subsequent migrations:

   ```
   docker exec -it app sh -c "pnpm prisma:migrate"
   ```

3. The application should now be running at http://localhost:3000 (or the port specified in your docker-compose.yml)

## Building for Production

The Docker setup handles the build process. To rebuild the application after changes:

```
docker-compose down
docker-compose up -d --build
```

## License

ISC
