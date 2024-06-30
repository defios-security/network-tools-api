# Use an official Node.js runtime as a parent image
FROM node:14

# Set environment variables
ENV DEBIAN_FRONTEND noninteractive

# Install necessary tools (dig, traceroute, nmap, ping)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        dnsutils \
        iputils-ping \
        traceroute \
        nmap && \
    rm -rf /var/lib/apt/lists/*

# Create a directory for the app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to WORKDIR
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy rest of the application code to WORKDIR
COPY . .

# Expose port 8080
EXPOSE 8080

# Command to run the Node.js application
CMD ["node", "server.js"]
