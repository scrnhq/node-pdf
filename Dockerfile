FROM node:8-slim

COPY . /app
WORKDIR /app

RUN npm install --quiet && npm run build

EXPOSE 3000
CMD npm run serve
