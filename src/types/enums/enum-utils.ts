/**
 * Enum Utilities
 *
 * This module contains utility functions for enum validation and conversion.
 */

import {
  PHPVersion,
  Platform,
  Architecture,
  type PHPVersionValue,
  type PlatformValue,
  type ArchitectureValue,
} from '@/types';

/**
 * Utility functions for enum validation and conversion
 */
export class EnumUtils {
  /**
   * Validates if a string is a valid PHP version
   * @param version - The version string to validate
   * @returns true if valid, false otherwise
   */
  static isValidPHPVersion(version: string): version is PHPVersionValue {
    return Object.values(PHPVersion).includes(version as PHPVersion);
  }

  /**
   * Validates if a string is a valid platform
   * @param platform - The platform string to validate
   * @returns true if valid, false otherwise
   */
  static isValidPlatform(platform: string): platform is PlatformValue {
    return Object.values(Platform).includes(platform as Platform);
  }

  /**
   * Validates if a string is a valid architecture
   * @param architecture - The architecture string to validate
   * @returns true if valid, false otherwise
   */
  static isValidArchitecture(architecture: string): architecture is ArchitectureValue {
    return Object.values(Architecture).includes(architecture as Architecture);
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
   * Converts a string to Architecture enum, throwing an error if invalid
   * @param architecture - The architecture string to convert
   * @returns The corresponding Architecture enum value
   * @throws Error if the architecture is not supported
   */
  static toArchitecture(architecture: string): Architecture {
    if (!this.isValidArchitecture(architecture)) {
      throw new Error(
        `Invalid architecture: ${architecture}. Supported architectures: ${Object.values(Architecture).join(', ')}`
      );
    }
    return architecture as Architecture;
  }

  /**
   * Gets all supported PHP versions as an array
   * @returns Array of all PHP version strings
   */
  static getAllPHPVersions(): PHPVersionValue[] {
    return Object.values(PHPVersion);
  }

  /**
   * Gets all supported platforms as an array
   * @returns Array of all platform strings
   */
  static getAllPlatforms(): PlatformValue[] {
    return Object.values(Platform);
  }

  /**
   * Gets all supported architectures as an array
   * @returns Array of all architecture strings
   */
  static getAllArchitectures(): ArchitectureValue[] {
    return Object.values(Architecture);
  }

  /**
   * Gets the help text for PHP version options
   * @returns Formatted help text for CLI usage
   */
  static getPHPVersionHelpText(): string {
    return `PHP version (${Object.values(PHPVersion).join(', ')})`;
  }

  /**
   * Gets the help text for platform options
   * @returns Formatted help text for CLI usage
   */
  static getPlatformHelpText(): string {
    return `Platform (${Object.values(Platform).join(', ')})`;
  }

  /**
   * Gets the help text for architecture options
   * @returns Formatted help text for CLI usage
   */
  static getArchitectureHelpText(): string {
    return `Architecture (${Object.values(Architecture).join(', ')})`;
  }
}
