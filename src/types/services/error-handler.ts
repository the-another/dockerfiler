/**
 * Error Handler Service Types
 *
 * This module contains type definitions for the ErrorHandlerService.
 */

import { ErrorType, ErrorSeverity } from '@/types/errors';

/**
 * Error recovery strategies
 */
export enum ErrorRecoveryStrategy {
  /** No recovery attempt */
  NONE = 'NONE',
  /** Simple retry with fixed delay */
  RETRY = 'RETRY',
  /** Retry with linear backoff */
  RETRY_WITH_BACKOFF = 'RETRY_WITH_BACKOFF',
  /** Retry with exponential backoff */
  RETRY_WITH_EXPONENTIAL_BACKOFF = 'RETRY_WITH_EXPONENTIAL_BACKOFF',
  /** Manual intervention required */
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
}

/**
 * Error classification result
 */
export interface ErrorClassification {
  /** Error type */
  type: ErrorType;
  /** Error severity */
  severity: ErrorSeverity;
  /** Whether the error is recoverable */
  recoverable: boolean;
  /** Recovery strategy to use */
  recoveryStrategy: ErrorRecoveryStrategy;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Maximum number of retries */
  maxRetries: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
  /** User action suggestion */
  userAction: string;
}

/**
 * Error handler service options
 */
export interface ErrorHandlerOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Base delay between retries in milliseconds */
  retryDelay?: number;
  /** Maximum number of errors to keep in history */
  maxErrorHistory?: number;
  /** Whether to enable error recovery */
  enableRecovery?: boolean;
  /** Whether to enable error classification */
  enableClassification?: boolean;
  /** Whether to enable user-friendly error messages */
  enableUserFriendlyMessages?: boolean;
}

/**
 * Error statistics
 */
export interface ErrorStatistics {
  /** Total number of errors */
  totalErrors: number;
  /** Errors grouped by type */
  errorsByType: Record<string, number>;
  /** Errors grouped by severity */
  errorsBySeverity: Record<string, number>;
  /** Number of recent errors (last minute) */
  recentErrors: number;
}

/**
 * Error context for additional information
 */
export interface ErrorContext {
  /** Command being executed */
  command?: string;
  /** Configuration being used */
  config?: Record<string, unknown>;
  /** File being processed */
  file?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}
