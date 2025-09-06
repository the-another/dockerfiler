/**
 * PHP Version Type Utility
 *
 * This module contains utility functions for PHP version type validation and conversion.
 */

import { PHPVersion, type PHPVersionValue } from '@/types';

/**
 * Utility functions for PHP version type validation and conversion
 */
export class PHPVersionTypeUtil {
  /**
   * Validates if a string is a valid PHP version
   * @param version - The version string to validate
   * @returns true if valid, false otherwise
   */
  static isValidPHPVersion(version: string): version is PHPVersionValue {
    return Object.values(PHPVersion).includes(version as PHPVersion);
  }

  /**
   * Converts a string to PHPVersion enum, throwing an error if invalid
   * @param version - The version string to convert
   * @returns The corresponding PHPVersion enum value
   * @throws Error if the version is not supported
   */
  static toPHPVersion(version: string): PHPVersion {
    if (!this.isValidPHPVersion(version)) {
      throw new Error(
        `Invalid PHP version: ${version}. Supported versions: ${Object.values(PHPVersion).join(', ')}`
      );
    }
    return version as PHPVersion;
  }

  /**
   * Gets all supported PHP versions as an array
   * @returns Array of all PHP version strings
   */
  static getAllPHPVersions(): PHPVersionValue[] {
    return Object.values(PHPVersion);
  }

  /**
   * Gets the help text for PHP version options
   * @returns Formatted help text for CLI usage
   */
  static getPHPVersionHelpText(): string {
    return `PHP version (${Object.values(PHPVersion).join(', ')})`;
  }
}
