/**
 * Alpine Configuration Interface
 *
 * This module contains the AlpineConfig interface for the Dockerfile Generator CLI.
 */

/**
 * Alpine Linux specific configuration
 * Defines Alpine-specific package management and optimizations
 */
export interface AlpineConfig {
  /** Package manager configuration */
  readonly packageManager: {
    /** Whether to use apk cache */
    readonly useCache: boolean;
    /** Whether to clean cache after installation */
    readonly cleanCache: boolean;
    /** Additional apk repositories */
    readonly repositories?: readonly string[];
  };
  /** Alpine-specific optimizations */
  readonly optimizations: {
    /** Whether to enable Alpine's security features */
    readonly security: boolean;
    /** Whether to use Alpine's minimal base */
    readonly minimal: boolean;
    /** Whether to enable Alpine's performance optimizations */
    readonly performance: boolean;
  };
  /** Alpine-specific cleanup commands */
  readonly cleanupCommands: readonly string[];
  /** Alpine-specific environment variables */
  readonly environment?: Record<string, string>;
}
