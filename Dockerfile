# Use the official Node.js 20 image as the base image for development
FROM --platform=linux/amd64 node:20-slim AS development

ENV DEBIAN_FRONTEND=noninteractive

# Install necessary dependencies
RUN apt-get update && apt-get install -y prusa-slicer curl \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get autoremove -y \
  && apt-get autoclean

# Create the /app directory
RUN mkdir /app

# Set the working directory to /app
WORKDIR /app

# Install dependencies first (separate layer for better caching)
COPY package.json  ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (e.g., for a React app, it might be `npm run build`)
# This assumes you have a build script in your package.json that produces a 'build' directory
RUN npm run build

# Install `nodemon` globally for hot-reloading
RUN npm install -g nodemon

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application with hot-reloading
CMD ["nodemon", "-L", "--watch", "src", "--exec", "npm run dev"]

# Use a new stage for the production image
FROM node:20-slim AS production

# Set the working directory inside the container
WORKDIR /app

# Set environment variables
ENV BODY_SIZE_LIMIT=15000000

# Copy the built application from the development stage
COPY --from=development /app/package.json /app/package.json

# Install only production dependencies
#RUN npm install --only=production
RUN npm install
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to start the SvelteKit app using Node.js
CMD ["node", "/app/build"]
