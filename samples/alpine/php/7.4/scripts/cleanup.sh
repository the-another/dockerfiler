#!/bin/sh

# Cleanup Script for PHP-only Alpine Linux Container
# This script removes build dependencies and cleans up the system

set -e

echo "Cleaning up build dependencies and temporary files..."

# Remove build tools and development packages
echo "Removing build tools and development packages..."
apk del --no-cache \
    perl \
    gcc \
    g++ \
    make \
    autoconf \
    pkgconfig \
    wget \
    tar \
    xz \
    linux-headers \
    re2c \
    bison \
    patch \
    sqlite-dev \
    libzip-dev \
    oniguruma-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libwebp-dev \
    libxpm-dev \
    libxslt-dev \
    libedit-dev \
    curl-dev \
    icu-dev \
    libc-dev \
    libx11-dev \
    libxau-dev \
    libxdmcp-dev \
    libxcb-dev \
    xorgproto

# Clean up package cache
echo "Cleaning up package cache..."
apk cache clean

# Remove temporary files
echo "Removing temporary files..."
rm -rf /tmp/*
rm -rf /var/cache/apk/*

# Remove dockerfiler directory (no longer needed after installation)
echo "Removing installation files..."
rm -rf /dockerfiler

echo "Cleanup completed successfully!"
echo "System is now optimized for runtime with minimal footprint."
