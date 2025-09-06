/**
 * Error Message Service
 *
 * This module provides user-friendly error messages for all error types in the Dockerfile Generator CLI.
 * All messages are in English only, with no localization support as per requirements.
 */

import { ErrorType, ErrorSeverity } from '../types/errors';
import type { BaseError } from '../types/errors';

/**
 * User-friendly error message templates and formatting
 * Provides clear, actionable error messages for all error types
 */
export class ErrorMessageService {
  /**
   * Gets a user-friendly error message for any error type
   * @param error - The error to format
   * @returns Formatted user-friendly error message
   */
  static getUserFriendlyMessage(error: BaseError): string {
    const baseMessage = this.getBaseMessage(error);
    const contextMessage = this.getContextMessage(error);
    const actionMessage = this.getActionMessage(error);
    const suggestions = this.getSuggestions(error);

    let message = baseMessage;

    if (contextMessage) {
      message += `\n\nContext: ${contextMessage}`;
    }

    if (actionMessage) {
      message += `\n\nAction Required: ${actionMessage}`;
    }

    if (suggestions.length > 0) {
      message += '\n\nSuggestions:';
      suggestions.forEach((suggestion, index) => {
        message += `\n  ${index + 1}. ${suggestion}`;
      });
    }

    return message;
  }

  /**
   * Gets the base error message for an error type
   * @param error - The error to get message for
   * @returns Base error message
   */
  private static getBaseMessage(error: BaseError): string {
    switch (error.type) {
      case ErrorType.CONFIG_LOAD_ERROR:
        return 'Failed to load configuration file';

      case ErrorType.VALIDATION_ERROR:
        return 'Configuration validation failed';

      case ErrorType.TEMPLATE_ERROR:
        return 'Template processing failed';

      case ErrorType.FILE_WRITE_ERROR:
        return 'File operation failed';

      case ErrorType.SECURITY_ERROR:
        return 'Security validation failed';

      case ErrorType.DOCKER_ERROR:
        return 'Docker operation failed';

      case ErrorType.REGISTRY_ERROR:
        return 'Docker registry operation failed';

      case ErrorType.ARGUMENT_ERROR:
        return 'Invalid command arguments';

      case ErrorType.NETWORK_ERROR:
        return 'Network operation failed';

      case ErrorType.BUILD_ERROR:
        return 'Docker build failed';

      case ErrorType.MANIFEST_ERROR:
        return 'Docker manifest operation failed';

      case ErrorType.TEST_ERROR:
        return 'Test execution failed';

      case ErrorType.UNKNOWN_ERROR:
        return 'An unexpected error occurred';

      default:
        return 'An error occurred';
    }
  }

  /**
   * Gets contextual information about the error
   * @param error - The error to get context for
   * @returns Context message or empty string
   */
  private static getContextMessage(error: BaseError): string {
    if (!error.details) {
      return '';
    }

    const details = error.details as Record<string, unknown>;
    const contextParts: string[] = [];

    // Add file path context
    if (details.path) {
      contextParts.push(`File: ${details.path}`);
    }

    // Add operation context
    if (details.operation) {
      contextParts.push(`Operation: ${details.operation}`);
    }

    // Add status code context
    if (details.statusCode) {
      contextParts.push(`HTTP Status: ${details.statusCode}`);
    }

    // Add error code context
    if (details.code) {
      contextParts.push(`Error Code: ${details.code}`);
    }

    // Add command context
    if (details.command) {
      contextParts.push(`Command: ${details.command}`);
    }

    // Add registry context
    if (details.registry) {
      contextParts.push(`Registry: ${details.registry}`);
    }

    // Add image context
    if (details.image) {
      contextParts.push(`Image: ${details.image}`);
    }

    // Add architecture context
    if (details.architecture) {
      contextParts.push(`Architecture: ${details.architecture}`);
    }

    // Add platform context
    if (details.platform) {
      contextParts.push(`Platform: ${details.platform}`);
    }

    return contextParts.join(', ');
  }

  /**
   * Gets the action required message for an error
   * @param error - The error to get action for
   * @returns Action message
   */
  private static getActionMessage(error: BaseError): string {
    switch (error.type) {
      case ErrorType.CONFIG_LOAD_ERROR:
        return 'Please check the configuration file path, format, and permissions';

      case ErrorType.VALIDATION_ERROR:
        return 'Please fix the validation errors in your configuration';

      case ErrorType.TEMPLATE_ERROR:
        return 'Please check your template syntax and data bindings';

      case ErrorType.FILE_WRITE_ERROR:
        return 'Please check file permissions and available disk space';

      case ErrorType.SECURITY_ERROR:
        return 'Please address the security issues before proceeding';

      case ErrorType.DOCKER_ERROR:
        return 'Please ensure Docker is running and accessible';

      case ErrorType.REGISTRY_ERROR:
        return 'Please check your registry credentials and network connection';

      case ErrorType.ARGUMENT_ERROR:
        return 'Please check your command arguments and options';

      case ErrorType.NETWORK_ERROR:
        return 'Please check your network connection and try again';

      case ErrorType.BUILD_ERROR:
        return 'Please check your build configuration and dependencies';

      case ErrorType.MANIFEST_ERROR:
        return 'Please check your manifest configuration and registry access';

      case ErrorType.TEST_ERROR:
        return 'Please review your test configuration and environment';

      case ErrorType.UNKNOWN_ERROR:
        return 'Please report this error with the details below';

      default:
        return 'Please check the error details and try again';
    }
  }

  /**
   * Gets specific suggestions for resolving the error
   * @param error - The error to get suggestions for
   * @returns Array of suggestion strings
   */
  private static getSuggestions(error: BaseError): string[] {
    const suggestions: string[] = [];

    // Add error-specific suggestions
    suggestions.push(...this.getErrorTypeSuggestions(error.type));

    // Add context-specific suggestions
    if (error.details) {
      suggestions.push(...this.getContextSuggestions(error.details));
    }

    // Add severity-based suggestions
    suggestions.unshift(...this.getSeveritySuggestions(error.severity));

    return suggestions;
  }

  /**
   * Gets suggestions based on error type
   * @param errorType - The type of error
   * @returns Array of suggestion strings
   */
  private static getErrorTypeSuggestions(errorType: ErrorType): string[] {
    const suggestionMap: Record<ErrorType, string[]> = {
      [ErrorType.CONFIG_LOAD_ERROR]: [
        'Verify the configuration file exists and is readable',
        'Check the file format (JSON or YAML)',
        'Ensure the file contains valid configuration syntax',
        'Check file permissions and ownership',
      ],
      [ErrorType.VALIDATION_ERROR]: [
        'Review the validation error details above',
        'Check required fields are present',
        'Verify field types and values match the schema',
        'Use the --validate flag to check your configuration',
      ],
      [ErrorType.TEMPLATE_ERROR]: [
        'Check template syntax and Handlebars expressions',
        'Verify all required template variables are provided',
        'Ensure template files exist and are readable',
        'Check for circular references in template data',
      ],
      [ErrorType.FILE_WRITE_ERROR]: [
        'Check available disk space',
        'Verify write permissions for the target directory',
        'Ensure the target directory exists',
        'Check for file locks or concurrent access',
      ],
      [ErrorType.SECURITY_ERROR]: [
        'Review security validation results',
        'Update vulnerable dependencies',
        'Check security configuration settings',
        'Run security scans on your configuration',
      ],
      [ErrorType.DOCKER_ERROR]: [
        'Ensure Docker daemon is running',
        'Check Docker service status',
        'Verify Docker CLI is accessible',
        'Check Docker daemon logs for details',
      ],
      [ErrorType.REGISTRY_ERROR]: [
        'Verify registry credentials are correct',
        'Check network connectivity to the registry',
        'Ensure you have push/pull permissions',
        'Check for rate limiting or quota issues',
      ],
      [ErrorType.ARGUMENT_ERROR]: [
        'Check command syntax and required options',
        'Verify argument values are valid',
        'Use --help to see available options',
        'Check for typos in command arguments',
      ],
      [ErrorType.NETWORK_ERROR]: [
        'Check your internet connection',
        'Verify firewall settings',
        'Check proxy configuration if applicable',
        'Try again after a brief delay',
      ],
      [ErrorType.BUILD_ERROR]: [
        'Check Dockerfile syntax and instructions',
        'Verify base images are accessible',
        'Check build context and file paths',
        'Review Docker build logs for details',
      ],
      [ErrorType.MANIFEST_ERROR]: [
        'Verify manifest configuration',
        'Check registry access permissions',
        'Ensure all referenced images exist',
        'Verify multi-architecture support',
      ],
      [ErrorType.TEST_ERROR]: [
        'Check test environment setup',
        'Verify test dependencies are installed',
        'Review test configuration',
        'Check test data and fixtures',
      ],
      [ErrorType.UNKNOWN_ERROR]: [
        'Check the error details and stack trace',
        'Verify your environment and dependencies',
        'Try running the command with --verbose for more details',
        'Report this issue with the full error details',
      ],
    };

    return suggestionMap[errorType] || [];
  }

  /**
   * Gets suggestions based on error context details
   * @param details - Error details object
   * @returns Array of suggestion strings
   */
  private static getContextSuggestions(details: unknown): string[] {
    const suggestions: string[] = [];
    const detailsObj = details as Record<string, unknown>;

    // Add suggestions based on HTTP status codes
    suggestions.push(...this.getStatusCodeSuggestions(detailsObj.statusCode));

    // Add suggestions based on system error codes
    suggestions.push(...this.getSystemCodeSuggestions(detailsObj.code));

    return suggestions;
  }

  /**
   * Gets suggestions based on HTTP status codes
   * @param statusCode - HTTP status code
   * @returns Array of suggestion strings
   */
  private static getStatusCodeSuggestions(statusCode: unknown): string[] {
    const suggestions: string[] = [];

    if (statusCode === 401) {
      suggestions.push('Check your authentication credentials');
    } else if (statusCode === 403) {
      suggestions.push('Verify you have the required permissions');
    } else if (statusCode === 404) {
      suggestions.push('Check if the resource exists and is accessible');
    } else if (statusCode === 429) {
      suggestions.push('Wait before retrying due to rate limiting');
    } else if (typeof statusCode === 'number' && statusCode >= 500) {
      suggestions.push('This appears to be a server-side issue, try again later');
    }

    return suggestions;
  }

  /**
   * Gets suggestions based on system error codes
   * @param code - System error code
   * @returns Array of suggestion strings
   */
  private static getSystemCodeSuggestions(code: unknown): string[] {
    const suggestions: string[] = [];

    if (code === 'ENOENT') {
      suggestions.push('Check if the file or directory exists');
    } else if (code === 'EACCES') {
      suggestions.push('Check file or directory permissions');
    } else if (code === 'ENOSPC') {
      suggestions.push('Free up disk space and try again');
    } else if (code === 'ECONNREFUSED') {
      suggestions.push('Check if the service is running and accessible');
    }

    return suggestions;
  }

  /**
   * Gets suggestions based on error severity
   * @param severity - Error severity level
   * @returns Array of suggestion strings
   */
  private static getSeveritySuggestions(severity: ErrorSeverity): string[] {
    const suggestions: string[] = [];

    if (severity === ErrorSeverity.CRITICAL) {
      suggestions.push('This is a critical error that requires immediate attention');
    } else if (severity === ErrorSeverity.HIGH) {
      suggestions.push('This is a high-priority error that should be addressed soon');
    }

    return suggestions;
  }

  /**
   * Gets a short, concise error message for logging
   * @param error - The error to format
   * @returns Short error message
   */
  static getShortMessage(error: BaseError): string {
    const baseMessage = this.getBaseMessage(error);
    const context = this.getContextMessage(error);

    if (context) {
      return `${baseMessage} (${context})`;
    }

    return baseMessage;
  }

  /**
   * Gets a detailed error message for debugging
   * @param error - The error to format
   * @returns Detailed error message
   */
  static getDetailedMessage(error: BaseError): string {
    const userMessage = this.getUserFriendlyMessage(error);
    const technicalDetails = this.getTechnicalDetails(error);

    return `${userMessage}\n\nTechnical Details:\n${technicalDetails}`;
  }

  /**
   * Gets technical details for debugging
   * @param error - The error to get details for
   * @returns Technical details string
   */
  private static getTechnicalDetails(error: BaseError): string {
    const details: string[] = [];

    details.push(`Type: ${error.type}`);
    details.push(`Severity: ${error.severity}`);
    details.push(`Timestamp: ${error.timestamp.toISOString()}`);

    if (error.code) {
      details.push(`Code: ${error.code}`);
    }

    if (error.details) {
      details.push(`Details: ${JSON.stringify(error.details, null, 2)}`);
    }

    if (error.stack) {
      details.push(`Stack Trace:\n${error.stack}`);
    }

    return details.join('\n');
  }

  /**
   * Gets error message with severity indicator
   * @param error - The error to format
   * @returns Error message with severity indicator
   */
  static getMessageWithSeverity(error: BaseError): string {
    const severityIcon = this.getSeverityIcon(error.severity);
    const message = this.getUserFriendlyMessage(error);

    return `${severityIcon} ${message}`;
  }

  /**
   * Gets severity icon for display
   * @param severity - The error severity
   * @returns Severity icon
   */
  private static getSeverityIcon(severity: ErrorSeverity): string {
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
}
