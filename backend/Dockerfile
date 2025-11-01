FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose port
EXPOSE 9000

# Start development server with hot reload
CMD ["npm", "run", "dev"]
