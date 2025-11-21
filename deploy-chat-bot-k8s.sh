#!/bin/sh
# this script should be run on Linux x86_64 environment

DOCKER_USERNAME=gotosatoru
DOCKER_IMAGE=genai-chatbot-server
CHATBOT_NS=chatbot

echo "=============================================================="
echo "deploy chatbot server on k8s..."
kubectl create ns $CHATBOT_NS
kubectl delete secret chatbot-env -n $CHATBOT_NS
kubectl create secret generic chatbot-env --from-env-file=.env -n $CHATBOT_NS
kubectl get secret chatbot-env -n $CHATBOT_NS
kubectl apply -f chat-agent.yaml -n $CHATBOT_NS
kubectl get po -n $CHATBOT_NS
kubectl delete pod -l app=chatbot-server -n $CHATBOT_NS

