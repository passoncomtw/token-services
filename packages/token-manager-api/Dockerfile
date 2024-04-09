FROM node:18.15.0-slim

LABEL maintainer="Tomas"
LABEL version="16.0.1"
LABEL description="Docker file for SocketCluster with support for clustering."

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY . /usr/src/

COPY ./.env /usr/src/

RUN npx yarn install

EXPOSE 5500

CMD ["npm", "run", "start:docker", "NODE_ENV=uat"]
