/**
 * Docker Build Result Interface
 *
 * This module contains the DockerBuildResult interface for the Dockerfile Generator CLI.
 */

/**
 * Docker build result interface
 * Result of a Docker build operation
 */
export interface DockerBuildResult {
  /** Build success status */
  readonly success: boolean;
  /** Built image ID or tag */
  readonly imageId?: string;
  /** Build logs */
  readonly logs?: readonly string[];
  /** Build duration in milliseconds */
  readonly duration?: number;
  /** Build errors */
  readonly errors?: readonly string[];
  /** Build warnings */
  readonly warnings?: readonly string[];
}
