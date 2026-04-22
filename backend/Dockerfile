# Use latest Node.js image
FROM node:22-slim

# Create and define the application directory
WORKDIR /usr/src/app

# Copy the package description files
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application with hot-reload in dev
CMD [ "npm", "run", "dev" ]
