/**
 * Architecture Enum
 *
 * This module contains the Architecture enum and related types for the Dockerfile Generator CLI.
 */

/**
 * Supported CPU architectures for multi-architecture builds
 * ARM64 and AMD64 are the primary architectures, with 'all' for multi-arch manifests
 */
export enum Architecture {
  ARM64 = 'arm64',
  AMD64 = 'amd64',
  ALL = 'all',
}

/**
 * Type alias for architecture values
 * Provides type safety while maintaining string compatibility
 */
export type ArchitectureValue = `${Architecture}`;
