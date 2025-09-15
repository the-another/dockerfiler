<?php
/**
 * Iconv Fallback Utility for Alpine Linux musl libc
 * 
 * This utility provides fallback functionality for iconv operations that may fail
 * due to musl libc's stricter POSIX compliance, particularly with //TRANSLIT option.
 * 
 * Usage:
 *   php iconv-fallback.php "input string" "from_encoding" "to_encoding" [translit]
 * 
 * Example:
 *   php iconv-fallback.php "café" "UTF-8" "ASCII" "translit"
 */

class IconvFallback {
    private $supportedEncodings = [
        'UTF-8', 'ASCII', 'ISO-8859-1', 'ISO-8859-15', 'Windows-1252',
        'UTF-16', 'UTF-16LE', 'UTF-16BE', 'UTF-32', 'UTF-32LE', 'UTF-32BE'
    ];
    
    private $translitMap = [
        'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a',
        'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
        'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
        'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o',
        'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
        'ý' => 'y', 'ÿ' => 'y',
        'ñ' => 'n', 'ç' => 'c',
        'À' => 'A', 'Á' => 'A', 'Â' => 'A', 'Ã' => 'A', 'Ä' => 'A', 'Å' => 'A',
        'È' => 'E', 'É' => 'E', 'Ê' => 'E', 'Ë' => 'E',
        'Ì' => 'I', 'Í' => 'I', 'Î' => 'I', 'Ï' => 'I',
        'Ò' => 'O', 'Ó' => 'O', 'Ô' => 'O', 'Õ' => 'O', 'Ö' => 'O',
        'Ù' => 'U', 'Ú' => 'U', 'Û' => 'U', 'Ü' => 'U',
        'Ý' => 'Y', 'Ÿ' => 'Y',
        'Ñ' => 'N', 'Ç' => 'C'
    ];
    
    /**
     * Convert string encoding with fallback support
     */
    public function convert($string, $fromEncoding, $toEncoding, $useTranslit = false) {
        // Normalize encoding names
        $fromEncoding = $this->normalizeEncoding($fromEncoding);
        $toEncoding = $this->normalizeEncoding($toEncoding);
        
        // If encodings are the same, return as-is
        if ($fromEncoding === $toEncoding) {
            return $string;
        }
        
        // Try native iconv first
        $result = $this->tryNativeIconv($string, $fromEncoding, $toEncoding, $useTranslit);
        if ($result !== false) {
            return $result;
        }
        
        // Fallback to mbstring
        $result = $this->tryMbstring($string, $fromEncoding, $toEncoding);
        if ($result !== false) {
            return $result;
        }
        
        // Fallback to manual transliteration if requested
        if ($useTranslit) {
            return $this->manualTranslit($string, $fromEncoding, $toEncoding);
        }
        
        // Last resort: return original string with warning
        error_log("Warning: Could not convert string from $fromEncoding to $toEncoding");
        return $string;
    }
    
    /**
     * Try native iconv function
     */
    private function tryNativeIconv($string, $fromEncoding, $toEncoding, $useTranslit) {
        $toEncodingStr = $toEncoding;
        if ($useTranslit) {
            $toEncodingStr .= '//TRANSLIT';
        }
        
        // Suppress warnings to handle musl libc limitations gracefully
        $result = @iconv($fromEncoding, $toEncodingStr, $string);
        
        if ($result !== false) {
            return $result;
        }
        
        // Try without TRANSLIT if it failed
        if ($useTranslit) {
            $result = @iconv($fromEncoding, $toEncoding, $string);
            if ($result !== false) {
                // Apply manual transliteration
                return $this->applyTranslit($result);
            }
        }
        
        return false;
    }
    
    /**
     * Try mbstring functions
     */
    private function tryMbstring($string, $fromEncoding, $toEncoding) {
        if (!extension_loaded('mbstring')) {
            return false;
        }
        
        // Convert to UTF-8 first if needed
        if ($fromEncoding !== 'UTF-8') {
            $utf8String = mb_convert_encoding($string, 'UTF-8', $fromEncoding);
            if ($utf8String === false) {
                return false;
            }
        } else {
            $utf8String = $string;
        }
        
        // Convert from UTF-8 to target encoding
        if ($toEncoding !== 'UTF-8') {
            $result = mb_convert_encoding($utf8String, $toEncoding, 'UTF-8');
            if ($result === false) {
                return false;
            }
        } else {
            $result = $utf8String;
        }
        
        return $result;
    }
    
    /**
     * Manual transliteration for common characters
     */
    private function manualTranslit($string, $fromEncoding, $toEncoding) {
        // Convert to UTF-8 first
        $utf8String = $this->tryMbstring($string, $fromEncoding, 'UTF-8');
        if ($utf8String === false) {
            $utf8String = $string; // Assume it's already UTF-8
        }
        
        // Apply transliteration
        $translitString = $this->applyTranslit($utf8String);
        
        // Convert to target encoding
        if ($toEncoding !== 'UTF-8') {
            $result = $this->tryMbstring($translitString, 'UTF-8', $toEncoding);
            if ($result !== false) {
                return $result;
            }
        }
        
        return $translitString;
    }
    
    /**
     * Apply manual transliteration using character map
     */
    private function applyTranslit($string) {
        return strtr($string, $this->translitMap);
    }
    
    /**
     * Normalize encoding names
     */
    private function normalizeEncoding($encoding) {
        $encoding = strtoupper($encoding);
        
        // Common aliases
        $aliases = [
            'UTF8' => 'UTF-8',
            'LATIN1' => 'ISO-8859-1',
            'LATIN9' => 'ISO-8859-15',
            'CP1252' => 'Windows-1252'
        ];
        
        return $aliases[$encoding] ?? $encoding;
    }
    
    /**
     * Test iconv functionality
     */
    public function testIconvSupport() {
        $testString = "café naïve résumé";
        $testCases = [
            ['UTF-8', 'ASCII', true],
            ['UTF-8', 'ISO-8859-1', false],
            ['ISO-8859-1', 'UTF-8', false]
        ];
        
        echo "Testing iconv functionality:\n";
        echo "Test string: $testString\n\n";
        
        foreach ($testCases as [$from, $to, $translit]) {
            echo "Testing: $from -> $to" . ($translit ? ' (with TRANSLIT)' : '') . "\n";
            
            // Test native iconv
            $nativeResult = $this->tryNativeIconv($testString, $from, $to, $translit);
            echo "  Native iconv: " . ($nativeResult !== false ? "SUCCESS" : "FAILED") . "\n";
            
            // Test fallback
            $fallbackResult = $this->convert($testString, $from, $to, $translit);
            echo "  Fallback result: $fallbackResult\n";
            echo "\n";
        }
    }
}

// CLI usage
if (php_sapi_name() === 'cli' && isset($argv[1])) {
    $fallback = new IconvFallback();
    
    if ($argv[1] === 'test') {
        $fallback->testIconvSupport();
    } else {
        $string = $argv[1] ?? '';
        $fromEncoding = $argv[2] ?? 'UTF-8';
        $toEncoding = $argv[3] ?? 'ASCII';
        $useTranslit = isset($argv[4]) && $argv[4] === 'translit';
        
        $result = $fallback->convert($string, $fromEncoding, $toEncoding, $useTranslit);
        echo $result . "\n";
    }
}
