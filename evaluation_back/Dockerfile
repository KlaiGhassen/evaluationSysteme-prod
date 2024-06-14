# Use an official Node.js image
FROM node:16.16.0

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure knex and nodemon are installed globally (if not already in package.json)
RUN npm install -g knex nodemon

# Expose the desired port
EXPOSE 3000

# Command to run migrations, seed the database, and start the application
CMD ["sh", "-c", "npx knex migrate:latest && npx knex seed:run && npx nodemon ./bin/www"]
