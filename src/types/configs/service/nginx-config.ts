/**
 * Nginx Configuration Interface
 *
 * This module contains the NginxConfig interface for the Dockerfile Generator CLI.
 */

/**
 * Nginx configuration interface
 * Defines Nginx server and worker settings
 */
export interface NginxConfig {
  /** Number of worker processes (auto, number, or 'auto') */
  readonly workerProcesses: string;
  /** Maximum number of connections per worker */
  readonly workerConnections: number;
  /** Whether to enable gzip compression */
  readonly gzip: boolean;
  /** Whether to enable SSL/TLS support */
  readonly ssl: boolean;
  /** Additional Nginx configuration options */
  readonly options?: {
    /** Client maximum body size */
    readonly clientMaxBodySize?: string;
    /** Proxy timeout settings */
    readonly proxyTimeout?: {
      readonly connect?: string;
      readonly send?: string;
      readonly read?: string;
    };
    /** Rate limiting configuration */
    readonly rateLimit?: {
      readonly enabled: boolean;
      readonly requests: number;
      readonly window: string;
    };
  };
}
