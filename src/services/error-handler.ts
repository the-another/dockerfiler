/**
 * Error Handler Service
 *
 * This module contains the ErrorHandlerService that provides centralized error handling,
 * classification, recovery strategies, and user-friendly error message generation.
 */

import { BaseError } from '@/types/errors';
import { ErrorType, ErrorSeverity } from '@/types/errors';
import { ErrorRecoveryStrategy } from '@/types/services/error-handler';
import type { ErrorHandlerOptions, ErrorClassification } from '@/types/services/error-handler';

/**
 * Error Handler Service
 * Provides centralized error handling, classification, and recovery strategies
 */
export class ErrorHandlerService {
  private readonly options: ErrorHandlerOptions;
  private readonly retryAttempts: Map<string, number> = new Map();
  private readonly errorHistory: BaseError[] = [];
  private static readonly DEFAULT_MAX_RETRIES = 3;
  private static readonly DEFAULT_RETRY_DELAY = 1000;
  private static readonly DEFAULT_MAX_ERROR_HISTORY = 100;
  private static readonly DEFAULT_RECENT_ERROR_WINDOW_MS = 60000;
  private static readonly DEFAULT_USER_ACTION = 'Please check the error details and try again.';

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      maxRetries: ErrorHandlerService.DEFAULT_MAX_RETRIES,
      retryDelay: ErrorHandlerService.DEFAULT_RETRY_DELAY,
      maxErrorHistory: ErrorHandlerService.DEFAULT_MAX_ERROR_HISTORY,
      enableRecovery: true,
      enableClassification: true,
      enableUserFriendlyMessages: true,
      ...options,
    };
  }

  /**
   * Handles an error with classification, recovery, and user-friendly messaging
   * @param error - The error to handle
   * @param context - Additional context for error handling
   * @returns Promise resolving to recovery result or throwing the error
   */
  async handleError(error: Error, context?: Record<string, unknown>): Promise<void> {
    // Convert to BaseError if not already
    const baseError = this.ensureBaseError(error, context);

    // Add to error history
    this.addToHistory(baseError);

    // Classify the error
    const classification = this.options.enableClassification
      ? this.classifyError(baseError)
      : this.getDefaultClassification(baseError);

    // Generate user-friendly message if enabled
    if (this.options.enableUserFriendlyMessages) {
      this.logUserFriendlyError(baseError, classification);
    }

    // Attempt recovery if enabled
    if (this.options.enableRecovery && classification.recoverable) {
      const recoveryResult = await this.attemptRecovery(baseError, classification);
      if (recoveryResult.success) {
        return;
      }
    }

    // If recovery failed or not attempted, throw the error
    throw baseError;
  }

  /**
   * Classifies an error to determine its type, severity, and recovery strategy
   * @param error - The error to classify
   * @returns Error classification with recovery information
   */
  classifyError(error: BaseError): ErrorClassification {
    const classification: ErrorClassification = {
      type: error.type,
      severity: error.severity,
      recoverable: false,
      recoveryStrategy: ErrorRecoveryStrategy.NONE,
      retryable: false,
      maxRetries: 0,
      retryDelay: 0,
      userAction: ErrorHandlerService.DEFAULT_USER_ACTION,
    };

    // Classify based on error type
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        classification.recoverable = true;
        classification.retryable = true;
        classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY;
        classification.maxRetries = Math.min(
          3,
          this.options.maxRetries ?? ErrorHandlerService.DEFAULT_MAX_RETRIES
        );
        classification.retryDelay = 2000;
        classification.userAction = 'Check your network connection and try again.';
        break;

      case ErrorType.REGISTRY_ERROR:
        classification.recoverable = true;
        classification.retryable = true;
        classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY_WITH_BACKOFF;
        classification.maxRetries = Math.min(
          5,
          this.options.maxRetries ?? ErrorHandlerService.DEFAULT_MAX_RETRIES
        );
        classification.retryDelay = 1000;
        classification.userAction = 'Check your registry credentials and network connection.';
        break;

      case ErrorType.DOCKER_ERROR:
        classification.recoverable = true;
        classification.retryable = true;
        classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY;
        classification.maxRetries = Math.min(
          2,
          this.options.maxRetries ?? ErrorHandlerService.DEFAULT_MAX_RETRIES
        );
        classification.retryDelay = 3000;
        classification.userAction = 'Ensure Docker is running and accessible.';
        break;

      case ErrorType.CONFIG_LOAD_ERROR:
        classification.recoverable = false;
        classification.retryable = false;
        classification.recoveryStrategy = ErrorRecoveryStrategy.NONE;
        classification.userAction = 'Check the configuration file path and format.';
        break;

      case ErrorType.VALIDATION_ERROR:
        classification.recoverable = false;
        classification.retryable = false;
        classification.recoveryStrategy = ErrorRecoveryStrategy.NONE;
        classification.userAction = 'Fix the validation errors in your configuration.';
        break;

      case ErrorType.SECURITY_ERROR:
        classification.recoverable = false;
        classification.retryable = false;
        classification.recoveryStrategy = ErrorRecoveryStrategy.NONE;
        classification.severity = ErrorSeverity.HIGH;
        classification.userAction = 'Address the security issues before proceeding.';
        break;

      case ErrorType.TEMPLATE_ERROR:
        classification.recoverable = false;
        classification.retryable = false;
        classification.recoveryStrategy = ErrorRecoveryStrategy.NONE;
        classification.userAction = 'Check your template configuration and data.';
        break;

      case ErrorType.FILE_WRITE_ERROR:
        classification.recoverable = true;
        classification.retryable = true;
        classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY;
        classification.maxRetries = Math.min(
          2,
          this.options.maxRetries ?? ErrorHandlerService.DEFAULT_MAX_RETRIES
        );
        classification.retryDelay = 1000;
        classification.userAction = 'Check file permissions and disk space.';
        break;

      case ErrorType.BUILD_ERROR:
        classification.recoverable = true;
        classification.retryable = true;
        classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY;
        classification.maxRetries = Math.min(
          1,
          this.options.maxRetries ?? ErrorHandlerService.DEFAULT_MAX_RETRIES
        );
        classification.retryDelay = 5000;
        classification.userAction = 'Check your build configuration and dependencies.';
        break;

      case ErrorType.MANIFEST_ERROR:
        classification.recoverable = true;
        classification.retryable = true;
        classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY;
        classification.maxRetries = Math.min(
          2,
          this.options.maxRetries ?? ErrorHandlerService.DEFAULT_MAX_RETRIES
        );
        classification.retryDelay = 2000;
        classification.userAction = 'Check your manifest configuration and registry access.';
        break;

      case ErrorType.ARGUMENT_ERROR:
        classification.recoverable = false;
        classification.retryable = false;
        classification.recoveryStrategy = ErrorRecoveryStrategy.NONE;
        classification.userAction = 'Check your command arguments and options.';
        break;

      case ErrorType.TEST_ERROR:
        classification.recoverable = false;
        classification.retryable = false;
        classification.recoveryStrategy = ErrorRecoveryStrategy.NONE;
        classification.userAction = 'Review your test configuration and environment.';
        break;

      case ErrorType.UNKNOWN_ERROR:
        classification.recoverable = false;
        classification.retryable = false;
        classification.recoveryStrategy = ErrorRecoveryStrategy.NONE;
        classification.severity = ErrorSeverity.HIGH;
        classification.userAction = 'This is an unexpected error. Please report it.';
        break;

      default:
        classification.recoverable = false;
        classification.retryable = false;
        classification.recoveryStrategy = ErrorRecoveryStrategy.NONE;
        classification.userAction = 'Please check the error details and try again.';
    }

    return classification;
  }

  /**
   * Attempts to recover from an error using the specified recovery strategy
   * @param error - The error to recover from
   * @param classification - The error classification
   * @returns Promise resolving to recovery result
   */
  private async attemptRecovery(
    error: BaseError,
    classification: ErrorClassification
  ): Promise<{ success: boolean; error?: BaseError }> {
    const errorKey = this.getErrorKey(error);
    const currentAttempts = this.retryAttempts.get(errorKey) || 0;

    if (currentAttempts >= classification.maxRetries) {
      return { success: false, error };
    }

    // Increment retry count
    this.retryAttempts.set(errorKey, currentAttempts + 1);

    try {
      switch (classification.recoveryStrategy) {
        case ErrorRecoveryStrategy.RETRY:
          await this.delay(classification.retryDelay);
          return { success: true };

        case ErrorRecoveryStrategy.RETRY_WITH_BACKOFF: {
          const backoffDelay = classification.retryDelay * Math.pow(2, currentAttempts);
          await this.delay(backoffDelay);
          return { success: true };
        }

        case ErrorRecoveryStrategy.RETRY_WITH_EXPONENTIAL_BACKOFF: {
          const exponentialDelay =
            classification.retryDelay * Math.pow(2, currentAttempts) + Math.random() * 1000;
          await this.delay(exponentialDelay);
          return { success: true };
        }

        case ErrorRecoveryStrategy.NONE:
        default:
          return { success: false, error };
      }
    } catch (recoveryError) {
      return { success: false, error: recoveryError as BaseError };
    }
  }

  /**
   * Generates a user-friendly error message with context and suggestions
   * @param error - The error to format
   * @param classification - The error classification
   */
  private logUserFriendlyError(error: BaseError, classification: ErrorClassification): void {
    const severityIcon = this.getSeverityIcon(classification.severity);
    const timestamp = error.timestamp.toISOString();

    console.error(`\n${severityIcon} Error [${error.type}] (${timestamp})`);
    console.error(`Message: ${error.message}`);

    if (error.details) {
      console.error(`Details: ${JSON.stringify(error.details, null, 2)}`);
    }

    if (error.suggestions && error.suggestions.length > 0) {
      console.error('\nSuggestions:');
      error.suggestions.forEach((suggestion, index) => {
        console.error(`  ${index + 1}. ${suggestion}`);
      });
    }

    console.error(`\nAction: ${classification.userAction}`);

    if (classification.recoverable) {
      console.error('Recovery: This error is recoverable and will be retried automatically.');
    }

    console.error(''); // Empty line for readability
  }

  /**
   * Ensures the error is a BaseError instance
   * @param error - The error to convert
   * @param context - Additional context
   * @returns BaseError instance
   */
  private ensureBaseError(error: Error, context?: Record<string, unknown>): BaseError {
    if (error instanceof BaseError) {
      return error;
    }

    // Convert standard Error to BaseError
    return new (class extends BaseError {
      constructor(message: string, details?: unknown) {
        super(ErrorType.UNKNOWN_ERROR, message, ErrorSeverity.MEDIUM, details);
      }
    })(error.message, { originalError: error, context });
  }

  /**
   * Gets default classification for errors that can't be classified
   * @param error - The error to classify
   * @returns Default error classification
   */
  private getDefaultClassification(error: BaseError): ErrorClassification {
    return {
      type: error.type,
      severity: error.severity,
      recoverable: false,
      recoveryStrategy: ErrorRecoveryStrategy.NONE,
      retryable: false,
      maxRetries: 0,
      retryDelay: 0,
      userAction: ErrorHandlerService.DEFAULT_USER_ACTION,
    };
  }

  /**
   * Adds an error to the error history
   * @param error - The error to add
   */
  private addToHistory(error: BaseError): void {
    this.errorHistory.push(error);

    // Maintain max history size
    if (
      this.errorHistory.length >
      (this.options.maxErrorHistory ?? ErrorHandlerService.DEFAULT_MAX_ERROR_HISTORY)
    ) {
      this.errorHistory.shift();
    }
  }

  /**
   * Gets a unique key for an error for retry tracking
   * @param error - The error to get key for
   * @returns Unique error key
   */
  private getErrorKey(error: BaseError): string {
    return `${error.type}:${error.message}:${error.timestamp?.getTime() ?? Date.now()}`;
  }

  /**
   * Gets an icon for error severity
   * @param severity - The error severity
   * @returns Severity icon
   */
  private getSeverityIcon(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return '⚠️';
      case ErrorSeverity.MEDIUM:
        return '❌';
      case ErrorSeverity.HIGH:
        return '🚨';
      case ErrorSeverity.CRITICAL:
        return '💥';
      default:
        return '❌';
    }
  }

  /**
   * Delays execution for the specified number of milliseconds
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets the error history
   * @returns Array of recent errors
   */
  getErrorHistory(): readonly BaseError[] {
    return [...this.errorHistory];
  }

  /**
   * Clears the error history
   */
  clearErrorHistory(): void {
    this.errorHistory.length = 0;
    this.retryAttempts.clear();
  }

  /**
   * Gets error statistics
   * @returns Error statistics object
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: number;
  } {
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const recentErrors = this.errorHistory.filter(
      error =>
        Date.now() - error.timestamp.getTime() < ErrorHandlerService.DEFAULT_RECENT_ERROR_WINDOW_MS
    ).length;

    this.errorHistory.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] ?? 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] ?? 0) + 1;
    });

    return {
      totalErrors: this.errorHistory.length,
      errorsByType,
      errorsBySeverity,
      recentErrors,
    };
  }
}
