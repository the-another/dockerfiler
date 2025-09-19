#!/bin/sh

# s6-overlay Configuration Script for Alpine Linux
# This script configures s6-overlay service definitions for process management

set -e

echo "Configuring s6-overlay services..."

# Create s6-overlay service definitions directory structure
mkdir -p /etc/s6-overlay/s6-rc.d/nginx
mkdir -p /etc/s6-overlay/s6-rc.d/php-fpm
mkdir -p /etc/s6-overlay/s6-rc.d/crontab
mkdir -p /etc/s6-overlay/s6-rc.d/user/contents.d

# Copy nginx service definition files
cp /dockerfiler/etc/s6-overlay/s6-rc.d/nginx/run /etc/s6-overlay/s6-rc.d/nginx/run
cp /dockerfiler/etc/s6-overlay/s6-rc.d/nginx/type /etc/s6-overlay/s6-rc.d/nginx/type
cp /dockerfiler/etc/s6-overlay/s6-rc.d/nginx/dependencies /etc/s6-overlay/s6-rc.d/nginx/dependencies
cp /dockerfiler/etc/s6-overlay/s6-rc.d/nginx/finish /etc/s6-overlay/s6-rc.d/nginx/finish

# Copy PHP-FPM service definition files
cp /dockerfiler/etc/s6-overlay/s6-rc.d/php-fpm/run /etc/s6-overlay/s6-rc.d/php-fpm/run
cp /dockerfiler/etc/s6-overlay/s6-rc.d/php-fpm/type /etc/s6-overlay/s6-rc.d/php-fpm/type
cp /dockerfiler/etc/s6-overlay/s6-rc.d/php-fpm/dependencies /etc/s6-overlay/s6-rc.d/php-fpm/dependencies
cp /dockerfiler/etc/s6-overlay/s6-rc.d/php-fpm/finish /etc/s6-overlay/s6-rc.d/php-fpm/finish

# Copy crontab service definition files
cp /dockerfiler/etc/s6-overlay/s6-rc.d/crontab/run /etc/s6-overlay/s6-rc.d/crontab/run
cp /dockerfiler/etc/s6-overlay/s6-rc.d/crontab/type /etc/s6-overlay/s6-rc.d/crontab/type
cp /dockerfiler/etc/s6-overlay/s6-rc.d/crontab/dependencies /etc/s6-overlay/s6-rc.d/crontab/dependencies
cp /dockerfiler/etc/s6-overlay/s6-rc.d/crontab/finish /etc/s6-overlay/s6-rc.d/crontab/finish

# Set executable permissions for scripts
chmod +x /etc/s6-overlay/s6-rc.d/nginx/run
chmod +x /etc/s6-overlay/s6-rc.d/nginx/finish
chmod +x /etc/s6-overlay/s6-rc.d/php-fpm/run
chmod +x /etc/s6-overlay/s6-rc.d/php-fpm/finish
chmod +x /etc/s6-overlay/s6-rc.d/crontab/run
chmod +x /etc/s6-overlay/s6-rc.d/crontab/finish

# Copy service bundle configuration files
cp /dockerfiler/etc/s6-overlay/s6-rc.d/user/contents.d/nginx /etc/s6-overlay/s6-rc.d/user/contents.d/nginx
cp /dockerfiler/etc/s6-overlay/s6-rc.d/user/contents.d/php-fpm /etc/s6-overlay/s6-rc.d/user/contents.d/php-fpm
cp /dockerfiler/etc/s6-overlay/s6-rc.d/user/contents.d/crontab /etc/s6-overlay/s6-rc.d/user/contents.d/crontab

echo "s6-overlay configuration completed successfully!"
echo "Services configured: nginx, php-fpm, crontab"
