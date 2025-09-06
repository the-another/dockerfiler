/**
 * PHP Version Enum
 *
 * This module contains the PHPVersion enum and related types for the Dockerfile Generator CLI.
 */

/**
 * Supported PHP versions for Docker image generation
 * Covers PHP 7.4 through 8.4 as specified in the project requirements
 */
export enum PHPVersion {
  PHP_7_4 = '7.4',
  PHP_8_0 = '8.0',
  PHP_8_1 = '8.1',
  PHP_8_2 = '8.2',
  PHP_8_3 = '8.3',
  PHP_8_4 = '8.4',
}

/**
 * Type alias for PHP version values
 * Provides type safety while maintaining string compatibility
 */
export type PHPVersionValue = `${PHPVersion}`;
