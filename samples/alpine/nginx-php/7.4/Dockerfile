# Hardened Alpine Linux Dockerfile with Nginx and s6-overlay
# Built on top of theanother/another-php:7.4-alpine base image
# Supports WordPress and Laravel applications with comprehensive security hardening

# Use latest Alpine Linux (3.22.1 as of 2024)
FROM theanother/another-php:7.4-alpine

# Note: Build process runs as root (required for package installation and system configuration)
# Container will switch to non-root user at the end for security
USER root

# Update package index before any installations
RUN apk update

# Copy all configuration files and scripts to /dockerfiler
COPY etc/ /dockerfiler/etc/
COPY scripts/ /dockerfiler/scripts/

# Make all install and configure scripts executable
RUN find /dockerfiler/scripts -name "*.sh" \( -name "install.sh" -o -name "configure.sh" -o -name "cleanup.sh" \) -exec chmod +x {} \;

# Install, configure, and cleanup nginx and s6 services
RUN /dockerfiler/scripts/services/s6/install.sh && \
    /dockerfiler/scripts/services/nginx/install.sh && \
    /dockerfiler/scripts/services/s6/configure.sh && \
    /dockerfiler/scripts/services/nginx/configure.sh && \
    /dockerfiler/scripts/cleanup.sh

# Create application directory structure and logs directory
RUN mkdir -p /home/another/app/public /home/another/logs/nginx /home/another/logs/php-fpm /home/another/logs/cron /home/another/run

# Security: Set proper permissions for all directories and files
RUN chown -R another:another /home/another/app /home/another/logs /home/another/run && \
    chmod -R 755 /home/another/app && \
    chmod -R 755 /home/another/logs && \
    chmod -R 755 /home/another/run && \
    chmod 644 /home/another/app/public/index.php

# Final permission setup for non-root execution
RUN mkdir -p /var/lib/nginx /var/cache/nginx /run/nginx && \
    mkdir -p /tmp/nginx_client_body /tmp/nginx_proxy /tmp/nginx_fastcgi /tmp/nginx_uwsgi /tmp/nginx_scgi && \
    chown -R another:another /var/lib/nginx /var/cache/nginx /run/nginx /home/another/run && \
    chown -R another:another /tmp/nginx_client_body /tmp/nginx_proxy /tmp/nginx_fastcgi /tmp/nginx_uwsgi /tmp/nginx_scgi && \
    chmod -R 755 /var/lib/nginx /var/cache/nginx /run/nginx /home/another/run && \
    chmod -R 755 /tmp/nginx_client_body /tmp/nginx_proxy /tmp/nginx_fastcgi /tmp/nginx_uwsgi /tmp/nginx_scgi

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Security: Switch to non-root user
# Note: For nginx to bind to port 80, run container with: --cap-add=NET_BIND_SERVICE
USER another

# Set working directory
WORKDIR /home/another/app

# Use s6-overlay as entrypoint
ENTRYPOINT ["/init"]
