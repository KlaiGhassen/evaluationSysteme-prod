FROM node:16.16.0
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["/bin/bash", "-c", "npx knex migrate:latest && npx knex seed:run && npx nodemon   ./bin/www"]
