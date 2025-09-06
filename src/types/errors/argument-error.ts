/**
 * Argument Error Class
 *
 * This module contains the ArgumentError class for command argument validation failures.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for command argument validation failures
 * Provides structured error information for argument-related errors
 */
export class ArgumentError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'ArgumentError';
  }
}
