/**
 * Manifest Error Class
 *
 * This module contains the ManifestError class for manifest operation failures.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for manifest operation failures
 * Provides structured error information for manifest-related errors
 */
export class ManifestError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'ManifestError';
  }
}
