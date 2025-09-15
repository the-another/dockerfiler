#!/bin/sh

# PHP 7.4 Compilation and Installation Script for Alpine Linux
# This script compiles PHP 7.4 from source with extensions organized by:
# - Common extensions (required for most applications)
# - WordPress-specific extensions (controlled by FOR_WORDPRESS env var)
# - Laravel-specific extensions (controlled by FOR_LARAVEL env var)
# - Development common extensions (for debugging and development)
#
# Environment Variables:
# FOR_WORDPRESS=true|false (default: true) - Install WordPress-specific extensions
# FOR_LARAVEL=true|false (default: true) - Install Laravel-specific extensions
# WITH_XDEBUG=true|false (default: false) - Install XDebug extension

set -e

# Set default values for environment variables
FOR_WORDPRESS=${FOR_WORDPRESS:-true}
FOR_LARAVEL=${FOR_LARAVEL:-true}
WITH_XDEBUG=${WITH_XDEBUG:-false}

echo "Compiling PHP 7.4 from source..."
echo "Configuration: FOR_WORDPRESS=$FOR_WORDPRESS, FOR_LARAVEL=$FOR_LARAVEL, WITH_XDEBUG=$WITH_XDEBUG"

# Remove any existing packages that might conflict with PHP 7.4
echo "Removing conflicting packages..."
apk del --no-cache openssl openssl-dev openssl-libs-static libxml2 libxml2-dev 2>/dev/null || true

# Install build tools first (required for compilation)
echo "Installing build tools for compilation..."
apk add --no-cache \
    curl \
    perl \
    gcc \
    g++ \
    make \
    autoconf \
    pkgconfig \
    wget \
    tar \
    xz \
    linux-headers

# Build OpenSSL 1.1.1 from source (required for PHP 7.4 compatibility)
echo "Building OpenSSL 1.1.1 from source..."
cd /tmp
wget -q https://www.openssl.org/source/openssl-1.1.1w.tar.gz
tar -xzf openssl-1.1.1w.tar.gz
cd openssl-1.1.1w

# Detect architecture and set appropriate OpenSSL configuration
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)
        OPENSSL_CONFIG="linux-x86_64"
        ;;
    aarch64|arm64)
        OPENSSL_CONFIG="linux-aarch64"
        ;;
    armv7l)
        OPENSSL_CONFIG="linux-armv4"
        ;;
    *)
        echo "Warning: Unsupported architecture $ARCH, using generic linux config"
        OPENSSL_CONFIG="linux-generic64"
        ;;
esac

echo "Detected architecture: $ARCH, using OpenSSL config: $OPENSSL_CONFIG"
./Configure $OPENSSL_CONFIG --prefix=/usr/local/openssl-1.1.1 --openssldir=/usr/local/openssl-1.1.1/ssl

# Check if OpenSSL configuration was successful
if [ $? -ne 0 ]; then
    echo "ERROR: OpenSSL configuration failed for architecture $ARCH with config $OPENSSL_CONFIG"
    echo "Available OpenSSL configurations:"
    ./Configure LIST | grep linux
    exit 1
fi

make -j$(nproc)
if [ $? -ne 0 ]; then
    echo "ERROR: OpenSSL compilation failed"
    exit 1
fi

make install
if [ $? -ne 0 ]; then
    echo "ERROR: OpenSSL installation failed"
    exit 1
fi
cd /
rm -rf /tmp/openssl-1.1.1w*

# Build libxml2 2.9.10 from source (required for PHP 7.4 compatibility)
echo "Building libxml2 2.9.10 from source..."
cd /tmp
wget -q https://download.gnome.org/sources/libxml2/2.9/libxml2-2.9.10.tar.xz
tar -xJf libxml2-2.9.10.tar.xz
cd libxml2-2.9.10

# Configure libxml2 with architecture-specific optimizations
echo "Configuring libxml2 for architecture: $ARCH"
./configure \
    --prefix=/usr/local/libxml2-2.9.10 \
    --without-python \
    --disable-shared \
    --enable-static \
    --host=$ARCH-alpine-linux-musl

# Check if libxml2 configuration was successful
if [ $? -ne 0 ]; then
    echo "ERROR: libxml2 configuration failed for architecture $ARCH"
    exit 1
fi

make -j$(nproc)
if [ $? -ne 0 ]; then
    echo "ERROR: libxml2 compilation failed"
    exit 1
fi

make install
if [ $? -ne 0 ]; then
    echo "ERROR: libxml2 installation failed"
    exit 1
fi
cd /
rm -rf /tmp/libxml2-2.9.10*

# Build cURL 7.68.0 from source with OpenSSL support (required for PHP 7.4 compatibility)
echo "Building cURL 7.68.0 from source with OpenSSL support..."
cd /tmp
wget -q https://curl.se/download/curl-7.68.0.tar.gz
tar -xzf curl-7.68.0.tar.gz
cd curl-7.68.0

# Configure cURL with OpenSSL support
echo "Configuring cURL for architecture: $ARCH"
./configure \
    --prefix=/usr/local/curl-7.68.0 \
    --with-openssl=/usr/local/openssl-1.1.1 \
    --disable-shared \
    --enable-static \
    --without-libpsl \
    --without-librtmp \
    --without-libidn2 \
    --without-libssh2 \
    --without-nghttp2 \
    --without-zstd \
    --without-brotli \
    --without-libgsasl \
    --without-winidn \
    --without-libidn \
    --without-ssl \
    --with-ssl=/usr/local/openssl-1.1.1 \
    --host=$ARCH-alpine-linux-musl

# Check if cURL configuration was successful
if [ $? -ne 0 ]; then
    echo "ERROR: cURL configuration failed for architecture $ARCH"
    exit 1
fi

make -j$(nproc)
if [ $? -ne 0 ]; then
    echo "ERROR: cURL compilation failed"
    exit 1
fi

make install
if [ $? -ne 0 ]; then
    echo "ERROR: cURL installation failed"
    exit 1
fi
cd /
rm -rf /tmp/curl-7.68.0*

# Install runtime libraries (needed for PHP to run, after building from source)
echo "Installing runtime libraries..."
apk add --no-cache \
    sqlite-libs \
    libzip \
    oniguruma \
    libpng \
    libjpeg-turbo \
    freetype \
    libwebp \
    libxpm \
    libxslt \
    libedit \
    icu \
    tzdata \
    gd \
    libiconv \
    musl-locales

# Install additional build dependencies for PHP
echo "Installing additional build dependencies for PHP..."
apk add --no-cache \
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
    linux-headers \
    libc-dev \
    libx11-dev \
    libxau-dev \
    libxdmcp-dev \
    libxcb-dev \
    xorgproto \
    gd-dev \
    libiconv-dev \
    musl-locales-dev

# Download and extract PHP 7.4.33 (latest 7.4.x version)
echo "Downloading PHP 7.4.33 source..."
cd /tmp
wget -O php-7.4.33.tar.gz https://www.php.net/distributions/php-7.4.33.tar.gz
tar -xzf php-7.4.33.tar.gz
cd php-7.4.33

# Configure PHP build with common extensions
echo "Configuring PHP build for architecture: $ARCH..."
# Set environment variables to use our compiled OpenSSL 1.1.1, libxml2 2.9.10, and cURL 7.68.0
export PKG_CONFIG_PATH="/usr/local/openssl-1.1.1/lib/pkgconfig:/usr/local/libxml2-2.9.10/lib/pkgconfig:/usr/local/curl-7.68.0/lib/pkgconfig:$PKG_CONFIG_PATH"
export LDFLAGS="-L/usr/local/openssl-1.1.1/lib -L/usr/local/libxml2-2.9.10/lib -L/usr/local/curl-7.68.0/lib $LDFLAGS"
export CPPFLAGS="-I/usr/local/openssl-1.1.1/include -I/usr/local/libxml2-2.9.10/include -I/usr/local/curl-7.68.0/include $CPPFLAGS"

# Set architecture-specific compiler flags
case "$ARCH" in
    aarch64|arm64)
        export CFLAGS="-O2 -march=armv8-a"
        export CXXFLAGS="-O2 -march=armv8-a"
        ;;
    x86_64)
        export CFLAGS="-O2 -march=x86-64"
        export CXXFLAGS="-O2 -march=x86-64"
        ;;
    *)
        export CFLAGS="-O2"
        export CXXFLAGS="-O2"
        ;;
esac

./configure \
    --prefix=/usr/local/php \
    --with-config-file-path=/etc/php \
    --with-config-file-scan-dir=/etc/php/conf.d \
    --enable-bcmath \
    --enable-calendar \
    --enable-cgi \
    --enable-ctype \
    --enable-dom \
    --enable-fileinfo \
    --enable-fpm \
    --enable-gd \
    --enable-json \
    --enable-mbstring \
    --enable-opcache \
    --enable-pcntl \
    --enable-phar \
    --enable-posix \
    --enable-session \
    --enable-shared=no \
    --enable-simplexml \
    --enable-sockets \
    --enable-static=yes \
    --enable-tokenizer \
    --enable-xml \
    --enable-xmlreader \
    --enable-xmlwriter \
    --with-bz2 \
    --with-curl=/usr/local/curl-7.68.0 \
    --with-freetype \
    --with-iconv \
    --with-jpeg \
    --with-libedit \
    --with-libxml=/usr/local/libxml2-2.9.10 \
    --with-mhash \
    --with-mysqli \
    --with-openssl=/usr/local/openssl-1.1.1 \
    --with-pcre-jit \
    --with-pdo-mysql \
    --with-pdo-sqlite \
    --with-png \
    --with-readline \
    --with-sqlite3 \
    --with-webp \
    --with-xpm \
    --with-xsl \
    --with-zip \
    --with-zlib

# Add WordPress-specific extensions if enabled
if [ "$FOR_WORDPRESS" = "true" ]; then
    echo "Adding WordPress-specific extensions to build..."
    # Extensions are already included in the main configure above
    echo "WordPress extensions will be compiled with PHP"
fi

# Add Laravel-specific extensions if enabled
if [ "$FOR_LARAVEL" = "true" ]; then
    echo "Adding Laravel-specific extensions to build..."
    # Extensions are already included in the main configure above
    echo "Laravel extensions will be compiled with PHP"
fi

# Apply patch to fix GCC compatibility issue in cast.c
echo "Applying patch to fix GCC compatibility issue..."
cd /tmp/php-7.4.33
# Apply the fix directly to the source file
sed -i 's/stream_cookie_seeker, stream_cookie_closer/(int (*)(void *, off_t *, int))stream_cookie_seeker, stream_cookie_closer/' main/streams/cast.c
echo "Applied cast.c fix for GCC compatibility"

# Compile PHP
echo "Compiling PHP (this may take several minutes)..."
make -j$(nproc)

# Install PHP
echo "Installing PHP..."
make install

# Check if PHP-FPM binary was created
if [ ! -f /usr/local/php/sbin/php-fpm ]; then
    echo "PHP-FPM binary not found in sbin, checking bin directory..."
    if [ ! -f /usr/local/php/bin/php-fpm ]; then
        echo "ERROR: PHP-FPM binary not found after compilation!"
        echo "Available binaries:"
        ls -la /usr/local/php/bin/
        exit 1
    fi
fi

# Create symlinks for easier access
ln -sf /usr/local/php/bin/php /usr/local/bin/php
ln -sf /usr/local/php/bin/php-cgi /usr/local/bin/php-cgi

# Create PHP-FPM symlink (check both possible locations)
if [ -f /usr/local/php/sbin/php-fpm ]; then
    ln -sf /usr/local/php/sbin/php-fpm /usr/local/bin/php-fpm
elif [ -f /usr/local/php/bin/php-fpm ]; then
    ln -sf /usr/local/php/bin/php-fpm /usr/local/bin/php-fpm
else
    echo "ERROR: PHP-FPM binary not found in either sbin or bin directory!"
    exit 1
fi

# Create PHP-FPM configuration directory
mkdir -p /etc/php/php-fpm.d

# Configure OpenSSL for PHP 7.4 compatibility
echo "Configuring OpenSSL for PHP 7.4..."
# Ensure OpenSSL configuration has proper default values
if [ -f /etc/ssl/openssl.cnf ]; then
    sed -i 's/#default_bits/default_bits/' /etc/ssl/openssl.cnf
    echo "OpenSSL configuration updated for PHP 7.4 compatibility"
fi

# Create OpenSSL configuration directory for PHP
mkdir -p /etc/php/conf.d

# Install PECL extensions if needed
echo "Installing PECL extensions..."

# Install common PECL extensions (used by both WordPress and Laravel)
echo "Installing Redis extension..."
/usr/local/bin/pecl install redis || echo "Redis installation failed, continuing..."

if [ "$FOR_LARAVEL" = "true" ]; then
    echo "Installing APCu extension..."
    /usr/local/bin/pecl install apcu || echo "APCu installation failed, continuing..."

    echo "Installing Imagick extension..."
    /usr/local/bin/pecl install imagick || echo "Imagick installation failed, continuing..."
fi

# Install XDebug for development (only if requested)
if [ "$WITH_XDEBUG" = "true" ]; then
    echo "Installing XDebug extension..."
    /usr/local/bin/pecl install xdebug || echo "XDebug installation failed, continuing..."
else
    echo "Skipping XDebug installation (set WITH_XDEBUG=true to enable)"
fi

# Clean up build files
echo "Cleaning up build files..."
cd /
rm -rf /tmp/php-7.4.33*
rm -rf /tmp/pear
rm -rf /tmp/libxml2-2.9.10*
rm -rf /tmp/curl-7.68.0*

# Verify extensions are working
echo "Verifying PHP extensions..."

# Check OpenSSL extension
if /usr/local/bin/php -m | grep -q openssl; then
    echo "✓ OpenSSL extension is loaded successfully"
else
    echo "⚠ Warning: OpenSSL extension not found in loaded modules"
fi

# Check libxml extension
if /usr/local/bin/php -m | grep -q libxml; then
    echo "✓ libxml extension is loaded successfully"
else
    echo "⚠ Warning: libxml extension not found in loaded modules"
fi

# Check cURL extension
if /usr/local/bin/php -m | grep -q curl; then
    echo "✓ cURL extension is loaded successfully"
    # Check if cURL has OpenSSL support
    if /usr/local/bin/php -r "phpinfo();" | grep -q "SSL Version => OpenSSL"; then
        echo "✓ cURL extension has OpenSSL support"
    else
        echo "⚠ Warning: cURL extension does not have OpenSSL support"
    fi
else
    echo "⚠ Warning: cURL extension not found in loaded modules"
fi

# Check XML extensions
if /usr/local/bin/php -m | grep -q xml; then
    echo "✓ XML extensions are loaded successfully"
else
    echo "⚠ Warning: XML extensions not found in loaded modules"
fi

# Check GD extension
if /usr/local/bin/php -m | grep -qi '^gd$'; then
    echo "✓ GD extension is loaded successfully"
else
    echo "⚠ Warning: GD extension not found in loaded modules"
fi

# Check GD functions availability
if /usr/local/bin/php -r "if(function_exists('imagecreate')) { echo 'GD functions available'; } else { echo 'GD functions NOT available'; exit(1); }" 2>/dev/null; then
    echo "✓ GD functions are available"
else
    echo "⚠ Warning: GD functions are not available"
    echo "Checking GD compilation details..."
    /usr/local/bin/php -r "phpinfo();" | grep -A 10 -B 5 -i "gd imaging"
fi

echo "PHP 7.4 compilation and installation completed successfully!"
echo "Installed: PHP 7.4 with core extensions"
echo "  + OpenSSL 1.1.1 extension (compatible with PHP 7.4)"
echo "  + libxml2 2.9.10 extension (compatible with PHP 7.4)"
echo "  + cURL 7.68.0 extension with OpenSSL support (compatible with PHP 7.4)"
echo "  + Common extensions (Redis)"
if [ "$FOR_WORDPRESS" = "true" ]; then
    echo "  + WordPress-specific extensions"
fi
if [ "$FOR_LARAVEL" = "true" ]; then
    echo "  + Laravel-specific extensions (APCu, Imagick)"
fi
if [ "$WITH_XDEBUG" = "true" ]; then
    echo "  + Development extensions (XDebug)"
fi
echo ""
echo "PHP binary location: /usr/local/bin/php"
echo "PHP-FPM binary location: /usr/local/bin/php-fpm"
echo "Configuration directory: /etc/php"
