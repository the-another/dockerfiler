/**
 * Security Error Class
 *
 * This module contains the SecurityError class for security validation and hardening failures.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for security validation and hardening failures
 * Provides structured error information for security-related errors
 */
export class SecurityError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'SecurityError';
  }
}
