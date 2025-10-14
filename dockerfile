FROM node:20-alpine

WORKDIR /app/backend

COPY package*.json ./

# Install only production dependencies and clean npm cache
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Use non-root user for better security
USER node

# Start the application
CMD ["npm", "start"]