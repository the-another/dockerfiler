#!/bin/sh

# s6-overlay Installation Script for Alpine Linux
# This script installs s6-overlay for process management
# s6-overlay provides a process supervisor and init system for containers

set -e

echo "Installing s6-overlay..."

# Install s6-overlay for process management
S6_OVERLAY_VERSION=${S6_OVERLAY_VERSION:-3.2.1.0}

echo "Installing s6-overlay version $S6_OVERLAY_VERSION..."
apk add --no-cache curl && \
    curl -L https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz | tar -C / -Jxpf - && \
    curl -L https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-x86_64.tar.xz | tar -C / -Jxpf - && \
    apk del curl

echo "s6-overlay installed successfully!"
