/**
 * Architecture Type Utility
 *
 * This module contains utility functions for architecture type validation and conversion.
 */

import { Architecture, type ArchitectureValue } from '@/types';

/**
 * Utility functions for architecture type validation and conversion
 */
export class ArchitectureTypeUtil {
  /**
   * Validates if a string is a valid architecture
   * @param architecture - The architecture string to validate
   * @returns true if valid, false otherwise
   */
  static isValidArchitecture(architecture: string): architecture is ArchitectureValue {
    return Object.values(Architecture).includes(architecture as Architecture);
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
   * Gets all supported architectures as an array
   * @returns Array of all architecture strings
   */
  static getAllArchitectures(): ArchitectureValue[] {
    return Object.values(Architecture);
  }

  /**
   * Gets the help text for architecture options
   * @returns Formatted help text for CLI usage
   */
  static getArchitectureHelpText(): string {
    return `Architecture (${Object.values(Architecture).join(', ')})`;
  }
}
