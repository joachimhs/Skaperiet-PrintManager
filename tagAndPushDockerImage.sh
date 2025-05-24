#!/bin/bash

# Check if the version number is provided as a command line argument
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

# Assign the version number to a variable
VERSION=$1

# Define the Docker image name and repository
IMAGE_NAME="skaperiet-printmanager"
REPO_NAME="docker.skaperiet.no/repository/skaperiet-docker-repository"

# Tag the Docker image with the specified version
docker tag ${IMAGE_NAME}:${VERSION} ${REPO_NAME}/${IMAGE_NAME}:${VERSION}

# Push the Docker image to the repository
docker push ${REPO_NAME}/${IMAGE_NAME}:${VERSION}

# Print success message
echo "Docker image ${IMAGE_NAME}:${VERSION} successfully pushed to ${REPO_NAME}"

