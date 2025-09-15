#!/bin/sh

# PHP Configuration Script for Alpine Linux
# This script configures PHP-FPM and PHP settings for security and performance
# Works with compiled PHP 7.4 installation

set -e

echo "Configuring PHP-FPM and PHP settings..."

# Create necessary directories first
echo "Creating PHP configuration directories..."
mkdir -p /etc/php/conf.d

# Copy PHP-FPM configuration files
echo "Copying PHP-FPM configuration..."

# Copy the pre-configured PHP-FPM configuration
cp /dockerfiler/etc/php/php-fpm.conf /etc/php/php-fpm.conf

# Copy PHP-FPM pool configuration
echo "Copying PHP-FPM pool configuration..."
mkdir -p /etc/php/php-fpm.d
cp /dockerfiler/etc/php/php-fpm.d/www.conf /etc/php/php-fpm.d/www.conf

# Ensure only the www pool is configured
echo "Ensuring single www pool configuration..."
rm -f /etc/php/php-fpm.d/*.conf
cp /dockerfiler/etc/php/php-fpm.d/www.conf /etc/php/php-fpm.d/www.conf

# Copy PHP configuration
echo "Copying PHP configuration..."
cp /dockerfiler/etc/php/php.ini /etc/php/php.ini

# Copy all conf.d ini files (opcache, security, extensions guidance)
echo "Copying PHP conf.d INI files..."
cp -f /dockerfiler/etc/php/conf.d/*.ini /etc/php/conf.d/

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p /home/another/run
mkdir -p /home/another/logs/php-fpm
chown -R another:another /home/another/run
chown -R another:another /home/another/logs
chmod -R 755 /home/another/run
chmod -R 755 /home/another/logs

# Set proper permissions for PHP configuration files
echo "Setting proper permissions for PHP configuration files..."
chown -R another:another /etc/php
chmod -R 644 /etc/php/php.ini
chmod -R 644 /etc/php/php-fpm.conf
chmod -R 644 /etc/php/php-fpm.d/www.conf
chmod -R 644 /etc/php/conf.d/*.ini
chmod 755 /etc/php/conf.d
chmod 755 /etc/php/php-fpm.d

echo "PHP configuration completed successfully!"
echo "Configuration includes:"
echo "  - PHP-FPM security hardening (non-root user, socket communication)"
echo "  - Single www pool configuration with comprehensive security settings"
echo "  - Comprehensive PHP security settings (extensive disabled functions, URL access restrictions)"
echo "  - Performance optimizations (OPcache, memory limits, execution timeouts)"
echo "  - Enhanced session security (HTTP-only cookies, secure cookies, strict mode, SameSite)"
echo "  - File system restrictions (open_basedir, upload restrictions)"
echo "  - Error handling security (no error display, comprehensive logging)"
echo "  - Input validation and filtering security"
echo ""
echo "Configuration files:"
echo "  - PHP-FPM config: /etc/php/php-fpm.conf"
echo "  - PHP-FPM pool: /etc/php/php-fpm.d/www.conf"
echo "  - PHP config: /etc/php/php.ini"
echo "  - conf.d: /etc/php/conf.d/*.ini (including opcache, security, and extensions guidance)"
