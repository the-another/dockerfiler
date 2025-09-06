/**
 * Base Configuration Interface
 *
 * This module contains the BaseConfig interface for the Dockerfile Generator CLI.
 */

import type { PHPConfig, SecurityConfig, NginxConfig, S6OverlayConfig } from '@/types';

/**
 * Base configuration interface
 * Defines the common configuration structure for all platforms
 */
export interface BaseConfig {
  /** PHP configuration */
  readonly php: PHPConfig;
  /** Security configuration */
  readonly security: SecurityConfig;
  /** Nginx configuration */
  readonly nginx: NginxConfig;
  /** s6-overlay configuration */
  readonly s6Overlay: S6OverlayConfig;
  /** Additional metadata */
  readonly metadata?: {
    /** Configuration version */
    readonly version?: string;
    /** Configuration description */
    readonly description?: string;
    /** Configuration author */
    readonly author?: string;
    /** Last updated timestamp */
    readonly lastUpdated?: string;
  };
}
