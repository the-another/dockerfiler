/**
 * Base Error JSON Interface
 *
 * This module contains the base JSON interface for all custom error classes.
 */

import type { ErrorType, ErrorSeverity } from '@/types';

/**
 * Base JSON representation for all custom error classes
 * Provides a common structure for error serialization
 */
export interface BaseErrorJSON {
  /** Error class name */
  readonly name: string;
  /** Error type classification */
  readonly type: ErrorType;
  /** Error severity level */
  readonly severity: ErrorSeverity;
  /** Error message */
  readonly message: string;
  /** Additional error details */
  readonly details?: unknown;
  /** Helpful suggestions for resolving the error */
  readonly suggestions?: readonly string[] | undefined;
  /** Error code for programmatic handling */
  readonly code?: string | unknown;
  /** Timestamp when the error occurred */
  readonly timestamp: string;
  /** Error stack trace */
  readonly stack?: string | unknown;
}
