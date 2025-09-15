# Hardened Alpine Linux Dockerfile with PHP-FPM 7.4
# Supports WordPress and Laravel applications with comprehensive security hardening
# PHP-only setup without nginx or s6-overlay

# Use latest Alpine Linux (3.22.1 as of 2024)
FROM alpine:3.22

# Note: Build process runs as root (required for package installation and system configuration)
# Container will switch to non-root user at the end for security
USER root

# Update package index before any installations
RUN apk update

# Install system dependencies first (better layer caching)
RUN apk add --no-cache \
    curl \
    git \
    unzip \
    nodejs \
    npm

# Security: Create non-root user and group first
RUN addgroup -g 1000 -S another && \
    adduser -u 1000 -S -G another another

# Copy all configuration files and scripts to /dockerfiler
COPY etc/ /dockerfiler/etc/
COPY scripts/ /dockerfiler/scripts/

# Make all install and configure scripts executable
RUN find /dockerfiler/scripts -name "*.sh" \( -name "install.sh" -o -name "configure.sh" -o -name "cleanup.sh" -o -name "install-tools.sh" \) -exec chmod +x {} \;

# Install, configure, and cleanup PHP service
RUN /dockerfiler/scripts/services/php/install.sh && \
    /dockerfiler/scripts/services/php/configure.sh

# Create application directory structure and logs directory
RUN mkdir -p /home/another/app/public /home/another/logs/php-fpm /home/another/run

# Create a simple PHP info page for testing
RUN echo '<?php phpinfo(); ?>' > /home/another/app/public/index.php && \
    chown another:another /home/another/app/public/index.php

# Security: Set proper permissions for all directories and files
RUN chown -R another:another /home/another/app /home/another/logs /home/another/run && \
    chmod -R 755 /home/another/app && \
    chmod -R 755 /home/another/logs && \
    chmod -R 755 /home/another/run && \
    chmod 644 /home/another/app/public/index.php

# Create health check script for PHP-FPM
RUN echo '#!/bin/sh' > /usr/local/bin/healthcheck.sh && \
    echo 'php-fpm -y /etc/php/php-fpm.conf -t || exit 1' >> /usr/local/bin/healthcheck.sh && \
    chmod +x /usr/local/bin/healthcheck.sh

# Security: Remove unnecessary packages
RUN apk del tzdata

# Final permission setup for non-root execution
RUN mkdir -p /home/another/run && \
    chown -R another:another /home/another/run && \
    chmod -R 755 /home/another/run

# Expose port 9000 for PHP-FPM (standard port)
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Install Composer and WP-CLI as non-root user, then cleanup as root
USER another
RUN /dockerfiler/scripts/install-tools.sh

# Update PATH to include /home/another/bin for easy access to Composer and WP-CLI
ENV PATH="/home/another/bin:${PATH}"

# Switch back to root for cleanup operations that require root privileges
USER root
RUN /dockerfiler/scripts/cleanup.sh

# Security: Switch to non-root user for runtime
USER another

# Set working directory
WORKDIR /home/another/app

# Use PHP-FPM as the main process
CMD ["php-fpm", "-y", "/etc/php/php-fpm.conf", "--nodaemonize"]
