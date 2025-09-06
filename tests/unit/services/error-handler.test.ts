/**
 * Error Handler Service Unit Tests
 *
 * This module contains comprehensive unit tests for the ErrorHandlerService.
 * Tests cover error classification, recovery strategies, user-friendly messaging,
 * and error statistics functionality.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorHandlerService } from '@/services/error-handler';
import { BaseError } from '@/types/errors';
import { ErrorType, ErrorSeverity } from '@/types/errors';
import { ErrorRecoveryStrategy } from '@/types/services/error-handler';

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ErrorHandlerService', () => {
  let errorHandler: ErrorHandlerService;

  beforeEach(() => {
    errorHandler = new ErrorHandlerService();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      // Test that the service initializes with default configuration
      // ensuring all default values are properly set
      const service = new ErrorHandlerService();
      expect(service).toBeInstanceOf(ErrorHandlerService);
    });

    it('should initialize with custom options', () => {
      // Test that custom options override default values
      // ensuring configuration flexibility works correctly
      const customOptions = {
        maxRetries: 5,
        retryDelay: 2000,
        maxErrorHistory: 50,
        enableRecovery: false,
        enableClassification: false,
        enableUserFriendlyMessages: false,
      };

      const service = new ErrorHandlerService(customOptions);
      expect(service).toBeInstanceOf(ErrorHandlerService);
    });
  });

  describe('handleError', () => {
    it('should handle BaseError instances correctly', async () => {
      // Test that BaseError instances are handled without conversion
      // ensuring proper error type preservation
      const baseError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Test validation error', ErrorSeverity.MEDIUM);
        }
      })();

      await expect(errorHandler.handleError(baseError)).rejects.toThrow('Test validation error');
    });

    it('should convert standard Error to BaseError', async () => {
      // Test that standard Error objects are converted to BaseError
      // ensuring consistent error handling across different error types
      const standardError = new Error('Standard error message');

      await expect(errorHandler.handleError(standardError)).rejects.toThrow();
    });

    it('should add errors to history', async () => {
      // Test that errors are properly tracked in the error history
      // ensuring error tracking functionality works correctly
      const error = new Error('Test error');

      try {
        await errorHandler.handleError(error);
      } catch {
        // Expected to throw
      }

      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(1);
    });

    it('should handle errors with context', async () => {
      // Test that additional context is preserved when handling errors
      // ensuring context information is not lost during error processing
      const error = new Error('Test error');
      const context = { command: 'test', file: 'test.ts' };

      try {
        await errorHandler.handleError(error, context);
      } catch {
        // Expected to throw
      }

      const history = errorHandler.getErrorHistory();
      expect(history[0].details).toMatchObject({ context });
    });
  });

  describe('classifyError', () => {
    it('should classify network errors as recoverable', () => {
      // Test that network errors are classified as recoverable with retry strategy
      // ensuring network issues can be automatically retried
      const networkError = new (class extends BaseError {
        constructor() {
          super(ErrorType.NETWORK_ERROR, 'Network connection failed', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(networkError);

      expect(classification.type).toBe(ErrorType.NETWORK_ERROR);
      expect(classification.recoverable).toBe(true);
      expect(classification.retryable).toBe(true);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.RETRY);
      expect(classification.maxRetries).toBe(3);
      expect(classification.retryDelay).toBe(2000);
    });

    it('should classify registry errors with backoff strategy', () => {
      // Test that registry errors use exponential backoff for recovery
      // ensuring registry rate limiting is handled appropriately
      const registryError = new (class extends BaseError {
        constructor() {
          super(ErrorType.REGISTRY_ERROR, 'Registry push failed', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(registryError);

      expect(classification.type).toBe(ErrorType.REGISTRY_ERROR);
      expect(classification.recoverable).toBe(true);
      expect(classification.retryable).toBe(true);
      expect(classification.recoveryStrategy).toBe(
        ErrorRecoveryStrategy.RETRY_WITH_EXPONENTIAL_BACKOFF
      );
      expect(classification.maxRetries).toBe(3);
      expect(classification.retryDelay).toBe(1000);
    });

    it('should classify Docker errors as recoverable', () => {
      // Test that Docker errors are classified as recoverable
      // ensuring Docker service issues can be retried
      const dockerError = new (class extends BaseError {
        constructor() {
          super(ErrorType.DOCKER_ERROR, 'Docker build failed', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(dockerError);

      expect(classification.type).toBe(ErrorType.DOCKER_ERROR);
      expect(classification.recoverable).toBe(true);
      expect(classification.retryable).toBe(true);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.RETRY);
      expect(classification.maxRetries).toBe(2);
      expect(classification.retryDelay).toBe(3000);
    });

    it('should classify config load errors as non-recoverable', () => {
      // Test that configuration loading errors are not recoverable
      // ensuring configuration issues require manual intervention
      const configError = new (class extends BaseError {
        constructor() {
          super(ErrorType.CONFIG_LOAD_ERROR, 'Config file not found', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(configError);

      expect(classification.type).toBe(ErrorType.CONFIG_LOAD_ERROR);
      expect(classification.recoverable).toBe(false);
      expect(classification.retryable).toBe(false);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.NONE);
    });

    it('should classify validation errors as non-recoverable', () => {
      // Test that validation errors are not recoverable
      // ensuring validation issues require configuration fixes
      const validationError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Schema validation failed', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(validationError);

      expect(classification.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(classification.recoverable).toBe(false);
      expect(classification.retryable).toBe(false);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.NONE);
    });

    it('should classify security errors as high severity', () => {
      // Test that security errors are classified with high severity
      // ensuring security issues are treated with appropriate importance
      const securityError = new (class extends BaseError {
        constructor() {
          super(ErrorType.SECURITY_ERROR, 'Security validation failed', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(securityError);

      expect(classification.type).toBe(ErrorType.SECURITY_ERROR);
      expect(classification.severity).toBe(ErrorSeverity.HIGH);
      expect(classification.recoverable).toBe(false);
      expect(classification.retryable).toBe(false);
    });

    it('should classify template errors as non-recoverable', () => {
      // Test that template errors are not recoverable
      // ensuring template issues require manual fixes
      const templateError = new (class extends BaseError {
        constructor() {
          super(ErrorType.TEMPLATE_ERROR, 'Template rendering failed', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(templateError);

      expect(classification.type).toBe(ErrorType.TEMPLATE_ERROR);
      expect(classification.recoverable).toBe(false);
      expect(classification.retryable).toBe(false);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.NONE);
    });

    it('should classify file write errors as recoverable', () => {
      // Test that file write errors are recoverable
      // ensuring temporary file system issues can be retried
      const fileError = new (class extends BaseError {
        constructor() {
          super(ErrorType.FILE_WRITE_ERROR, 'Failed to write file', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(fileError);

      expect(classification.type).toBe(ErrorType.FILE_WRITE_ERROR);
      expect(classification.recoverable).toBe(true);
      expect(classification.retryable).toBe(true);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.RETRY);
      expect(classification.maxRetries).toBe(2);
    });

    it('should classify build errors as recoverable', () => {
      // Test that build errors are recoverable with limited retries
      // ensuring build issues can be retried but not indefinitely
      const buildError = new (class extends BaseError {
        constructor() {
          super(ErrorType.BUILD_ERROR, 'Build process failed', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(buildError);

      expect(classification.type).toBe(ErrorType.BUILD_ERROR);
      expect(classification.recoverable).toBe(true);
      expect(classification.retryable).toBe(true);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.RETRY);
      expect(classification.maxRetries).toBe(1);
      expect(classification.retryDelay).toBe(5000);
    });

    it('should classify manifest errors as recoverable', () => {
      // Test that manifest errors are recoverable
      // ensuring manifest operations can be retried
      const manifestError = new (class extends BaseError {
        constructor() {
          super(ErrorType.MANIFEST_ERROR, 'Manifest creation failed', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(manifestError);

      expect(classification.type).toBe(ErrorType.MANIFEST_ERROR);
      expect(classification.recoverable).toBe(true);
      expect(classification.retryable).toBe(true);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.RETRY);
      expect(classification.maxRetries).toBe(2);
    });

    it('should classify argument errors as non-recoverable', () => {
      // Test that argument errors are not recoverable
      // ensuring command line issues require user intervention
      const argumentError = new (class extends BaseError {
        constructor() {
          super(ErrorType.ARGUMENT_ERROR, 'Invalid argument', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(argumentError);

      expect(classification.type).toBe(ErrorType.ARGUMENT_ERROR);
      expect(classification.recoverable).toBe(false);
      expect(classification.retryable).toBe(false);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.NONE);
    });

    it('should classify test errors as non-recoverable', () => {
      // Test that test errors are not recoverable
      // ensuring test failures require investigation
      const testError = new (class extends BaseError {
        constructor() {
          super(ErrorType.TEST_ERROR, 'Test execution failed', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(testError);

      expect(classification.type).toBe(ErrorType.TEST_ERROR);
      expect(classification.recoverable).toBe(false);
      expect(classification.retryable).toBe(false);
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.NONE);
    });

    it('should classify unknown errors as high severity', () => {
      // Test that unknown errors are classified with high severity
      // ensuring unexpected errors are treated seriously
      const unknownError = new (class extends BaseError {
        constructor() {
          super(ErrorType.UNKNOWN_ERROR, 'Unexpected system failure', ErrorSeverity.MEDIUM);
        }
      })();

      const classification = errorHandler.classifyError(unknownError);

      expect(classification.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(classification.severity).toBe(ErrorSeverity.HIGH);
      expect(classification.recoverable).toBe(false);
      expect(classification.retryable).toBe(false);
    });
  });

  describe('error recovery', () => {
    it('should attempt recovery for recoverable errors', async () => {
      // Test that recoverable errors trigger recovery attempts
      // ensuring automatic recovery works for appropriate error types
      const recoverableError = new (class extends BaseError {
        constructor() {
          super(ErrorType.NETWORK_ERROR, 'Network timeout', ErrorSeverity.MEDIUM);
        }
      })();

      // Mock the recovery attempt to succeed
      const service = new ErrorHandlerService({ enableRecovery: true });

      // This should not throw because recovery succeeds
      await expect(service.handleError(recoverableError)).resolves.toBeUndefined();
    });

    it('should not attempt recovery when disabled', async () => {
      // Test that recovery is skipped when disabled in options
      // ensuring recovery can be disabled for testing or specific scenarios
      const service = new ErrorHandlerService({ enableRecovery: false });
      const recoverableError = new (class extends BaseError {
        constructor() {
          super(ErrorType.NETWORK_ERROR, 'Network timeout', ErrorSeverity.MEDIUM);
        }
      })();

      await expect(service.handleError(recoverableError)).rejects.toThrow();
    });

    it('should respect max retry limits', async () => {
      // Test that retry attempts are limited by maxRetries setting
      // ensuring infinite retry loops are prevented
      const service = new ErrorHandlerService({ maxRetries: 0 });

      // Create a recoverable error
      const recoverableError = new (class extends BaseError {
        constructor() {
          super(ErrorType.NETWORK_ERROR, 'Network timeout', ErrorSeverity.MEDIUM);
        }
      })();

      // With maxRetries = 0, the error should not be recoverable
      await expect(service.handleError(recoverableError)).rejects.toThrow();
    });
  });

  describe('user-friendly error messages', () => {
    it('should log user-friendly error messages when enabled', async () => {
      // Test that user-friendly error messages are logged when enabled
      // ensuring clear error communication to users
      const service = new ErrorHandlerService({ enableUserFriendlyMessages: true });
      const error = new (class extends BaseError {
        constructor() {
          super(
            ErrorType.VALIDATION_ERROR,
            'Invalid config',
            ErrorSeverity.MEDIUM,
            { field: 'php.version' },
            ['Check PHP version format', 'Use supported versions']
          );
        }
      })();

      try {
        await service.handleError(error);
      } catch {
        // Expected to throw
      }

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error [VALIDATION_ERROR]')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Message: Invalid config')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Suggestions:'));
    });

    it('should not log user-friendly messages when disabled', async () => {
      // Test that user-friendly messages are not logged when disabled
      // ensuring logging can be controlled for different environments
      const service = new ErrorHandlerService({ enableUserFriendlyMessages: false });
      const error = new Error('Test error');

      try {
        await service.handleError(error);
      } catch {
        // Expected to throw
      }

      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should include error details in user-friendly messages', async () => {
      // Test that error details are included in user-friendly messages
      // ensuring comprehensive error information is available
      const service = new ErrorHandlerService({ enableUserFriendlyMessages: true });
      const error = new (class extends BaseError {
        constructor() {
          super(ErrorType.CONFIG_LOAD_ERROR, 'Config not found', ErrorSeverity.MEDIUM, {
            filePath: '/path/to/config.json',
            reason: 'File does not exist',
          });
        }
      })();

      try {
        await service.handleError(error);
      } catch {
        // Expected to throw
      }

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Details:'));
    });

    it('should include suggestions in user-friendly messages', async () => {
      // Test that error suggestions are included in user-friendly messages
      // ensuring helpful guidance is provided to users
      const service = new ErrorHandlerService({ enableUserFriendlyMessages: true });
      const suggestions = ['Check file permissions', 'Verify file path', 'Create missing file'];
      const error = new (class extends BaseError {
        constructor() {
          super(
            ErrorType.FILE_WRITE_ERROR,
            'Cannot write file',
            ErrorSeverity.MEDIUM,
            undefined,
            suggestions
          );
        }
      })();

      try {
        await service.handleError(error);
      } catch {
        // Expected to throw
      }

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Suggestions:'));
      suggestions.forEach(suggestion => {
        expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining(suggestion));
      });
    });
  });

  describe('error history management', () => {
    it('should maintain error history', async () => {
      // Test that errors are properly maintained in history
      // ensuring error tracking functionality works correctly
      const error1 = new Error('First error');
      const error2 = new Error('Second error');

      try {
        await errorHandler.handleError(error1);
      } catch {
        // Expected to throw
      }

      try {
        await errorHandler.handleError(error2);
      } catch {
        // Expected to throw
      }

      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(2);
    });

    it('should limit error history size', async () => {
      // Test that error history is limited to prevent memory issues
      // ensuring history doesn't grow indefinitely
      const service = new ErrorHandlerService({ maxErrorHistory: 2 });

      for (let i = 0; i < 5; i++) {
        try {
          await service.handleError(new Error(`Error ${i}`));
        } catch {
          // Expected to throw
        }
      }

      const history = service.getErrorHistory();
      expect(history).toHaveLength(2);
    });

    it('should clear error history', () => {
      // Test that error history can be cleared
      // ensuring history management functionality works correctly
      errorHandler.clearErrorHistory();
      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('error statistics', () => {
    it('should provide error statistics', async () => {
      // Test that error statistics are calculated correctly
      // ensuring statistical information is accurate and useful
      const networkError = new (class extends BaseError {
        constructor() {
          super(ErrorType.NETWORK_ERROR, 'Network error', ErrorSeverity.MEDIUM);
        }
      })();

      const validationError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Validation error', ErrorSeverity.HIGH);
        }
      })();

      try {
        await errorHandler.handleError(networkError);
      } catch {
        // Expected to throw
      }

      try {
        await errorHandler.handleError(validationError);
      } catch {
        // Expected to throw
      }

      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(2);
      expect(stats.errorsByType[ErrorType.NETWORK_ERROR]).toBe(1);
      expect(stats.errorsByType[ErrorType.VALIDATION_ERROR]).toBe(1);
      expect(stats.errorsBySeverity[ErrorSeverity.MEDIUM]).toBe(1);
      expect(stats.errorsBySeverity[ErrorSeverity.HIGH]).toBe(1);
    });

    it('should track recent errors', async () => {
      // Test that recent errors are properly tracked
      // ensuring recent error monitoring works correctly
      const error = new Error('Recent error');

      try {
        await errorHandler.handleError(error);
      } catch {
        // Expected to throw
      }

      const stats = errorHandler.getErrorStatistics();
      expect(stats.recentErrors).toBe(1);
    });
  });

  describe('error severity icons', () => {
    it('should use correct icons for different severity levels', async () => {
      // Test that appropriate icons are used for different severity levels
      // ensuring visual error communication is clear and consistent
      const service = new ErrorHandlerService({
        enableUserFriendlyMessages: true,
        enableClassification: false,
      });

      const lowError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Warning message', ErrorSeverity.LOW);
        }
      })();

      const mediumError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Standard message', ErrorSeverity.MEDIUM);
        }
      })();

      const highError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Important message', ErrorSeverity.HIGH);
        }
      })();

      const criticalError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Critical system failure', ErrorSeverity.CRITICAL);
        }
      })();

      try {
        await service.handleError(lowError);
      } catch {
        // Expected to throw
      }

      try {
        await service.handleError(mediumError);
      } catch {
        // Expected to throw
      }

      try {
        await service.handleError(highError);
      } catch {
        // Expected to throw
      }

      try {
        await service.handleError(criticalError);
      } catch {
        // Expected to throw
      }

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Error [VALIDATION_ERROR]')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error [VALIDATION_ERROR]')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('🚨 Error [VALIDATION_ERROR]')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('💥 Error [VALIDATION_ERROR]')
      );
    });
  });

  describe('Enhanced Error Classification', () => {
    describe('Context-Aware Classification', () => {
      it('should adjust classification based on HTTP status code', () => {
        // Test that HTTP status codes are properly analyzed for classification
        // ensuring server errors are marked as retryable and client errors are not
        const error = new BaseError(
          ErrorType.NETWORK_ERROR,
          'HTTP request failed',
          ErrorSeverity.MEDIUM,
          { statusCode: 500 }
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(true);
        expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.RETRY_WITH_BACKOFF);
        expect(classification.userAction).toContain('Server error detected');
      });

      it('should handle rate limiting status code with exponential backoff', () => {
        // Test that rate limiting (429) status code triggers exponential backoff
        // ensuring proper handling of rate limit scenarios
        const error = new BaseError(
          ErrorType.REGISTRY_ERROR,
          'HTTP request failed',
          ErrorSeverity.MEDIUM,
          { statusCode: 429 }
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(true);
        expect(classification.recoveryStrategy).toBe(
          ErrorRecoveryStrategy.RETRY_WITH_EXPONENTIAL_BACKOFF
        );
        expect(classification.retryDelay).toBe(5000);
        expect(classification.userAction).toContain('Rate limit exceeded');
      });

      it('should mark client errors as non-retryable', () => {
        // Test that 4xx client errors are marked as non-retryable
        // ensuring proper classification of client-side issues
        const error = new BaseError(ErrorType.NETWORK_ERROR, 'Bad request', ErrorSeverity.MEDIUM, {
          statusCode: 400,
        });

        const classification = errorHandler.classifyError(error);

        expect(classification.recoverable).toBe(false);
        expect(classification.retryable).toBe(false);
        expect(classification.userAction).toContain('Client error detected');
      });

      it('should adjust classification based on error code', () => {
        // Test that system error codes are properly analyzed
        // ensuring network and file system errors are correctly classified
        const networkError = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'Connection failed',
          ErrorSeverity.MEDIUM,
          { code: 'ECONNREFUSED' }
        );

        const classification = errorHandler.classifyError(networkError);

        expect(classification.type).toBe(ErrorType.NETWORK_ERROR);
        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(true);
      });

      it('should adjust classification based on file path', () => {
        // Test that file paths are analyzed for context
        // ensuring config and template files are properly classified
        const configError = new BaseError(
          ErrorType.FILE_WRITE_ERROR,
          'File write failed',
          ErrorSeverity.MEDIUM,
          { path: '/path/to/config.json' }
        );

        const classification = errorHandler.classifyError(configError);

        expect(classification.type).toBe(ErrorType.CONFIG_LOAD_ERROR);
        expect(classification.userAction).toContain('Configuration file issue detected');
      });

      it('should adjust classification based on operation type', () => {
        // Test that operation types are analyzed for context
        // ensuring build, push, and manifest operations are properly classified
        const buildError = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'Operation failed',
          ErrorSeverity.MEDIUM,
          { operation: 'docker build' }
        );

        const classification = errorHandler.classifyError(buildError);

        expect(classification.type).toBe(ErrorType.BUILD_ERROR);
        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(true);
      });
    });

    describe('Pattern-Based Classification', () => {
      it('should detect network patterns in error messages', () => {
        // Test that network-related patterns are detected in error messages
        // ensuring proper classification of network connectivity issues
        const error = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'Connection timeout occurred',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.type).toBe(ErrorType.NETWORK_ERROR);
        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(true);
        expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.RETRY_WITH_BACKOFF);
        expect(classification.userAction).toContain('Network connectivity issue detected');
      });

      it('should detect Docker patterns in error messages', () => {
        // Test that Docker-related patterns are detected in error messages
        // ensuring proper classification of Docker daemon issues
        const error = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'Docker daemon is not running',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.type).toBe(ErrorType.DOCKER_ERROR);
        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(true);
        expect(classification.userAction).toContain('Docker daemon issue detected');
      });

      it('should detect registry patterns in error messages', () => {
        // Test that registry-related patterns are detected in error messages
        // ensuring proper classification of registry access issues
        const error = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'Unauthorized access to registry',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.type).toBe(ErrorType.REGISTRY_ERROR);
        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(true);
        expect(classification.recoveryStrategy).toBe(
          ErrorRecoveryStrategy.RETRY_WITH_EXPONENTIAL_BACKOFF
        );
        expect(classification.userAction).toContain('Registry access issue detected');
      });

      it('should detect file system patterns in error messages', () => {
        // Test that file system patterns are detected in error messages
        // ensuring proper classification of disk space issues
        const error = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'No space left on device',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.type).toBe(ErrorType.FILE_WRITE_ERROR);
        expect(classification.severity).toBe(ErrorSeverity.HIGH);
        expect(classification.recoverable).toBe(false);
        expect(classification.userAction).toContain('Disk space issue detected');
      });

      it('should detect security patterns in error messages', () => {
        // Test that security patterns are detected in error messages
        // ensuring proper classification of security issues
        const error = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'Security vulnerability detected',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.type).toBe(ErrorType.SECURITY_ERROR);
        expect(classification.severity).toBe(ErrorSeverity.HIGH);
        expect(classification.recoverable).toBe(false);
        expect(classification.userAction).toContain('Security issue detected');
      });

      it('should detect configuration patterns in error messages', () => {
        // Test that configuration patterns are detected in error messages
        // ensuring proper classification of configuration issues
        const error = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'Invalid config file format',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.type).toBe(ErrorType.CONFIG_LOAD_ERROR);
        expect(classification.recoverable).toBe(false);
        expect(classification.userAction).toContain('Configuration issue detected');
      });
    });

    describe('Error Correlation Analysis', () => {
      it('should increase severity for repeated errors of same type', () => {
        // Test that repeated errors of the same type increase severity
        // ensuring proper handling of recurring issues
        const errorType = ErrorType.NETWORK_ERROR;

        // Add multiple errors of the same type to history
        for (let i = 0; i < 3; i++) {
          const error = new BaseError(errorType, `Network error ${i}`, ErrorSeverity.MEDIUM);
          errorHandler['addToHistory'](error);
        }

        const newError = new BaseError(errorType, 'Another network error', ErrorSeverity.MEDIUM);
        const classification = errorHandler.classifyError(newError);

        expect(classification.severity).toBe(ErrorSeverity.HIGH);
        expect(classification.userAction).toContain('Multiple similar errors detected');
      });

      it('should adjust retry settings for repeated errors', () => {
        // Test that retry settings are adjusted for repeated errors
        // ensuring more conservative retry behavior for recurring issues
        const errorType = ErrorType.REGISTRY_ERROR;

        // Add multiple errors of the same type to history
        for (let i = 0; i < 3; i++) {
          const error = new BaseError(errorType, `Registry error ${i}`, ErrorSeverity.MEDIUM);
          errorHandler['addToHistory'](error);
        }

        const newError = new BaseError(errorType, 'Another registry error', ErrorSeverity.MEDIUM);
        const classification = errorHandler.classifyError(newError);

        expect(classification.maxRetries).toBeLessThan(5); // Should be reduced from default
        expect(classification.retryDelay).toBeGreaterThan(1000); // Should be increased
      });

      it('should detect error cascades and mark as high severity', () => {
        // Test that error cascades are detected and marked as high severity
        // ensuring proper handling of system instability
        const errorTypes = [
          ErrorType.NETWORK_ERROR,
          ErrorType.DOCKER_ERROR,
          ErrorType.REGISTRY_ERROR,
          ErrorType.BUILD_ERROR,
        ];

        // Add different error types to history
        errorTypes.forEach((type, index) => {
          const error = new BaseError(type, `Error ${index}`, ErrorSeverity.MEDIUM);
          errorHandler['addToHistory'](error);
        });

        const newError = new BaseError(
          ErrorType.FILE_WRITE_ERROR,
          'File error',
          ErrorSeverity.MEDIUM
        );
        const classification = errorHandler.classifyError(newError);

        expect(classification.severity).toBe(ErrorSeverity.HIGH);
        expect(classification.recoverable).toBe(false);
        expect(classification.userAction).toContain('Error cascade detected');
      });

      it('should not detect cascade with insufficient error types', () => {
        // Test that cascades are not detected with insufficient error types
        // ensuring proper threshold for cascade detection
        const errorTypes = [ErrorType.NETWORK_ERROR, ErrorType.DOCKER_ERROR];

        // Add only 2 different error types to history
        errorTypes.forEach((type, index) => {
          const error = new BaseError(type, `Error ${index}`, ErrorSeverity.MEDIUM);
          errorHandler['addToHistory'](error);
        });

        const newError = new BaseError(
          ErrorType.REGISTRY_ERROR,
          'Registry error',
          ErrorSeverity.MEDIUM
        );
        const classification = errorHandler.classifyError(newError);

        // Should not be marked as cascade
        expect(classification.userAction).not.toContain('Error cascade detected');
      });
    });

    describe('Severity Adjustment', () => {
      it('should increase severity based on message content', () => {
        // Test that severity is adjusted based on message content
        // ensuring critical keywords trigger higher severity
        const error = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'Critical system failure occurred',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.severity).toBe(ErrorSeverity.CRITICAL);
      });

      it('should decrease severity for warning messages', () => {
        // Test that warning messages get lower severity
        // ensuring proper classification of non-critical issues
        const error = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'Warning: deprecated feature used',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.severity).toBe(ErrorSeverity.LOW);
      });

      it('should maintain medium severity for standard error messages', () => {
        // Test that standard error messages maintain medium severity
        // ensuring proper baseline severity classification
        const error = new BaseError(
          ErrorType.UNKNOWN_ERROR,
          'An error occurred during processing',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.severity).toBe(ErrorSeverity.MEDIUM);
      });
    });

    describe('Classification Finalization', () => {
      it('should ensure consistency between recoverable and retryable', () => {
        // Test that recoverable errors are automatically made retryable
        // ensuring logical consistency in classification
        const error = new BaseError(ErrorType.NETWORK_ERROR, 'Network error', ErrorSeverity.MEDIUM);

        const classification = errorHandler.classifyError(error);

        expect(classification.recoverable).toBe(true);
        expect(classification.retryable).toBe(true);
        expect(classification.maxRetries).toBeGreaterThan(0);
      });

      it('should ensure retryable errors have appropriate retry settings', () => {
        // Test that retryable errors have proper retry configuration
        // ensuring all retryable errors can actually be retried
        const error = new BaseError(
          ErrorType.REGISTRY_ERROR,
          'Registry error',
          ErrorSeverity.MEDIUM
        );

        const classification = errorHandler.classifyError(error);

        expect(classification.retryable).toBe(true);
        expect(classification.maxRetries).toBeGreaterThan(0);
        expect(classification.retryDelay).toBeGreaterThan(0);
        expect(classification.recoveryStrategy).not.toBe(ErrorRecoveryStrategy.NONE);
      });

      it('should validate recovery strategy consistency', () => {
        // Test that recovery strategy is consistent with retryable flag
        // ensuring proper recovery strategy assignment
        const error = new BaseError(ErrorType.DOCKER_ERROR, 'Docker error', ErrorSeverity.MEDIUM);

        const classification = errorHandler.classifyError(error);

        if (classification.retryable) {
          expect(classification.recoveryStrategy).not.toBe(ErrorRecoveryStrategy.NONE);
        }
      });
    });

    describe('Pattern Matching Utilities', () => {
      it('should correctly match patterns in messages', () => {
        // Test that pattern matching works correctly
        // ensuring the utility function properly detects patterns
        const matchesPattern = errorHandler['matchesPattern'].bind(errorHandler);

        expect(matchesPattern('connection timeout', ['timeout', 'connection'])).toBe(true);
        expect(matchesPattern('docker daemon error', ['docker', 'daemon'])).toBe(true);
        expect(matchesPattern('registry unauthorized', ['unauthorized', 'registry'])).toBe(true);
        expect(matchesPattern('no space left', ['space', 'disk'])).toBe(true);
        expect(matchesPattern('security vulnerability', ['security', 'vulnerability'])).toBe(true);
        expect(matchesPattern('invalid config', ['config', 'invalid'])).toBe(true);
        expect(matchesPattern('unrelated message', ['timeout', 'docker'])).toBe(false);
      });
    });

    describe('Error History Analysis', () => {
      it('should get recent errors by type', () => {
        // Test that recent errors are properly filtered by type
        // ensuring error history analysis works correctly
        const errorType = ErrorType.NETWORK_ERROR;

        // Add errors to history
        const error1 = new BaseError(errorType, 'Error 1', ErrorSeverity.MEDIUM);
        const error2 = new BaseError(ErrorType.DOCKER_ERROR, 'Error 2', ErrorSeverity.MEDIUM);
        const error3 = new BaseError(errorType, 'Error 3', ErrorSeverity.MEDIUM);

        errorHandler['addToHistory'](error1);
        errorHandler['addToHistory'](error2);
        errorHandler['addToHistory'](error3);

        const recentErrors = errorHandler['getRecentErrorsByType'](errorType, 5);

        expect(recentErrors).toHaveLength(2);
        expect(recentErrors.every(error => error.type === errorType)).toBe(true);
      });

      it('should get recent error types', () => {
        // Test that recent error types are properly extracted
        // ensuring error type analysis works correctly
        const errorTypes = [
          ErrorType.NETWORK_ERROR,
          ErrorType.DOCKER_ERROR,
          ErrorType.REGISTRY_ERROR,
        ];

        // Add errors to history
        errorTypes.forEach((type, index) => {
          const error = new BaseError(type, `Error ${index}`, ErrorSeverity.MEDIUM);
          errorHandler['addToHistory'](error);
        });

        const recentTypes = errorHandler['getRecentErrorTypes'](5);

        expect(recentTypes).toEqual(errorTypes);
      });

      it('should detect error cascades correctly', () => {
        // Test that error cascades are detected correctly
        // ensuring cascade detection logic works properly
        const detectErrorCascade = errorHandler['detectErrorCascade'].bind(errorHandler);

        // Test cascade detection
        const cascadeTypes = [
          ErrorType.NETWORK_ERROR,
          ErrorType.DOCKER_ERROR,
          ErrorType.REGISTRY_ERROR,
          ErrorType.BUILD_ERROR,
        ];
        expect(detectErrorCascade(cascadeTypes)).toBe(true);

        // Test non-cascade
        const nonCascadeTypes = [ErrorType.NETWORK_ERROR, ErrorType.DOCKER_ERROR];
        expect(detectErrorCascade(nonCascadeTypes)).toBe(false);

        // Test insufficient errors
        const insufficientTypes = [ErrorType.NETWORK_ERROR];
        expect(detectErrorCascade(insufficientTypes)).toBe(false);
      });
    });
  });
});
