#!/bin/sh

# Nginx Installation Script for Alpine Linux
# This script installs Nginx package only

set -e

echo "Installing Nginx..."

# Install Nginx
apk add --no-cache nginx

echo "Nginx installed successfully!"
