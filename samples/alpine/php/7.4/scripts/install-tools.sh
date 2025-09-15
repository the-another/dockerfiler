#!/bin/sh

# Install Composer and WP-CLI tools for PHP as non-root user
# This script installs Composer and WP-CLI in /home/another/bin

set -e

echo "Installing Composer and WP-CLI tools as non-root user..."

# Create the bin directory for the another user
mkdir -p /home/another/bin

# Create Composer home directory within allowed paths
mkdir -p /home/another/.composer

# Install Composer
echo "Installing Composer..."
cd /tmp
wget -q https://getcomposer.org/installer -O composer-setup.php

# Verify Composer installer signature
COMPOSER_SIGNATURE=$(wget -q -O - https://composer.github.io/installer.sig)
php -r "if (hash_file('SHA384', 'composer-setup.php') === '$COMPOSER_SIGNATURE') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); exit(1); } echo PHP_EOL;"

# Install Composer to /home/another/bin/composer
# Set environment variables and PHP settings to work with open_basedir restrictions
# Include SSL certificate directories for proper HTTPS verification
export COMPOSER_HOME=/home/another/.composer
php -d allow_url_fopen=1 -d open_basedir=/home/another/app:/home/another/bin:/tmp:/home/another/.composer:/etc/ssl:/etc/ssl/certs:/usr/local/share/certs:/usr/share/ssl/certs:/usr/local/etc/ssl:/usr/local/etc/openssl composer-setup.php --install-dir=/home/another/bin --filename=composer
rm composer-setup.php

# Install WP-CLI
echo "Installing WP-CLI..."
cd /tmp
# Use curl instead of wget as it's more reliable for GitHub downloads
curl -sS https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o wp-cli.phar

# Test WP-CLI phar file integrity by running --info
echo "Verifying WP-CLI phar file..."
php wp-cli.phar --info > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "WP-CLI phar file verified successfully"
else
    echo "WP-CLI phar file verification failed"
    exit 1
fi

# Install WP-CLI to /home/another/bin/wp
php wp-cli.phar --info
mv wp-cli.phar /home/another/bin/wp
chmod +x /home/another/bin/wp

# Verify installations
echo "Verifying installations..."
if [ -f /home/another/bin/composer ]; then
    echo "✓ Composer installed successfully"
    /home/another/bin/composer --version
else
    echo "✗ Composer installation failed"
    exit 1
fi

if [ -f /home/another/bin/wp ]; then
    echo "✓ WP-CLI installed successfully"
    /home/another/bin/wp --version
else
    echo "✗ WP-CLI installation failed"
    exit 1
fi

echo "Composer and WP-CLI installation completed successfully!"
echo "Tools location: /home/another/bin/"
echo "  - Composer: /home/another/bin/composer"
echo "  - WP-CLI: /home/another/bin/wp"
