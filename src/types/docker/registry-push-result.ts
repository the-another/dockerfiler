/**
 * Registry Push Result Interface
 *
 * This module contains the RegistryPushResult interface for the Dockerfile Generator CLI.
 */

/**
 * Registry push result interface
 * Result of a registry push operation
 */
export interface RegistryPushResult {
  /** Push success status */
  readonly success: boolean;
  /** Pushed image digest */
  readonly digest?: string;
  /** Push logs */
  readonly logs?: readonly string[];
  /** Push duration in milliseconds */
  readonly duration?: number;
  /** Push errors */
  readonly errors?: readonly string[];
  /** Push warnings */
  readonly warnings?: readonly string[];
}
