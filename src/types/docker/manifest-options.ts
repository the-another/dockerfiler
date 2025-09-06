/**
 * Manifest Options Interface
 *
 * This module contains the ManifestOptions interface for the Dockerfile Generator CLI.
 */

/**
 * Manifest options interface
 * Configuration for Docker manifest operations
 */
export interface ManifestOptions {
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
  /** Manifest tag */
  readonly tag: string;
  /** Architectures to include in manifest */
  readonly architectures: readonly ('linux/arm64' | 'linux/amd64')[];
  /** Architecture-specific image tags */
  readonly images: Record<string, string>;
  /** Whether to use HTTPS */
  readonly useHttps?: boolean;
  /** Registry timeout in seconds */
  readonly timeout?: number;
}
