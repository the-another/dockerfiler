#!/bin/sh

# Test script for GNU libiconv functionality in Alpine Linux
# This script verifies that GNU libiconv is properly installed and working

set -e

echo "=== GNU libiconv Test ==="
echo "Testing GNU libiconv installation and TRANSLIT support"
echo

# Test 1: Check if gnu-libiconv package is installed
echo "Test 1: Checking GNU libiconv package installation"
if apk info gnu-libiconv >/dev/null 2>&1; then
    echo "✅ gnu-libiconv package is installed"
    apk info gnu-libiconv | head -3
else
    echo "❌ gnu-libiconv package is NOT installed"
    echo "Installing gnu-libiconv..."
    apk add --no-cache gnu-libiconv
fi
echo

# Test 2: Check if preloadable library exists
echo "Test 2: Checking preloadable library"
if [ -f "/usr/lib/preloadable_libiconv.so" ]; then
    echo "✅ Preloadable library exists: /usr/lib/preloadable_libiconv.so"
    ls -la /usr/lib/preloadable_libiconv.so
else
    echo "❌ Preloadable library NOT found: /usr/lib/preloadable_libiconv.so"
fi
echo

# Test 3: Test iconv without LD_PRELOAD (should use musl)
echo "Test 3: Testing iconv without LD_PRELOAD (musl implementation)"
echo "Input: café naïve résumé"
result_musl=$(echo "café naïve résumé" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || echo "FAILED")
echo "Result: $result_musl"
echo

# Test 4: Test iconv with LD_PRELOAD (should use GNU libiconv)
echo "Test 4: Testing iconv with LD_PRELOAD (GNU libiconv)"
echo "Input: café naïve résumé"
export LD_PRELOAD=/usr/lib/preloadable_libiconv.so
result_gnu=$(echo "café naïve résumé" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || echo "FAILED")
echo "Result: $result_gnu"
unset LD_PRELOAD
echo

# Test 5: PHP iconv function test
echo "Test 5: PHP iconv function test"
php_test=$(php -r "
\$test = 'café naïve résumé';
echo 'Without LD_PRELOAD:' . PHP_EOL;
\$result1 = @iconv('UTF-8', 'ASCII//TRANSLIT', \$test);
echo '  Result: ' . (\$result1 !== false ? \$result1 : 'FAILED') . PHP_EOL;

putenv('LD_PRELOAD=/usr/lib/preloadable_libiconv.so');
echo 'With LD_PRELOAD:' . PHP_EOL;
\$result2 = @iconv('UTF-8', 'ASCII//TRANSLIT', \$test);
echo '  Result: ' . (\$result2 !== false ? \$result2 : 'FAILED') . PHP_EOL;
" 2>/dev/null || echo "PHP test FAILED")
echo "$php_test"
echo

# Test 6: Check environment configuration
echo "Test 6: Environment configuration"
echo "LD_PRELOAD in /etc/profile:"
if grep -q "LD_PRELOAD.*preloadable_libiconv.so" /etc/profile 2>/dev/null; then
    echo "✅ LD_PRELOAD is configured in /etc/profile"
    grep "LD_PRELOAD.*preloadable_libiconv.so" /etc/profile
else
    echo "❌ LD_PRELOAD is NOT configured in /etc/profile"
fi

echo "LD_PRELOAD in /etc/environment:"
if grep -q "LD_PRELOAD.*preloadable_libiconv.so" /etc/environment 2>/dev/null; then
    echo "✅ LD_PRELOAD is configured in /etc/environment"
    grep "LD_PRELOAD.*preloadable_libiconv.so" /etc/environment
else
    echo "❌ LD_PRELOAD is NOT configured in /etc/environment"
fi
echo

# Summary
echo "=== Test Summary ==="
echo "GNU libiconv package: $([ -f "/usr/lib/preloadable_libiconv.so" ] && echo "✅ INSTALLED" || echo "❌ MISSING")"
echo "Musl iconv TRANSLIT: $([ "$result_musl" != "FAILED" ] && echo "✅ WORKS" || echo "❌ FAILS")"
echo "GNU iconv TRANSLIT: $([ "$result_gnu" != "FAILED" ] && echo "✅ WORKS" || echo "❌ FAILS")"
echo

if [ "$result_gnu" != "FAILED" ] && [ "$result_gnu" != "$result_musl" ]; then
    echo "✅ SUCCESS: GNU libiconv is working and providing TRANSLIT support!"
    echo "   The LD_PRELOAD configuration should resolve iconv TRANSLIT issues."
elif [ "$result_musl" != "FAILED" ]; then
    echo "⚠️  INFO: Musl iconv TRANSLIT is working, GNU libiconv may not be needed."
else
    echo "❌ ISSUE: Both musl and GNU iconv TRANSLIT are failing."
    echo "   Check the installation and configuration."
fi

echo
echo "For PHP applications, ensure LD_PRELOAD is set in PHP-FPM configuration."
echo "See: etc/php/php-fpm.d/www.conf"
