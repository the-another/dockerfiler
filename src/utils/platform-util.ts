/**
 * Platform Type Utility
 *
 * This module contains utility functions for platform type validation and conversion.
 */

import { Platform, type PlatformValue } from '@/types';

/**
 * Utility functions for platform type validation and conversion
 */
export class PlatformTypeUtil {
  /**
   * Validates if a string is a valid platform
   * @param platform - The platform string to validate
   * @returns true if valid, false otherwise
   */
  static isValidPlatform(platform: string): platform is PlatformValue {
    return Object.values(Platform).includes(platform as Platform);
  }

  /**
   * Converts a string to Platform enum, throwing an error if invalid
   * @param platform - The platform string to convert
   * @returns The corresponding Platform enum value
   * @throws Error if the platform is not supported
   */
  static toPlatform(platform: string): Platform {
    if (!this.isValidPlatform(platform)) {
      throw new Error(
        `Invalid platform: ${platform}. Supported platforms: ${Object.values(Platform).join(', ')}`
      );
    }
    return platform as Platform;
  }

  /**
   * Gets all supported platforms as an array
   * @returns Array of all platform strings
   */
  static getAllPlatforms(): PlatformValue[] {
    return Object.values(Platform);
  }

  /**
   * Gets the help text for platform options
   * @returns Formatted help text for CLI usage
   */
  static getPlatformHelpText(): string {
    return `Platform (${Object.values(Platform).join(', ')})`;
  }
}
