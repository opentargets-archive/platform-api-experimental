FROM node:12

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
COPY . .
COPY src src

RUN yarn install
RUN yarn build

EXPOSE 8080
CMD [ "yarn", "start" ]
