/**
 * Configuration Loader Error Class
 *
 * This module contains the ConfigLoaderError class for configuration loading operations.
 */

import { ErrorSeverity } from './error-severity';
import { BaseError } from './base-error';
import type { ErrorType } from './error-type';

/**
 * Custom error class for Configuration Loader operations
 * Provides structured error information with context and suggestions
 */
export class ConfigLoaderError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'ConfigLoaderError';
  }
}
