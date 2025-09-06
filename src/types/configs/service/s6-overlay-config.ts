/**
 * s6-overlay Configuration Interface
 *
 * This module contains the S6OverlayConfig interface for the Dockerfile Generator CLI.
 */

/**
 * s6-overlay service configuration
 * Defines process supervision and service management
 */
export interface S6OverlayConfig {
  /** Array of service names to supervise */
  readonly services: readonly string[];
  /** Crontab entries for scheduled tasks */
  readonly crontab: readonly string[];
  /** Additional s6-overlay configuration */
  readonly options?: {
    /** Whether to enable s6-overlay logging */
    readonly logging?: boolean;
    /** Log level for s6-overlay */
    readonly logLevel?: 'debug' | 'info' | 'warn' | 'error';
    /** Whether to enable s6-overlay notifications */
    readonly notifications?: boolean;
  };
}
