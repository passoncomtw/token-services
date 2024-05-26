FROM node:18.15.0-slim

RUN mkdir -p /app/packages/
RUN yarn global add lerna

COPY ./packages/start:token-admin-api /app/packages/start:token-admin-api
COPY ./lerna.json /app
COPY ./package.json /app
COPY ./yarn.lock /app

WORKDIR /app/packages
RUN yarn install
EXPOSE 3000

WORKDIR /app
CMD ["yarn", "start:token-admin-api"]
