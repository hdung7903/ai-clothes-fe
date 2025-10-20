# Multi-stage Dockerfile for Next.js (production)

FROM node:20-bookworm-slim AS base
WORKDIR /app

# Install dependencies separately to leverage Docker layer caching
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Build the application
FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production runner image
FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

# Copy production node_modules and built app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]


