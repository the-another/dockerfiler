/**
 * Docker Build Options Interface
 *
 * This module contains the DockerBuildOptions interface for the Dockerfile Generator CLI.
 */

/**
 * Docker build options interface
 * Configuration for Docker image building
 */
export interface DockerBuildOptions {
  /** Target platform for the build */
  readonly platform: 'linux/arm64' | 'linux/amd64';
  /** Image tag */
  readonly tag: string;
  /** Build context path */
  readonly context: string;
  /** Dockerfile path */
  readonly dockerfile: string;
  /** Whether to push the image after building */
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
  /** Whether to remove intermediate containers */
  readonly removeIntermediate?: boolean;
}
