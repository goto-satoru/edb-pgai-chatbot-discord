#!/bin/sh
# this script should be run on Linux x86_64 environment

DOCKER_USERNAME=gotosatoru
DOCKER_IMAGE=langflow-chatbot
CHATBOT_NS=chatbot

docker login
echo "=============================================================="
echo "Building and pushing Docker image..."

# docker build -t $DOCKER_USERNAME/$DOCKER_IMAGE:latest .
docker build -t $DOCKER_IMAGE:latest .

# docker build --platform=linux/amd64 -t $DOCKER_USERNAME/$DOCKER_IMAGE:latest .
docker images | grep gotosatoru/langflow-chatbot-server

echo "Pushing Docker image to Docker Hub..."
# docker push $DOCKER_USERNAME/$DOCKER_IMAGE:latest

echo "=============================================================="
echo "Available tags for $DOCKER_USERNAME/$DOCKER_IMAGE:"
curl -s "https://hub.docker.com/v2/repositories/$DOCKER_USERNAME/$DOCKER_IMAGE/tags/"
curl -s "https://hub.docker.com/v2/repositories/$DOCKER_USERNAME/$DOCKER_IMAGE/tags/" | jq -r '.results[].name'

./deploy-chatbot-k8s.sh
