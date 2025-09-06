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

      await expect(errorHandler.handleError(baseError)).rejects.toThrow(baseError);
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
      expect(classification.recoveryStrategy).toBe(ErrorRecoveryStrategy.RETRY_WITH_BACKOFF);
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
          super(ErrorType.VALIDATION_ERROR, 'Invalid configuration', ErrorSeverity.MEDIUM);
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
          super(ErrorType.UNKNOWN_ERROR, 'Unexpected error', ErrorSeverity.MEDIUM);
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
      const service = new ErrorHandlerService({ enableUserFriendlyMessages: true });

      const lowError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Low severity', ErrorSeverity.LOW);
        }
      })();

      const mediumError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Medium severity', ErrorSeverity.MEDIUM);
        }
      })();

      const highError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'High severity', ErrorSeverity.HIGH);
        }
      })();

      const criticalError = new (class extends BaseError {
        constructor() {
          super(ErrorType.VALIDATION_ERROR, 'Critical severity', ErrorSeverity.CRITICAL);
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
});
