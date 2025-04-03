FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and install dependencies
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "dev"]
