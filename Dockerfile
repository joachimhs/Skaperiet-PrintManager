# Use an official Node.js image as the base
FROM node:20-slim AS base

# Set non-interactive mode for the installation of packages
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

# Copy package.json and package-lock.json
COPY package.json ./

# Copy the rest of the application code
COPY . .

# Install dependencies using npm i to ensure clean installation
RUN npm install

EXPOSE 5173 5010
# ===============================
# Development Stage
# ===============================
FROM base AS development

ENV PATH /app/node_modules/.bin:$PATH

# Install `nodemon` globally for hot-reloading
RUN npm install -g nodemon

# Expose the port the app runs on and for the Node.js inspector
EXPOSE 5173 5010

# Start the app using nodemon for auto-reloading on changes
CMD ["npx", "nodemon", "-L", "--watch", "src", "--exec", "npm run dev"]

# ===============================
# Production Stage
# ===============================
FROM base AS production

# Expose the port the app runs on
EXPOSE 3000

# Build the application
RUN npm run build

# Start the app using the built files
CMD ["npm", "preview", "--host", "0.0.0.0", "--port", "3000"]
