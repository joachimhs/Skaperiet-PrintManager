#!/usr/bin/env bash
set -euo pipefail

# -------------------------------------------------------
# 1) CLI override
# -------------------------------------------------------
if [ $# -ge 1 ]; then
  VERSION="$1"
  echo "→ Version (from CLI): $VERSION"

# -------------------------------------------------------
# 2) Node project? read package.json
# -------------------------------------------------------
elif [ -f package.json ]; then
  if ! command -v node >/dev/null; then
    echo "ERROR: node is required to read version from package.json" >&2
    exit 1
  fi
  VERSION=$(node -p "require('./package.json').version")
  if [ -z "$VERSION" ]; then
    echo "ERROR: Could not extract version from package.json" >&2
    exit 1
  fi
  echo "→ Version (from package.json): $VERSION"

# -------------------------------------------------------
# 3) Java project? read pom.xml
# -------------------------------------------------------
elif [ -f pom.xml ]; then
  if ! command -v xmllint >/dev/null; then
    echo "ERROR: xmllint is required to parse pom.xml" >&2
    exit 1
  fi
  VERSION=$(xmllint --xpath "/*[local-name()='project']/*[local-name()='version']/text()" pom.xml 2>/dev/null || true)
  if [ -z "$VERSION" ]; then
    echo "ERROR: Could not extract version from pom.xml" >&2
    exit 1
  fi
  echo "→ Version (from pom.xml): $VERSION"

# -------------------------------------------------------
# 4) give up
# -------------------------------------------------------
else
  echo "ERROR: No version specified, no package.json and no pom.xml found." >&2
  echo "Usage: $0 [version]" >&2
  exit 1
fi

# 4) Build & tag the Docker image
IMAGE_NAME="skaperiet-printmanager"
REPO_NAME="docker.skaperiet.no/repository/skaperiet-docker-repository"

docker build \
  --platform linux/amd64 \
  -t "${IMAGE_NAME}:${VERSION}" \
  .