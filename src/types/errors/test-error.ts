/**
 * Test Error Class
 *
 * This module contains the TestError class for test execution failures.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for test execution failures
 * Provides structured error information for test-related errors
 */
export class TestError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'TestError';
  }
}
