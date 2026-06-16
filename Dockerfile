# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Stage 3: Setup the production environment
FROM node:20-alpine
WORKDIR /app

# Copy backend dependencies
COPY --from=backend-builder /app/backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy compiled backend code
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Copy built frontend to backend/public so it can be served
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Set working directory to backend
WORKDIR /app/backend

EXPOSE 8000
CMD ["node", "dist/index.js"]
