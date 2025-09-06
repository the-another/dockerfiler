/**
 * Registry Options Interface
 *
 * This module contains the RegistryOptions interface for the Dockerfile Generator CLI.
 */

/**
 * Registry options interface
 * Configuration for Docker registry operations
 */
export interface RegistryOptions {
  /** Registry URL */
  readonly registry: string;
  /** Registry username */
  readonly username: string;
  /** Registry password or token */
  readonly password: string;
  /** Docker namespace/repository */
  readonly namespace: string;
  /** Repository name */
  readonly repository: string;
  /** Image tag */
  readonly tag: string;
  /** Whether to use HTTPS */
  readonly useHttps?: boolean;
  /** Registry timeout in seconds */
  readonly timeout?: number;
}
