/**
 * PHP-FPM Configuration Interface
 *
 * This module contains the PHPFPMConfig interface for the Dockerfile Generator CLI.
 */

/**
 * PHP-FPM process manager configuration
 * Defines the process management settings for PHP-FPM
 */
export interface PHPFPMConfig {
  /** Maximum number of child processes */
  readonly maxChildren: number;
  /** Number of child processes created on startup */
  readonly startServers: number;
  /** Minimum number of spare idle processes */
  readonly minSpareServers: number;
  /** Maximum number of spare idle processes */
  readonly maxSpareServers: number;
  /** Maximum number of requests each child process should execute before respawning */
  readonly maxRequests?: number;
  /** Process idle timeout in seconds */
  readonly processIdleTimeout?: number;
}
