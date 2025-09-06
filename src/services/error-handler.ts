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
import { ErrorMessageService } from './error-message-service';

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
   * Uses sophisticated pattern matching and context analysis for enhanced classification
   * @param error - The error to classify
   * @returns Error classification with recovery information
   */
  classifyError(error: BaseError): ErrorClassification {
    // Start with base classification
    const classification = this.getBaseClassification(error);

    // Apply context-aware enhancements
    this.applyContextAwareClassification(error, classification);

    // Apply pattern-based classification
    this.applyPatternBasedClassification(error, classification);

    // Apply error correlation analysis
    this.applyErrorCorrelationAnalysis(error, classification);

    // Finalize and validate classification
    this.finalizeClassification(classification);

    return classification;
  }

  /**
   * Gets the base classification for an error type
   * @param error - The error to classify
   * @returns Base error classification
   */
  private getBaseClassification(error: BaseError): ErrorClassification {
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

    // Classify based on error type with enhanced logic
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
   * Applies context-aware classification enhancements
   * @param error - The error to analyze
   * @param classification - The classification to enhance
   */
  private applyContextAwareClassification(
    error: BaseError,
    classification: ErrorClassification
  ): void {
    // Analyze error details for context
    if (error.details) {
      const details = error.details as Record<string, unknown>;

      // Check for specific error patterns in details
      if (details.statusCode) {
        const statusCode = Number(details.statusCode);
        this.adjustClassificationByStatusCode(statusCode, classification);
      }

      if (details.code) {
        const code = String(details.code);
        this.adjustClassificationByErrorCode(code, classification);
      }

      if (details.path) {
        const path = String(details.path);
        this.adjustClassificationByPath(path, classification);
      }

      if (details.operation) {
        const operation = String(details.operation);
        this.adjustClassificationByOperation(operation, classification);
      }
    }

    // Adjust severity based on error message content
    this.adjustSeverityByMessage(error.message, classification);
  }

  /**
   * Applies pattern-based classification using error message analysis
   * @param error - The error to analyze
   * @param classification - The classification to enhance
   */
  private applyPatternBasedClassification(
    error: BaseError,
    classification: ErrorClassification
  ): void {
    const message = error.message.toLowerCase();

    // Network-related patterns
    if (this.matchesPattern(message, ['timeout', 'connection refused', 'network unreachable'])) {
      classification.type = ErrorType.NETWORK_ERROR;
      classification.recoverable = true;
      classification.retryable = true;
      classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY_WITH_BACKOFF;
      classification.retryDelay = 3000;
      classification.userAction =
        'Network connectivity issue detected. Check your connection and try again.';
    }

    // Docker-related patterns
    if (
      this.matchesPattern(message, ['docker daemon', 'docker not running', 'permission denied'])
    ) {
      classification.type = ErrorType.DOCKER_ERROR;
      classification.recoverable = true;
      classification.retryable = true;
      classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY;
      classification.userAction =
        'Docker daemon issue detected. Ensure Docker is running and accessible.';
    }

    // Registry-related patterns
    if (this.matchesPattern(message, ['unauthorized', 'forbidden', 'rate limit', 'registry'])) {
      classification.type = ErrorType.REGISTRY_ERROR;
      classification.recoverable = true;
      classification.retryable = true;
      classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY_WITH_EXPONENTIAL_BACKOFF;
      classification.userAction =
        'Registry access issue detected. Check credentials and rate limits.';
    }

    // File system patterns
    if (this.matchesPattern(message, ['no space left', 'disk full', 'quota exceeded'])) {
      classification.type = ErrorType.FILE_WRITE_ERROR;
      classification.severity = ErrorSeverity.HIGH;
      classification.recoverable = false;
      classification.userAction = 'Disk space issue detected. Free up disk space and try again.';
    }

    // Security patterns
    if (this.matchesPattern(message, ['vulnerability', 'security', 'insecure', 'malicious'])) {
      classification.type = ErrorType.SECURITY_ERROR;
      classification.severity = ErrorSeverity.HIGH;
      classification.recoverable = false;
      classification.userAction =
        'Security issue detected. Address security concerns before proceeding.';
    }

    // Configuration patterns
    if (this.matchesPattern(message, ['invalid config', 'missing required', 'syntax error'])) {
      classification.type = ErrorType.CONFIG_LOAD_ERROR;
      classification.recoverable = false;
      classification.userAction = 'Configuration issue detected. Check your configuration file.';
    }
  }

  /**
   * Applies error correlation analysis to improve classification
   * @param error - The error to analyze
   * @param classification - The classification to enhance
   */
  private applyErrorCorrelationAnalysis(
    error: BaseError,
    classification: ErrorClassification
  ): void {
    // Check for repeated errors of the same type
    const recentErrors = this.getRecentErrorsByType(error.type, 5);
    if (recentErrors.length >= 3) {
      // Multiple recent errors of same type - increase severity and adjust strategy
      classification.severity = this.increaseSeverity(classification.severity);
      if (classification.retryable) {
        classification.maxRetries = Math.max(1, classification.maxRetries - 1);
        classification.retryDelay = Math.min(10000, classification.retryDelay * 2);
      }
      classification.userAction +=
        ' Multiple similar errors detected. Consider checking system state.';
    }

    // Check for error cascades (different error types in sequence)
    const recentErrorTypes = this.getRecentErrorTypes(10);
    if (this.detectErrorCascade(recentErrorTypes)) {
      classification.severity = ErrorSeverity.HIGH;
      classification.recoverable = false;
      classification.userAction =
        'Error cascade detected. System may be in unstable state. Restart recommended.';
    }
  }

  /**
   * Finalizes and validates the classification
   * @param classification - The classification to finalize
   */
  private finalizeClassification(classification: ErrorClassification): void {
    // Check if maxRetries is 0 (disabled) - if so, make error non-recoverable
    const maxRetries = this.options.maxRetries ?? ErrorHandlerService.DEFAULT_MAX_RETRIES;
    if (maxRetries === 0) {
      classification.recoverable = false;
      classification.retryable = false;
      classification.recoveryStrategy = ErrorRecoveryStrategy.NONE;
      return;
    }

    // Ensure consistency between recoverable and retryable
    if (classification.recoverable && !classification.retryable) {
      classification.retryable = true;
      classification.maxRetries = Math.max(1, Math.min(classification.maxRetries, maxRetries));
    }

    // Ensure retryable errors have appropriate retry settings
    if (classification.retryable) {
      if (classification.maxRetries === 0) {
        classification.maxRetries = 1;
      }
      if (classification.retryDelay === 0) {
        classification.retryDelay = 1000;
      }
    }

    // Validate recovery strategy consistency
    if (
      classification.recoveryStrategy === ErrorRecoveryStrategy.NONE &&
      classification.retryable
    ) {
      classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY;
    }
  }

  /**
   * Checks if a message matches any of the given patterns
   * @param message - The message to check
   * @param patterns - Array of patterns to match
   * @returns True if any pattern matches
   */
  private matchesPattern(message: string, patterns: string[]): boolean {
    return patterns.some(pattern => message.includes(pattern));
  }

  /**
   * Adjusts classification based on HTTP status code
   * @param statusCode - The HTTP status code
   * @param classification - The classification to adjust
   */
  private adjustClassificationByStatusCode(
    statusCode: number,
    classification: ErrorClassification
  ): void {
    if (statusCode >= 500) {
      // Server errors - usually retryable
      classification.recoverable = true;
      classification.retryable = true;
      classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY_WITH_BACKOFF;
      classification.userAction = 'Server error detected. Retrying with backoff.';
    } else if (statusCode === 429) {
      // Rate limiting - use exponential backoff
      classification.recoverable = true;
      classification.retryable = true;
      classification.recoveryStrategy = ErrorRecoveryStrategy.RETRY_WITH_EXPONENTIAL_BACKOFF;
      classification.retryDelay = 5000;
      classification.userAction = 'Rate limit exceeded. Retrying with exponential backoff.';
    } else if (statusCode >= 400 && statusCode < 500) {
      // Client errors - usually not retryable
      classification.recoverable = false;
      classification.retryable = false;
      classification.userAction = 'Client error detected. Check your request parameters.';
    }
  }

  /**
   * Adjusts classification based on error code
   * @param code - The error code
   * @param classification - The classification to adjust
   */
  private adjustClassificationByErrorCode(code: string, classification: ErrorClassification): void {
    const codeLower = code.toLowerCase();

    if (codeLower.includes('econnrefused') || codeLower.includes('enotfound')) {
      classification.type = ErrorType.NETWORK_ERROR;
      classification.recoverable = true;
      classification.retryable = true;
    } else if (codeLower.includes('eacces') || codeLower.includes('eperm')) {
      classification.type = ErrorType.FILE_WRITE_ERROR;
      classification.severity = ErrorSeverity.MEDIUM;
    } else if (codeLower.includes('enospc')) {
      classification.type = ErrorType.FILE_WRITE_ERROR;
      classification.severity = ErrorSeverity.HIGH;
      classification.recoverable = false;
    }
  }

  /**
   * Adjusts classification based on file path
   * @param path - The file path
   * @param classification - The classification to adjust
   */
  private adjustClassificationByPath(path: string, classification: ErrorClassification): void {
    if (path.includes('config') || path.includes('.json') || path.includes('.yaml')) {
      classification.type = ErrorType.CONFIG_LOAD_ERROR;
      classification.userAction = 'Configuration file issue detected. Check file path and format.';
    } else if (path.includes('template') || path.includes('.hbs')) {
      classification.type = ErrorType.TEMPLATE_ERROR;
      classification.userAction = 'Template file issue detected. Check template syntax and data.';
    }
  }

  /**
   * Adjusts classification based on operation type
   * @param operation - The operation being performed
   * @param classification - The classification to adjust
   */
  private adjustClassificationByOperation(
    operation: string,
    classification: ErrorClassification
  ): void {
    const opLower = operation.toLowerCase();

    if (opLower.includes('build')) {
      classification.type = ErrorType.BUILD_ERROR;
      classification.recoverable = true;
      classification.retryable = true;
    } else if (opLower.includes('push') || opLower.includes('pull')) {
      classification.type = ErrorType.REGISTRY_ERROR;
      classification.recoverable = true;
      classification.retryable = true;
    } else if (opLower.includes('manifest')) {
      classification.type = ErrorType.MANIFEST_ERROR;
      classification.recoverable = true;
      classification.retryable = true;
    }
  }

  /**
   * Adjusts severity based on error message content
   * @param message - The error message
   * @param classification - The classification to adjust
   */
  private adjustSeverityByMessage(message: string, classification: ErrorClassification): void {
    const msgLower = message.toLowerCase();

    if (this.matchesPattern(msgLower, ['critical', 'fatal', 'emergency'])) {
      classification.severity = ErrorSeverity.CRITICAL;
    } else if (this.matchesPattern(msgLower, ['warning', 'deprecated', 'notice'])) {
      classification.severity = ErrorSeverity.LOW;
    } else if (this.matchesPattern(msgLower, ['error', 'failed', 'exception'])) {
      classification.severity = ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Gets recent errors of a specific type
   * @param type - The error type to filter by
   * @param limit - Maximum number of errors to return
   * @returns Array of recent errors
   */
  private getRecentErrorsByType(type: ErrorType, limit: number): BaseError[] {
    const cutoffTime = Date.now() - ErrorHandlerService.DEFAULT_RECENT_ERROR_WINDOW_MS;
    return this.errorHistory
      .filter(error => error.type === type && error.timestamp.getTime() > cutoffTime)
      .slice(-limit);
  }

  /**
   * Gets recent error types
   * @param limit - Maximum number of error types to return
   * @returns Array of recent error types
   */
  private getRecentErrorTypes(limit: number): ErrorType[] {
    const cutoffTime = Date.now() - ErrorHandlerService.DEFAULT_RECENT_ERROR_WINDOW_MS;
    return this.errorHistory
      .filter(error => error.timestamp.getTime() > cutoffTime)
      .slice(-limit)
      .map(error => error.type);
  }

  /**
   * Detects if there's an error cascade (multiple different error types in sequence)
   * @param errorTypes - Array of recent error types
   * @returns True if error cascade is detected
   */
  private detectErrorCascade(errorTypes: ErrorType[]): boolean {
    if (errorTypes.length < 3) return false;

    // Check for 3 or more different error types in the last 5 errors
    const uniqueTypes = new Set(errorTypes.slice(-5));
    return uniqueTypes.size >= 3;
  }

  /**
   * Increases the severity level
   * @param severity - Current severity
   * @returns Increased severity
   */
  private increaseSeverity(severity: ErrorSeverity): ErrorSeverity {
    switch (severity) {
      case ErrorSeverity.LOW:
        return ErrorSeverity.MEDIUM;
      case ErrorSeverity.MEDIUM:
        return ErrorSeverity.HIGH;
      case ErrorSeverity.HIGH:
        return ErrorSeverity.CRITICAL;
      case ErrorSeverity.CRITICAL:
        return ErrorSeverity.CRITICAL;
      default:
        return ErrorSeverity.MEDIUM;
    }
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
    const userFriendlyMessage = ErrorMessageService.getMessageWithSeverity(error);
    const timestamp = error.timestamp.toISOString();

    console.error(`\n${userFriendlyMessage}`);
    console.error(`\nError Details:`);
    console.error(`  Type: ${error.type}`);
    console.error(`  Severity: ${classification.severity}`);
    console.error(`  Timestamp: ${timestamp}`);

    if (error.code) {
      console.error(`  Code: ${error.code}`);
    }

    if (classification.recoverable) {
      console.error(`\nRecovery: This error is recoverable and will be retried automatically.`);
      if (classification.retryable) {
        console.error(`  Max Retries: ${classification.maxRetries}`);
        console.error(`  Retry Delay: ${classification.retryDelay}ms`);
      }
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
