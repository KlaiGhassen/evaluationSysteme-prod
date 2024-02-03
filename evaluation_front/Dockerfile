FROM node:16.16.0 as build 
WORKDIR /Evaluation
COPY package*.json .
RUN npm install -f 
COPY . .
RUN npm i @angular/cli@13.2.4 -g 
RUN npm run build

FROM nginx
COPY --from=build /Evaluation/dist /usr/share/nginx/html

# copy nginx config file
COPY nginx.conf /etc/nginx/nginx.conf



# start nginx server
CMD ["nginx", "-g", "daemon off;"]
