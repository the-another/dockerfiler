/**
 * Multi-Architecture Build Options Interface
 *
 * This module contains the MultiArchBuildOptions interface for the Dockerfile Generator CLI.
 */

/**
 * Multi-architecture build options interface
 * Configuration for building multiple architecture variants
 */
export interface MultiArchBuildOptions {
  /** Image tag */
  readonly tag: string;
  /** Build context path */
  readonly context: string;
  /** Dockerfile path */
  readonly dockerfile: string;
  /** Target platforms */
  readonly platforms: readonly ('linux/arm64' | 'linux/amd64')[];
  /** Whether to push images after building */
  readonly push: boolean;
  /** Docker registry URL */
  readonly registry: string;
  /** Registry username */
  readonly username?: string;
  /** Registry password or token */
  readonly password?: string;
  /** Build arguments */
  readonly buildArgs?: Record<string, string>;
  /** Whether to use build cache */
  readonly useCache?: boolean;
  /** Build timeout in seconds */
  readonly timeout?: number;
}
