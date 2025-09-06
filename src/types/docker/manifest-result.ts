/**
 * Manifest Result Interface
 *
 * This module contains the ManifestResult interface for the Dockerfile Generator CLI.
 */

/**
 * Manifest creation result interface
 * Result of a manifest creation operation
 */
export interface ManifestResult {
  /** Manifest creation success status */
  readonly success: boolean;
  /** Created manifest digest */
  readonly digest?: string;
  /** Manifest logs */
  readonly logs?: readonly string[];
  /** Creation duration in milliseconds */
  readonly duration?: number;
  /** Creation errors */
  readonly errors?: readonly string[];
  /** Creation warnings */
  readonly warnings?: readonly string[];
}
