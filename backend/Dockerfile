# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all backend code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
