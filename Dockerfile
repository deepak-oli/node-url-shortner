FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm fetch

# Install all dependencies
RUN pnpm install --offline

# Copy source code
COPY . .

# Expose the application port
EXPOSE 3000
EXPOSE 9229


# Command to run the application
# CMD ["pnpm", "dev"]
CMD ["pnpm", "debug"]

