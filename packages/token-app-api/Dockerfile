FROM node:18.15.0-slim

RUN mkdir -p /app/packages/
RUN yarn global add lerna

RUN ls -al
COPY ./packages/token-app-api /app/packages/token-app-api
COPY ./lerna.json /app
COPY ./package.json /app
COPY ./yarn.lock /app
RUN cat /app/packages/token-app-api/.env

WORKDIR /app/packages
RUN yarn install
EXPOSE 3000

WORKDIR /app
CMD ["yarn", "start:token-app-api"]
