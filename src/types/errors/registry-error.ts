/**
 * Registry Error Class
 *
 * This module contains the RegistryError class for Docker registry operation failures.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for Docker registry operation failures
 * Provides structured error information for registry-related errors
 */
export class RegistryError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'RegistryError';
  }
}
