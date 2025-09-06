/**
 * Ubuntu Configuration Interface
 *
 * This module contains the UbuntuConfig interface for the Dockerfile Generator CLI.
 */

/**
 * Ubuntu specific configuration
 * Defines Ubuntu-specific package management and optimizations
 */
export interface UbuntuConfig {
  /** Package manager configuration */
  readonly packageManager: {
    /** Whether to update package lists */
    readonly updateLists: boolean;
    /** Whether to upgrade packages */
    readonly upgrade: boolean;
    /** Whether to clean apt cache */
    readonly cleanCache: boolean;
    /** Additional apt repositories */
    readonly repositories?: readonly string[];
  };
  /** Ubuntu-specific optimizations */
  readonly optimizations: {
    /** Whether to enable Ubuntu's security features */
    readonly security: boolean;
    /** Whether to use Ubuntu's minimal base */
    readonly minimal: boolean;
    /** Whether to enable Ubuntu's performance optimizations */
    readonly performance: boolean;
  };
  /** Ubuntu-specific cleanup commands */
  readonly cleanupCommands: readonly string[];
  /** Ubuntu-specific environment variables */
  readonly environment?: Record<string, string>;
}
