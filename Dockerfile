# Use Node.js 20
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy application files
COPY . .

# Build the application (using --no-turbo to force webpack)
RUN npm run build

# Create directories for component storage
RUN mkdir -p components cdn uploads

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]

