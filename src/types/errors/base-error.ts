/**
 * Base Error Class
 *
 * This module contains the BaseError class that provides common functionality
 * for all custom error classes in the Dockerfile Generator CLI.
 */

import { ErrorSeverity } from './error-severity';
import type { ErrorType } from './error-type';
import type { BaseErrorJSON } from './base-error-json';

/**
 * Base error class for all custom errors
 * Provides common functionality and structure for error handling
 */
export abstract class BaseError extends Error {
  /** Error type classification */
  public readonly type: ErrorType;
  /** Error severity level */
  public readonly severity: ErrorSeverity;
  /** Additional error details */
  public readonly details?: unknown;
  /** Helpful suggestions for resolving the error */
  public readonly suggestions: readonly string[] | undefined;
  /** Error code for programmatic handling */
  public readonly code: string | undefined;
  /** Timestamp when the error occurred */
  public readonly timestamp: Date;

  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(message);
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.suggestions = suggestions ?? undefined;
    this.code = code ?? undefined;
    this.timestamp = new Date();

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts the error to a JSON-serializable object
   * @returns JSON representation of the error
   */
  toJSON(): BaseErrorJSON {
    return {
      name: this.name,
      type: this.type,
      severity: this.severity,
      message: this.message,
      details: this.details,
      suggestions: this.suggestions,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Gets a user-friendly error message with suggestions
   * @returns Formatted error message
   */
  getUserMessage(): string {
    let message = `${this.message}`;

    if (this.suggestions && this.suggestions.length > 0) {
      message += '\n\nSuggestions:\n';
      this.suggestions.forEach((suggestion, index) => {
        message += `${index + 1}. ${suggestion}\n`;
      });
    }

    return message;
  }
}
