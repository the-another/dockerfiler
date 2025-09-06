/**
 * Network Error Class
 *
 * This module contains the NetworkError class for network operation failures.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for network operation failures
 * Provides structured error information for network-related errors
 */
export class NetworkError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'NetworkError';
  }
}
