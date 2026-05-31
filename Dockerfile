# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

# Install packages needed to build node modules (for bcrypt, etc)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY backend/package.json backend/package-lock.json ./backend/

# Install root dependencies (which might include bcrypt)
RUN npm install

# Install frontend dependencies
RUN cd frontend && npm install

# Copy application code
COPY . .

# Build application (runs frontend build)
RUN npm run build

# Remove development dependencies in root
RUN npm prune --omit=dev

# Start the server by default
EXPOSE 3000
CMD [ "npm", "start" ]
