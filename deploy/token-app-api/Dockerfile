FROM node:20.17.0-slim

RUN mkdir -p /app/packages

WORKDIR /app
RUN ls ./

COPY ./packages/token-app-api /app/packages/token-app-api
COPY .env /app/

EXPOSE 3000

CMD ["npx", "nx", "serve", "token-app-api", "--verbose"]