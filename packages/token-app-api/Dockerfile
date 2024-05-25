FROM node:18.17.0-slim

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY . /usr/src/

COPY ./.env /usr/src/

RUN npm install .

EXPOSE 3000

CMD ["node", "server"]
