# Use an official Node runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache make gcc g++ python3

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["npm", "run", "db:push"]
CMD ["npm", "run", "prod"]
