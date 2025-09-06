/**
 * Template Error Class
 *
 * This module contains the TemplateError class for template rendering and compilation failures.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for template rendering and compilation failures
 * Provides structured error information for template-related errors
 */
export class TemplateError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'TemplateError';
  }
}
