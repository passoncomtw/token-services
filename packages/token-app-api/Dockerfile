FROM node:18.15.0-slim

RUN mkdir -p /app/packages/
RUN yarn global add lerna

RUN ls -al
COPY ./packages/token-app-api /app/packages/token-app-api
COPY ./lerna.json /app
COPY ./package.json /app
COPY ./yarn.lock /app

WORKDIR /app/packages
RUN yarn install
EXPOSE 8220

WORKDIR /app
CMD ["NODE_ENV=prod", "yarn", "start:token-app-api"]
