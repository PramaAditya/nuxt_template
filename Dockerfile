# Dockerfile for Nuxt.js application

# --------------------------------------------------------------------
# Stage 1: Build the application
# --------------------------------------------------------------------
FROM node:22-slim AS build

# Set working directory
WORKDIR /app

# Install dependencies
# Use `npm ci` for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma client
# This needs to be done before building the Nuxt app
RUN npx prisma generate

# Build the Nuxt application for production
# The output will be in the .output directory
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Create the production image
# --------------------------------------------------------------------
FROM node:22-slim AS production

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy the built output from the 'build' stage
# This includes the server, client, and node_modules
COPY --from=build /app/.output ./.output

# The Prisma schema is needed at runtime by the Prisma client to locate the query engine binary.
COPY --from=build /app/prisma/schema.prisma ./prisma/schema.prisma

# Expose the port the app will run on
EXPOSE 3000

# --- Environment Variables ---
# The following environment variables are required to run the application.
# They should be provided at runtime (e.g., via docker run -e, docker-compose, or Kubernetes secrets).
#
# For database connection:
# ENV DATABASE_URL="postgresql://user:password@host:port/database"
#
# For Logto authentication:
# ENV NUXT_LOGTO_ENDPOINT=""
# ENV NUXT_LOGTO_APP_ID=""
# ENV NUXT_LOGTO_APP_SECRET=""
# ENV NUXT_LOGTO_COOKIE_ENCRYPTION_KEY=""
#
# For AI models (public, can be set at build time too):
# ENV NUXT_PUBLIC_AI_FREE_MODEL=""
# ENV NUXT_PUBLIC_AI_PREMIUM_MODEL=""


# Command to run the server
# The server entry point is created by the Nuxt build process
CMD ["node", ".output/server/index.mjs"]