#!/bin/sh

# Nginx Configuration Script for Alpine Linux
# This script configures Nginx with security hardening
# and optimizations for PHP-FPM integration

set -e

echo "Configuring Nginx..."

# Create necessary directories with proper permissions
mkdir -p /home/another/app/public /home/another/logs/nginx /home/another/run /var/lib/nginx /run/nginx /etc/nginx/conf.d /var/cache/nginx
mkdir -p /tmp/nginx_client_body /tmp/nginx_proxy /tmp/nginx_fastcgi /tmp/nginx_uwsgi /tmp/nginx_scgi
chown -R another:another /home/another/app/public /home/another/run /var/lib/nginx /var/cache/nginx /run/nginx
chown -R another:another /tmp/nginx_client_body /tmp/nginx_proxy /tmp/nginx_fastcgi /tmp/nginx_uwsgi /tmp/nginx_scgi
chmod -R 755 /home/another/app/public
chmod -R 755 /home/another/run
chmod -R 755 /var/lib/nginx
chmod -R 755 /var/cache/nginx
chmod -R 755 /run/nginx
chmod -R 755 /tmp/nginx_client_body /tmp/nginx_proxy /tmp/nginx_fastcgi /tmp/nginx_uwsgi /tmp/nginx_scgi

# Backup existing configuration files
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak 2>/dev/null || true
cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak 2>/dev/null || true

# Remove default configuration
rm -f /etc/nginx/conf.d/default.conf

# Copy our custom configurations from /dockerfiler
cp /dockerfiler/etc/nginx/nginx.conf /etc/nginx/nginx.conf
cp /dockerfiler/etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Set proper permissions for Nginx directories and configuration files
chown -R another:another /home/another/logs
chown -R another:another /var/lib/nginx
chown -R another:another /run/nginx
chown another:another /etc/nginx/nginx.conf
chown another:another /etc/nginx/conf.d/default.conf
chmod 644 /etc/nginx/nginx.conf
chmod 644 /etc/nginx/conf.d/default.conf

echo "Nginx configured successfully!"
echo "Configuration includes:"
echo "  - Security headers (X-Frame-Options, X-Content-Type-Options, etc.)"
echo "  - Performance optimizations (gzip, sendfile, etc.)"
echo "  - PHP-FPM integration"
echo "  - Static file caching"
echo "  - Hidden file protection"
echo "  - Non-root user execution"
