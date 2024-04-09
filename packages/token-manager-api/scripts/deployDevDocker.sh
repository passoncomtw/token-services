#!/bin/bash

DOCKER_REGISTRY=registry.gitlab.com/ororaf2e/tokens-wallet-admin-api

PORT=8889

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g') 

PACKAGE_NAME=$(cat package.json \
  | grep name \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g') 

VERSION_TEXT=$(echo $PACKAGE_VERSION | sed -e 's/^[[:space:]]*//')

CONTAINER_ID=$(docker ps | grep $PORT | awk '{ print $1 }')

if [ $CONTAINER_ID != "" ]
then
  echo "stop and remove container"
  docker stop $CONTAINER_ID
  docker rm $CONTAINER_ID
fi

IMAGE_ID=$(docker image ls | grep $PACKAGE_NAME | awk '{ print $3 }')

if [ $IMAGE_ID != "" ]
then
  echo "remove image"
  docker image rm $IMAGE_ID --force
fi

docker run -d -p $PORT:$PORT $DOCKER_REGISTRY:$VERSION_TEXT
