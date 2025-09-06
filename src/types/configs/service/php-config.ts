/**
 * PHP Configuration Interface
 *
 * This module contains the PHPConfig interface for the Dockerfile Generator CLI.
 */

import type { PHPVersionValue, PHPFPMConfig } from '@/types';

/**
 * PHP configuration interface
 * Defines PHP version, extensions, and FPM settings
 */
export interface PHPConfig {
  /** PHP version string (e.g., '8.3', '7.4') */
  readonly version: PHPVersionValue;
  /** Array of PHP extensions to install */
  readonly extensions: readonly string[];
  /** PHP-FPM process manager configuration */
  readonly fpm: PHPFPMConfig;
  /** Additional PHP configuration options */
  readonly options?: {
    /** Memory limit for PHP processes */
    readonly memoryLimit?: string;
    /** Maximum execution time */
    readonly maxExecutionTime?: number;
    /** Maximum input time */
    readonly maxInputTime?: number;
    /** Upload maximum file size */
    readonly uploadMaxFilesize?: string;
    /** Maximum number of files that can be uploaded */
    readonly maxFileUploads?: number;
  };
}
