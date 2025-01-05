# using this as builder just to make sure we only need the build files and nothing else like node_modules then these files will be served through nginx
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json .

# we only copy package*.json files and run npm install because docker will cache the stages 
# so we will only run npm install after the package*.json files change 
# and we don't have to install again whenever the source code changes
RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.26.2-alpine3.20-perl AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD [ "tail", "-f", "/var/log/nginx/error.log" ]
