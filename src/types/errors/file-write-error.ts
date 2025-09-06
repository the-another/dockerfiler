/**
 * File Write Error Class
 *
 * This module contains the FileWriteError class for file system operation failures.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for file system operation failures
 * Provides structured error information for file write, read, and directory operation errors
 */
export class FileWriteError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'FileWriteError';
  }
}
