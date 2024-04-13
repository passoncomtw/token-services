FROM node:18.17.0-slim

LABEL maintainer="PassonTW"
LABEL version="17.4.1"
LABEL description="Docker file for SocketCluster with support for clustering."

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY . /usr/src/

COPY ./.env /usr/src/

RUN npm install .

EXPOSE 8888

CMD ["npm", "run", "start:docker", "NODE_ENV=uat"]
