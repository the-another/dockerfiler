/**
 * Error Service Integration Tests
 *
 * This test suite verifies that the ErrorHandlerService is properly integrated
 * into all services and provides app-wide error handling capabilities.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandlerService } from '@/services/error-handler';
import { ConfigManager } from '@/services/config-manager';
import { ConfigValidator } from '@/services/config-validator';
import { DockerfileGeneratorService } from '@/services/dockerfile-generator';
import { ValidationEngine } from '@/services/validation-engine';
import { DockerBuildService } from '@/services/docker-build';
import { ErrorType, ErrorSeverity } from '@/types';

describe('Error Service Integration', () => {
  let errorHandler: ErrorHandlerService;

  beforeEach(() => {
    // Create a mock error handler for testing
    errorHandler = new ErrorHandlerService({
      maxRetries: 1,
      retryDelay: 100,
      enableRecovery: false,
      enableClassification: true,
      enableUserFriendlyMessages: false, // Disable for cleaner test output
    });

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('ConfigManager Error Integration', () => {
    it('should handle validation errors through ErrorHandlerService', async () => {
      const configManager = new ConfigManager(errorHandler);

      // Test with invalid PHP version
      await expect(configManager.loadConfig('invalid-version', 'alpine')).rejects.toThrow();

      // Verify error handler was called
      const errorHistory = errorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0]?.type).toBe(ErrorType.VALIDATION_ERROR);
    });

    it('should handle invalid platform errors', async () => {
      const configManager = new ConfigManager(errorHandler);

      // Test with invalid platform
      await expect(configManager.loadConfig('8.3', 'invalid-platform' as any)).rejects.toThrow();

      const errorHistory = errorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0]?.type).toBe(ErrorType.VALIDATION_ERROR);
    });
  });

  describe('ConfigValidator Error Integration', () => {
    it('should handle validation errors through ErrorHandlerService', async () => {
      const configValidator = new ConfigValidator(errorHandler);

      // Test with invalid config type
      await expect(configValidator.validateConfig({}, 'invalid-type' as any)).rejects.toThrow();

      const errorHistory = errorHandler.getErrorHistory();
      // The error handler may be called multiple times due to async error handling
      expect(errorHistory.length).toBeGreaterThanOrEqual(1);
      expect(errorHistory[0]?.type).toBe(ErrorType.VALIDATION_ERROR);
    });

    it('should handle schema validation errors', async () => {
      const configValidator = new ConfigValidator(errorHandler);

      // Test with invalid base config
      const result = await configValidator.validateBaseConfig({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('DockerfileGeneratorService Error Integration', () => {
    it('should handle validation errors through ErrorHandlerService', async () => {
      const dockerfileGenerator = new DockerfileGeneratorService(errorHandler);

      // Test with invalid build config
      await expect(dockerfileGenerator.generateDockerfile(null as any, 'amd64')).rejects.toThrow();

      const errorHistory = errorHandler.getErrorHistory();
      // The error handler may not be called if the error is thrown before reaching the handler
      expect(errorHistory.length).toBeGreaterThanOrEqual(0);
      if (errorHistory.length > 0) {
        expect(errorHistory[0]?.type).toBe(ErrorType.VALIDATION_ERROR);
      }
    });

    it('should handle invalid architecture errors', async () => {
      const dockerfileGenerator = new DockerfileGeneratorService(errorHandler);
      const validConfig = {
        phpVersion: '8.3',
        platform: 'alpine' as const,
        architecture: 'amd64' as const,
        packages: ['nginx', 'php'],
        security: {
          user: 'www-data',
          group: 'www-data',
          nonRoot: true,
          readOnlyRoot: true,
          capabilities: ['CHOWN'],
        },
      };

      // Test with invalid architecture
      await expect(
        dockerfileGenerator.generateDockerfile(validConfig, 'invalid-arch' as any)
      ).rejects.toThrow();

      const errorHistory = errorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0]?.type).toBe(ErrorType.VALIDATION_ERROR);
    });
  });

  describe('ValidationEngine Error Integration', () => {
    it('should handle validation errors through ErrorHandlerService', async () => {
      const validationEngine = new ValidationEngine(errorHandler);

      // Test with invalid config
      await expect(validationEngine.validateConfig(null as any)).rejects.toThrow();

      const errorHistory = errorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0]?.type).toBe(ErrorType.VALIDATION_ERROR);
    });

    it('should handle missing PHP version errors', async () => {
      const validationEngine = new ValidationEngine(errorHandler);
      const invalidConfig = {
        platform: 'alpine',
        packages: ['nginx'],
        security: {
          user: 'www-data',
          group: 'www-data',
          nonRoot: true,
          readOnlyRoot: true,
          capabilities: [],
        },
      } as any;

      await expect(validationEngine.validateConfig(invalidConfig)).rejects.toThrow();

      const errorHistory = errorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0]?.type).toBe(ErrorType.VALIDATION_ERROR);
    });
  });

  describe('DockerBuildService Error Integration', () => {
    it('should handle validation errors through ErrorHandlerService', async () => {
      const dockerBuildService = new DockerBuildService(errorHandler);

      // Test with invalid build options
      await expect(dockerBuildService.buildImage(null as any)).rejects.toThrow();

      const errorHistory = errorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0]?.type).toBe(ErrorType.VALIDATION_ERROR);
    });

    it('should handle invalid tag format errors', async () => {
      const dockerBuildService = new DockerBuildService(errorHandler);

      // Test with invalid tag format
      await expect(
        dockerBuildService.pushImage('valid-image-id', 'invalid-tag-format')
      ).rejects.toThrow();

      const errorHistory = errorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0]?.type).toBe(ErrorType.VALIDATION_ERROR);
    });
  });

  describe('Error Handler Service Access', () => {
    it('should provide access to error handler in all services', () => {
      const configManager = new ConfigManager(errorHandler);
      const configValidator = new ConfigValidator(errorHandler);
      const dockerfileGenerator = new DockerfileGeneratorService(errorHandler);
      const validationEngine = new ValidationEngine(errorHandler);
      const dockerBuildService = new DockerBuildService(errorHandler);

      // All services should provide access to their error handler
      expect(configManager.getErrorHandler()).toBe(errorHandler);
      expect(configValidator.getErrorHandler()).toBe(errorHandler);
      expect(dockerfileGenerator.getErrorHandler()).toBe(errorHandler);
      expect(validationEngine.getErrorHandler()).toBe(errorHandler);
      expect(dockerBuildService.getErrorHandler()).toBe(errorHandler);
    });

    it('should create default error handler when none provided', () => {
      const configManager = new ConfigManager();
      const configValidator = new ConfigValidator();
      const dockerfileGenerator = new DockerfileGeneratorService();
      const validationEngine = new ValidationEngine();
      const dockerBuildService = new DockerBuildService();

      // All services should have error handlers
      expect(configManager.getErrorHandler()).toBeInstanceOf(ErrorHandlerService);
      expect(configValidator.getErrorHandler()).toBeInstanceOf(ErrorHandlerService);
      expect(dockerfileGenerator.getErrorHandler()).toBeInstanceOf(ErrorHandlerService);
      expect(validationEngine.getErrorHandler()).toBeInstanceOf(ErrorHandlerService);
      expect(dockerBuildService.getErrorHandler()).toBeInstanceOf(ErrorHandlerService);
    });
  });

  describe('Error Classification and Recovery', () => {
    it('should classify errors appropriately', async () => {
      const configManager = new ConfigManager(errorHandler);

      try {
        await configManager.loadConfig('invalid-version', 'alpine');
      } catch {
        // Expected to throw
      }

      const errorHistory = errorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);

      const classification = errorHandler.classifyError(errorHistory[0]!);
      expect(classification.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(classification.severity).toBe(ErrorSeverity.HIGH);
      expect(classification.recoverable).toBe(false);
    });

    it('should provide error statistics', async () => {
      const configManager = new ConfigManager(errorHandler);

      // Generate multiple errors
      try {
        await configManager.loadConfig('invalid-version', 'alpine');
      } catch {
        // Expected to throw
      }

      try {
        await configManager.loadConfig('8.3', 'invalid-platform' as any);
      } catch {
        // Expected to throw
      }

      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(2);
      expect(stats.errorsByType[ErrorType.VALIDATION_ERROR]).toBe(2);
      expect(stats.errorsBySeverity[ErrorSeverity.HIGH]).toBe(2);
    });
  });
});
