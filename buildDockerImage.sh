#!/bin/bash

# Function to extract the version from the pom.xml file
get_version_from_pom() {
    xmllint --xpath "//*[local-name()='project']/*[local-name()='version']/text()" pom.xml 2>/dev/null
}

# Check if the version number is provided as a command line argument
if [ "$#" -eq 1 ]; then
    VERSION=$1
else
    # Extract the version from pom.xml
    VERSION=$(get_version_from_pom)

    # Check if version number was successfully extracted
    if [ -z "$VERSION" ]; then
        echo "Failed to extract the version number from pom.xml."
        exit 1
    fi
fi

# Define the Docker image name and repository
IMAGE_NAME="skaperiet-printmanager"
REPO_NAME="docker.skaperiet.no/repository/skaperiet-docker-repository"

# Build the Docker image
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${VERSION} .
#docker buildx build --no-cache --platform linux/amd64 -t ${IMAGE_NAME}:${VERSION} .
#docker buildx create --use
#docker buildx build --platform linux/amd64,linux/arm64 -t ${REPO_NAME}/${IMAGE_NAME}:${VERSION} .

# Optional: Push the Docker image to the repository
# docker push ${REPO_NAME}:${VERSION}
