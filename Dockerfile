# Base stage (for both dev and prod)
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm fetch

# Install base dependencies (shared by build, production, and development)
RUN pnpm install --offline

# Build stage - includes development dependencies for building
FROM base AS build

# Copy the source code
COPY . .

RUN pnpm prisma:generate

# Build the application
RUN pnpm build

# Production stage
FROM base AS production

ENV NODE_ENV=production

# Copy the built files from the build stage

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma

# Install only production dependencies
RUN pnpm install --prod --offline

# Expose the application port
EXPOSE 8000

# Set command for production
CMD ["pnpm", "start"]

# Development stage
FROM base AS development

# Copy the source code
COPY . .

# Expose both app and debugging ports
EXPOSE 8000
EXPOSE 9229

# Set command for development
CMD ["pnpm", "debug"]