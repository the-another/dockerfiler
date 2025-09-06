/**
 * Docker Error Class
 *
 * This module contains the DockerError class for Docker build and operation failures.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for Docker build and operation failures
 * Provides structured error information for Docker-related errors
 */
export class DockerError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'DockerError';
  }
}
