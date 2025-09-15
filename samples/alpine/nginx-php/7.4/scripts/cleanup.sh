#!/bin/sh

# Cleanup Script for Alpine Linux Docker Image
# This script removes all service installation/configuration scripts and temporary files
# before switching to the non-root user for security

set -e

echo "Cleaning up service installation/configuration scripts and temporary files..."

# Remove all configuration files and scripts from /dockerfiler
rm -rf /dockerfiler

# Remove any other temporary files that might have been created
rm -rf /tmp/* /var/tmp/*

# Clean package cache to reduce image size
rm -rf /var/cache/apk/*

# Remove build dependencies that are no longer needed
# Note: Keep runtime libraries, only remove development packages
if command -v apk >/dev/null 2>&1; then
    echo "Removing build dependencies..."
    # Remove only development packages, keep runtime libraries
    apk del gcc g++ make autoconf pkgconfig re2c bison libc-dev linux-headers 2>/dev/null || true
    apk del libxml2-dev libzip-dev oniguruma-dev libpng-dev libjpeg-turbo-dev 2>/dev/null || true
    apk del freetype-dev libwebp-dev libxpm-dev libxslt-dev libedit-dev libffi-dev 2>/dev/null || true
    apk del curl-dev icu-dev 2>/dev/null || true
    apk del libx11-dev libxau-dev libxdmcp-dev libxcb-dev xorgproto 2>/dev/null || true
    # Note: sqlite-dev is not removed as it might be needed for runtime
fi

# Remove any development tools that might have been installed
rm -rf /root/.cache
rm -rf /root/.npm
rm -rf /root/.composer

# Clean up any log files that might contain sensitive information
rm -f /var/log/*.log
rm -f /var/log/*/*.log

# Remove any SSH keys or certificates that might have been created during build
rm -rf /root/.ssh
rm -rf /etc/ssh/ssh_host_*

# Clean up any package manager caches
rm -rf /var/lib/apk
rm -rf /usr/share/man
rm -rf /usr/share/doc
rm -rf /usr/share/info

# Remove any temporary directories
rm -rf /tmp/.X11-unix
rm -rf /tmp/.ICE-unix

echo "Cleanup completed successfully!"
echo "Removed:"
echo "  - All configuration files and scripts from /dockerfiler"
echo "  - Temporary files and directories"
echo "  - Package caches"
echo "  - Build dependencies"
echo "  - Development tools"
echo "  - Log files"
echo "  - SSH keys and certificates"
echo "  - Documentation and man pages"
echo ""
echo "Image is now ready for secure non-root execution."
