/**
 * Platform Enum
 *
 * This module contains the Platform enum and related types for the Dockerfile Generator CLI.
 */

/**
 * Supported platforms for Docker base images
 * Alpine and Ubuntu are the two supported platforms
 */
export enum Platform {
  ALPINE = 'alpine',
  UBUNTU = 'ubuntu',
}

/**
 * Type alias for platform values
 * Provides type safety while maintaining string compatibility
 */
export type PlatformValue = `${Platform}`;
