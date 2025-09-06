/**
 * Security Configuration Interface
 *
 * This module contains the SecurityConfig interface for the Dockerfile Generator CLI.
 */

/**
 * Security configuration interface
 * Defines security hardening settings for containers
 */
export interface SecurityConfig {
  /** Non-root user for running processes */
  readonly user: string;
  /** Group for the non-root user */
  readonly group: string;
  /** Whether to run as non-root user (always true for security) */
  readonly nonRoot: true;
  /** Whether to mount root filesystem as read-only */
  readonly readOnlyRoot: boolean;
  /** Linux capabilities to retain */
  readonly capabilities: readonly string[];
  /** Whether to enable seccomp security profiles */
  readonly seccomp?: boolean;
  /** Whether to enable AppArmor security profiles */
  readonly apparmor?: boolean;
  /** Additional security options */
  readonly options?: {
    /** Whether to drop all capabilities by default */
    readonly dropAllCapabilities?: boolean;
    /** Whether to enable no-new-privileges */
    readonly noNewPrivileges?: boolean;
    /** Whether to enable user namespace mapping */
    readonly userNamespace?: boolean;
  };
}
