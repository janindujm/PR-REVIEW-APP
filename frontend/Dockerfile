# Multi-stage build: build static assets with Node, serve with NGINX

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy built static files to NGINX html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for HTTP
EXPOSE 80

# Run NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
