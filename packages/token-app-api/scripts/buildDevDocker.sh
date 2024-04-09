#!/bin/bash

DOCKER_REGISTRY=registry.gitlab.com/ororaf2e/tokens-wallet-api

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

docker build -t $DOCKER_REGISTRY:$VERSION_TEXT .

docker push $DOCKER_REGISTRY:$VERSION_TEXT
