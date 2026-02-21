# ── Stage 1: Builder ─────────────────────────────────────────────────────────
# Compiles frontend (Vite) and backend (tsc).
FROM node:20-alpine AS builder

# bcrypt requires native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install root dependencies first (cached layer when only source changes)
COPY package.json package-lock.json* ./
RUN npm ci

# Install frontend dependencies.
# The frontend references the root package via "file:.." – copying package.json
# first and installing before copying all sources maximises cache hits.
COPY frontend/package.json frontend/
RUN npm --prefix frontend install

# Copy remaining sources
COPY . .

# VITE_BASE controls the public base path of the frontend.
# Default to / for standalone containers; override with
#   docker build --build-arg VITE_BASE=/hivecards-manager/
# when deploying behind a reverse proxy.
ARG VITE_BASE=/
ENV VITE_BASE=${VITE_BASE}

# Generate OpenAPI client → Vite build → tsc
RUN npm run build:frontend && npm run build


# ── Stage 2: Production dependencies ─────────────────────────────────────────
# Install only prod deps with native compilation tools available.
FROM node:20-alpine AS prod-deps

RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev


# ── Stage 3: Runtime image ────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules (with compiled native addons)
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./

# Copy compiled backend
COPY --from=builder /app/dist ./dist

# Copy built frontend (served as static files by the NestJS app)
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
