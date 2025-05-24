# frontend/Dockerfile

FROM node:22.1.0-alpine

# Set working directory
WORKDIR /app

# Copy package metadata and install deps
COPY package.json package-lock.json* ./

RUN npm ci

# Copy the rest of the project files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the frontend port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
