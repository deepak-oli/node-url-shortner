# Node URL Shortener

A modern URL shortening service built with Node.js, Express, TypeScript, and Prisma ORM.

## Technology Stack

- **Backend**: Node.js, Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Package Manager**: pnpm
- **Containerization**: Docker
- **Caching**: Redis

## Prerequisites

- Docker and Docker Compose
- Git
- Postman (for API testing)

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/deepak-oli/node-url-shortner.git
   cd node-url-shortner
   ```

2. **Set up environment variables**:

   Copy the example environment configuration file and adjust the settings for your local setup:

   ```bash
   cp .env.example .env
   ```

   Then, edit the `.env` file with your database, Redis connection details and other details

## Running with Docker

1. **Start the application and database**:

   Bring up the application, PostgreSQL, and Redis using Docker Compose:

   ```bash
   docker-compose up -d
   ```

2. **For the first-time setup, run database migrations**:

   To set up the database schema:

   ```bash
   docker exec -it app sh -c "pnpm prisma:migrate --name "init""
   ```

   For subsequent migrations after schema changes:

   ```bash
   docker exec -it app sh -c "pnpm prisma:migrate"
   ```

3. **Seed the database**:

   Run the Prisma seeding script to populate your database with initial data:

   ```bash
   docker exec -it app sh -c "pnpm prisma:seed"
   ```

4. **Access the application**:

   The application should now be running at [http://localhost:8000](http://localhost:8000) (or the port specified in your `docker-compose.yml` file).

## Building for Production

## License

This project is licensed under the ISC License.
