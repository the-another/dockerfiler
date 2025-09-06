/**
 * Error Message Service Tests
 *
 * This module contains comprehensive tests for the ErrorMessageService.
 * Tests verify that user-friendly error messages are generated correctly for all error types.
 */

import { describe, it, expect } from 'vitest';
import { ErrorMessageService } from '@/services/error-message-service';
import { BaseError } from '@/types/errors';
import { ErrorType, ErrorSeverity } from '@/types/errors';

/**
 * Test error class for testing purposes
 */
class TestError extends BaseError {
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

describe('ErrorMessageService', () => {
  describe('getUserFriendlyMessage', () => {
    it('should generate user-friendly message for CONFIG_LOAD_ERROR', () => {
      // Test generates user-friendly message for configuration loading errors
      // ensuring proper context and suggestions are included
      const error = new TestError(
        ErrorType.CONFIG_LOAD_ERROR,
        'Failed to load config.json',
        ErrorSeverity.MEDIUM,
        { path: '/path/to/config.json', operation: 'read' }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Failed to load configuration file');
      expect(message).toContain('Context: File: /path/to/config.json, Operation: read');
      expect(message).toContain(
        'Action Required: Please check the configuration file path, format, and permissions'
      );
      expect(message).toContain('Suggestions:');
      expect(message).toContain('Verify the configuration file exists and is readable');
      expect(message).toContain('Check the file format (JSON or YAML)');
    });

    it('should generate user-friendly message for VALIDATION_ERROR', () => {
      // Test generates user-friendly message for validation errors
      // ensuring validation-specific suggestions are provided
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Invalid PHP version',
        ErrorSeverity.MEDIUM,
        { field: 'php.version', value: 'invalid' }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Configuration validation failed');
      expect(message).toContain(
        'Action Required: Please fix the validation errors in your configuration'
      );
      expect(message).toContain('Review the validation error details above');
      expect(message).toContain('Check required fields are present');
    });

    it('should generate user-friendly message for DOCKER_ERROR', () => {
      // Test generates user-friendly message for Docker errors
      // ensuring Docker-specific context and suggestions are included
      const error = new TestError(
        ErrorType.DOCKER_ERROR,
        'Docker daemon not running',
        ErrorSeverity.HIGH,
        { operation: 'build', image: 'nginx:alpine' }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Docker operation failed');
      expect(message).toContain('Context: Operation: build, Image: nginx:alpine');
      expect(message).toContain('Action Required: Please ensure Docker is running and accessible');
      expect(message).toContain('Ensure Docker daemon is running');
      expect(message).toContain('Check Docker service status');
    });

    it('should generate user-friendly message for REGISTRY_ERROR', () => {
      // Test generates user-friendly message for registry errors
      // ensuring registry-specific context and suggestions are provided
      const error = new TestError(
        ErrorType.REGISTRY_ERROR,
        'Unauthorized access',
        ErrorSeverity.MEDIUM,
        { registry: 'docker.io', statusCode: 401 }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Docker registry operation failed');
      expect(message).toContain('Context: HTTP Status: 401, Registry: docker.io');
      expect(message).toContain(
        'Action Required: Please check your registry credentials and network connection'
      );
      expect(message).toContain('Verify registry credentials are correct');
      expect(message).toContain('Check your authentication credentials');
    });

    it('should generate user-friendly message for NETWORK_ERROR', () => {
      // Test generates user-friendly message for network errors
      // ensuring network-specific suggestions are included
      const error = new TestError(
        ErrorType.NETWORK_ERROR,
        'Connection timeout',
        ErrorSeverity.MEDIUM,
        { code: 'ETIMEDOUT', operation: 'fetch' }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Network operation failed');
      expect(message).toContain('Context: Operation: fetch, Error Code: ETIMEDOUT');
      expect(message).toContain(
        'Action Required: Please check your network connection and try again'
      );
      expect(message).toContain('Check your internet connection');
      expect(message).toContain('Verify firewall settings');
    });

    it('should generate user-friendly message for SECURITY_ERROR', () => {
      // Test generates user-friendly message for security errors
      // ensuring security-specific context and high severity handling
      const error = new TestError(
        ErrorType.SECURITY_ERROR,
        'Vulnerable dependency detected',
        ErrorSeverity.HIGH,
        { package: 'lodash', version: '4.17.15' }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Security validation failed');
      expect(message).toContain(
        'Action Required: Please address the security issues before proceeding'
      );
      expect(message).toContain('Review security validation results');
      expect(message).toContain('Update vulnerable dependencies');
    });

    it('should generate user-friendly message for BUILD_ERROR', () => {
      // Test generates user-friendly message for build errors
      // ensuring build-specific context and suggestions are provided
      const error = new TestError(ErrorType.BUILD_ERROR, 'Build failed', ErrorSeverity.MEDIUM, {
        architecture: 'arm64',
        platform: 'alpine',
      });

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Docker build failed');
      expect(message).toContain('Context: Architecture: arm64, Platform: alpine');
      expect(message).toContain(
        'Action Required: Please check your build configuration and dependencies'
      );
      expect(message).toContain('Check Dockerfile syntax and instructions');
      expect(message).toContain('Verify base images are accessible');
    });

    it('should generate user-friendly message for UNKNOWN_ERROR', () => {
      // Test generates user-friendly message for unknown errors
      // ensuring proper handling of unexpected error types
      const error = new TestError(
        ErrorType.UNKNOWN_ERROR,
        'Something went wrong',
        ErrorSeverity.HIGH
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('An unexpected error occurred');
      expect(message).toContain('Action Required: Please report this error with the details below');
      expect(message).toContain('Check the error details and stack trace');
      expect(message).toContain('Report this issue with the full error details');
    });

    it('should include context information when available', () => {
      // Test includes context information in error messages
      // ensuring all relevant context details are displayed
      const error = new TestError(
        ErrorType.FILE_WRITE_ERROR,
        'Permission denied',
        ErrorSeverity.MEDIUM,
        {
          path: '/output/dockerfile',
          operation: 'write',
          code: 'EACCES',
          command: 'build:dockerfile',
        }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain(
        'Context: File: /output/dockerfile, Operation: write, Error Code: EACCES, Command: build:dockerfile'
      );
      expect(message).toContain('Check file or directory permissions');
    });

    it('should include severity-based suggestions for critical errors', () => {
      // Test includes severity-based suggestions for critical errors
      // ensuring critical errors get appropriate priority messaging
      const error = new TestError(
        ErrorType.SECURITY_ERROR,
        'Critical vulnerability',
        ErrorSeverity.CRITICAL
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('This is a critical error that requires immediate attention');
    });

    it('should include severity-based suggestions for high priority errors', () => {
      // Test includes severity-based suggestions for high priority errors
      // ensuring high priority errors get appropriate messaging
      const error = new TestError(
        ErrorType.DOCKER_ERROR,
        'Docker daemon crashed',
        ErrorSeverity.HIGH
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('This is a high-priority error that should be addressed soon');
    });
  });

  describe('getShortMessage', () => {
    it('should generate short message with context', () => {
      // Test generates short error message with context
      // ensuring concise format for logging purposes
      const error = new TestError(
        ErrorType.CONFIG_LOAD_ERROR,
        'File not found',
        ErrorSeverity.MEDIUM,
        { path: '/config.json' }
      );

      const message = ErrorMessageService.getShortMessage(error);

      expect(message).toBe('Failed to load configuration file (File: /config.json)');
    });

    it('should generate short message without context when not available', () => {
      // Test generates short error message without context
      // ensuring graceful handling when context is missing
      const error = new TestError(
        ErrorType.UNKNOWN_ERROR,
        'Something went wrong',
        ErrorSeverity.MEDIUM
      );

      const message = ErrorMessageService.getShortMessage(error);

      expect(message).toBe('An unexpected error occurred');
    });
  });

  describe('getDetailedMessage', () => {
    it('should generate detailed message with technical information', () => {
      // Test generates detailed error message with technical information
      // ensuring comprehensive debugging information is included
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Invalid configuration',
        ErrorSeverity.MEDIUM,
        { field: 'php.version' },
        ['Check PHP version format'],
        'INVALID_PHP_VERSION'
      );

      const message = ErrorMessageService.getDetailedMessage(error);

      expect(message).toContain('Configuration validation failed');
      expect(message).toContain('Technical Details:');
      expect(message).toContain('Type: VALIDATION_ERROR');
      expect(message).toContain('Severity: MEDIUM');
      expect(message).toContain('Code: INVALID_PHP_VERSION');
      expect(message).toContain('Details: {\n  "field": "php.version"\n}');
    });
  });

  describe('getMessageWithSeverity', () => {
    it('should include severity icon for low severity', () => {
      // Test includes appropriate severity icon for low severity errors
      // ensuring visual indicators match severity levels
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Minor validation issue',
        ErrorSeverity.LOW
      );

      const message = ErrorMessageService.getMessageWithSeverity(error);

      expect(message).toContain('⚠️');
    });

    it('should include severity icon for medium severity', () => {
      // Test includes appropriate severity icon for medium severity errors
      // ensuring visual indicators match severity levels
      const error = new TestError(
        ErrorType.DOCKER_ERROR,
        'Docker build failed',
        ErrorSeverity.MEDIUM
      );

      const message = ErrorMessageService.getMessageWithSeverity(error);

      expect(message).toContain('❌');
    });

    it('should include severity icon for high severity', () => {
      // Test includes appropriate severity icon for high severity errors
      // ensuring visual indicators match severity levels
      const error = new TestError(
        ErrorType.SECURITY_ERROR,
        'Security vulnerability',
        ErrorSeverity.HIGH
      );

      const message = ErrorMessageService.getMessageWithSeverity(error);

      expect(message).toContain('🚨');
    });

    it('should include severity icon for critical severity', () => {
      // Test includes appropriate severity icon for critical severity errors
      // ensuring visual indicators match severity levels
      const error = new TestError(
        ErrorType.SECURITY_ERROR,
        'Critical security issue',
        ErrorSeverity.CRITICAL
      );

      const message = ErrorMessageService.getMessageWithSeverity(error);

      expect(message).toContain('💥');
    });
  });

  describe('error type coverage', () => {
    it('should handle all defined error types', () => {
      // Test ensures all error types are handled by the message service
      // preventing any error types from being missed
      const errorTypes = Object.values(ErrorType);

      errorTypes.forEach(errorType => {
        const error = new TestError(errorType, 'Test message');
        const message = ErrorMessageService.getUserFriendlyMessage(error);

        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(0);
        expect(message).toContain('Action Required:');
      });
    });
  });

  describe('status code handling', () => {
    it('should provide specific suggestions for 401 status code', () => {
      // Test provides specific suggestions for authentication errors
      // ensuring appropriate guidance for credential issues
      const error = new TestError(ErrorType.REGISTRY_ERROR, 'Unauthorized', ErrorSeverity.MEDIUM, {
        statusCode: 401,
      });

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Check your authentication credentials');
    });

    it('should provide specific suggestions for 403 status code', () => {
      // Test provides specific suggestions for permission errors
      // ensuring appropriate guidance for access issues
      const error = new TestError(ErrorType.REGISTRY_ERROR, 'Forbidden', ErrorSeverity.MEDIUM, {
        statusCode: 403,
      });

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Verify you have the required permissions');
    });

    it('should provide specific suggestions for 404 status code', () => {
      // Test provides specific suggestions for not found errors
      // ensuring appropriate guidance for resource issues
      const error = new TestError(ErrorType.REGISTRY_ERROR, 'Not found', ErrorSeverity.MEDIUM, {
        statusCode: 404,
      });

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Check if the resource exists and is accessible');
    });

    it('should provide specific suggestions for 429 status code', () => {
      // Test provides specific suggestions for rate limiting errors
      // ensuring appropriate guidance for rate limit issues
      const error = new TestError(
        ErrorType.REGISTRY_ERROR,
        'Too many requests',
        ErrorSeverity.MEDIUM,
        { statusCode: 429 }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Wait before retrying due to rate limiting');
    });

    it('should provide specific suggestions for 5xx status codes', () => {
      // Test provides specific suggestions for server errors
      // ensuring appropriate guidance for server-side issues
      const error = new TestError(
        ErrorType.REGISTRY_ERROR,
        'Internal server error',
        ErrorSeverity.MEDIUM,
        { statusCode: 500 }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('This appears to be a server-side issue, try again later');
    });
  });

  describe('error code handling', () => {
    it('should provide specific suggestions for ENOENT error code', () => {
      // Test provides specific suggestions for file not found errors
      // ensuring appropriate guidance for missing file issues
      const error = new TestError(
        ErrorType.FILE_WRITE_ERROR,
        'File not found',
        ErrorSeverity.MEDIUM,
        { code: 'ENOENT' }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Check if the file or directory exists');
    });

    it('should provide specific suggestions for EACCES error code', () => {
      // Test provides specific suggestions for permission errors
      // ensuring appropriate guidance for access permission issues
      const error = new TestError(
        ErrorType.FILE_WRITE_ERROR,
        'Permission denied',
        ErrorSeverity.MEDIUM,
        { code: 'EACCES' }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Check file or directory permissions');
    });

    it('should provide specific suggestions for ENOSPC error code', () => {
      // Test provides specific suggestions for disk space errors
      // ensuring appropriate guidance for storage issues
      const error = new TestError(ErrorType.FILE_WRITE_ERROR, 'No space left', ErrorSeverity.HIGH, {
        code: 'ENOSPC',
      });

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Free up disk space and try again');
    });

    it('should provide specific suggestions for ECONNREFUSED error code', () => {
      // Test provides specific suggestions for connection refused errors
      // ensuring appropriate guidance for service connectivity issues
      const error = new TestError(
        ErrorType.NETWORK_ERROR,
        'Connection refused',
        ErrorSeverity.MEDIUM,
        { code: 'ECONNREFUSED' }
      );

      const message = ErrorMessageService.getUserFriendlyMessage(error);

      expect(message).toContain('Check if the service is running and accessible');
    });
  });
});
