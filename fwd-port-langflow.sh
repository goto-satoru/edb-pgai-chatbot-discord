#!/bin/sh

kubectl -n upm-langflow port-forward svc/langflow 7860:7860
