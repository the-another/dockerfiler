/**
 * Logger Service Unit Tests
 *
 * This module contains comprehensive unit tests for the structured logging system
 * using Pino for high-performance, structured logging.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, createLogger } from '@/services/logger';
import type {
  LoggerConfig,
  LogContext,
  PerformanceMetrics,
  SecurityEvent,
} from '@/types/services/logger';

// Mock Pino to avoid actual logging during tests
vi.mock('pino', () => {
  const mockLogger = {
    fatal: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    child: vi.fn(),
    level: 'info',
  };

  return {
    default: vi.fn(() => mockLogger),
    stdTimeFunctions: {
      isoTime: vi.fn(() => () => new Date().toISOString()),
    },
    stdSerializers: {
      err: vi.fn(err => ({
        name: err.name,
        message: err.message,
        stack: err.stack,
      })),
      req: vi.fn(),
      res: vi.fn(),
    },
    multistream: vi.fn(),
  };
});

// Mock fs module
vi.mock('fs', () => ({
  createWriteStream: vi.fn(() => ({
    write: vi.fn(),
    end: vi.fn(),
  })),
}));

describe('Logger', () => {
  let logger: Logger;
  let mockPinoLogger: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a fresh logger instance
    logger = new Logger();
    mockPinoLogger = (logger as any).logger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default configuration', () => {
      // Test that logger is created with default configuration
      const config = logger.getConfig();
      expect(config.level).toBe('info');
      expect(config.destination).toBe('console');
      expect(config.format).toBe('pretty');
      expect(config.enablePerformanceMonitoring).toBe(true);
      expect(config.enableSecurityLogging).toBe(true);
      expect(config.enableRequestLogging).toBe(false);
      expect(config.enableRotation).toBe(true);
    });

    it('should create logger with custom configuration', () => {
      // Test logger creation with custom configuration
      const customConfig: Partial<LoggerConfig> = {
        level: 'debug',
        destination: 'file',
        filePath: '/tmp/test.log',
        enablePerformanceMonitoring: false,
      };

      const customLogger = new Logger(customConfig);
      const config = customLogger.getConfig();

      expect(config.level).toBe('debug');
      expect(config.destination).toBe('file');
      expect(config.filePath).toBe('/tmp/test.log');
      expect(config.enablePerformanceMonitoring).toBe(false);
    });

    it('should throw error when file destination is used without filePath', () => {
      // Test that error is thrown when file destination is used without filePath
      const invalidConfig: Partial<LoggerConfig> = {
        destination: 'file',
        // filePath is missing
      };

      expect(() => new Logger(invalidConfig)).toThrow(
        'File path is required when using file logging'
      );
    });
  });

  describe('log methods', () => {
    const testContext: LogContext = {
      service: 'test-service',
      operation: 'test-operation',
      requestId: 'test-request-123',
      userId: 'test-user',
      version: '1.0.0',
      environment: 'test',
      metadata: { testKey: 'testValue' },
    };

    it('should log fatal messages with context', () => {
      // Test fatal logging with context
      const testError = new Error('Test fatal error');
      logger.fatal('Test fatal message', testContext, testError);

      expect(mockPinoLogger.fatal).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          requestId: 'test-request-123',
          userId: 'test-user',
          version: '1.0.0',
          environment: 'test',
          testKey: 'testValue',
          error: {
            name: 'Error',
            message: 'Test fatal error',
            stack: expect.any(String),
          },
        }),
        'Test fatal message'
      );
    });

    it('should log error messages with context', () => {
      // Test error logging with context
      const testError = new Error('Test error');
      logger.error('Test error message', testContext, testError);

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          requestId: 'test-request-123',
          userId: 'test-user',
          version: '1.0.0',
          environment: 'test',
          testKey: 'testValue',
          error: {
            name: 'Error',
            message: 'Test error',
            stack: expect.any(String),
          },
        }),
        'Test error message'
      );
    });

    it('should log warning messages with context', () => {
      // Test warning logging with context
      logger.warn('Test warning message', testContext);

      expect(mockPinoLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          requestId: 'test-request-123',
          userId: 'test-user',
          version: '1.0.0',
          environment: 'test',
          testKey: 'testValue',
        }),
        'Test warning message'
      );
    });

    it('should log info messages with context', () => {
      // Test info logging with context
      logger.info('Test info message', testContext);

      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          requestId: 'test-request-123',
          userId: 'test-user',
          version: '1.0.0',
          environment: 'test',
          testKey: 'testValue',
        }),
        'Test info message'
      );
    });

    it('should log debug messages with context', () => {
      // Test debug logging with context
      logger.debug('Test debug message', testContext);

      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          requestId: 'test-request-123',
          userId: 'test-user',
          version: '1.0.0',
          environment: 'test',
          testKey: 'testValue',
        }),
        'Test debug message'
      );
    });

    it('should log trace messages with context', () => {
      // Test trace logging with context
      logger.trace('Test trace message', testContext);

      expect(mockPinoLogger.trace).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          requestId: 'test-request-123',
          userId: 'test-user',
          version: '1.0.0',
          environment: 'test',
          testKey: 'testValue',
        }),
        'Test trace message'
      );
    });

    it('should log messages without context', () => {
      // Test logging without context
      logger.info('Test message without context');

      expect(mockPinoLogger.info).toHaveBeenCalledWith({}, 'Test message without context');
    });

    it('should log messages without error object', () => {
      // Test error logging without error object
      logger.error('Test error message', testContext);

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          requestId: 'test-request-123',
          userId: 'test-user',
          version: '1.0.0',
          environment: 'test',
          testKey: 'testValue',
          error: undefined,
        }),
        'Test error message'
      );
    });
  });

  describe('performance logging', () => {
    it('should log performance metrics when enabled', () => {
      // Test performance logging when enabled
      const metrics: PerformanceMetrics = {
        operation: 'test-operation',
        duration: 150,
        memoryUsage: {
          rss: 1000000,
          heapTotal: 500000,
          heapUsed: 300000,
          external: 200000,
          arrayBuffers: 100000,
        },
        cpuUsage: {
          user: 1000000,
          system: 500000,
        },
        timestamp: Date.now(),
        metadata: { testKey: 'testValue' },
      };

      logger.performance(metrics);

      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'performance',
          operation: 'test-operation',
          duration: 150,
          memoryUsage: metrics.memoryUsage,
          cpuUsage: metrics.cpuUsage,
          metadata: { testKey: 'testValue' },
        }),
        'Performance: test-operation completed in 150ms'
      );
    });

    it('should not log performance metrics when disabled', () => {
      // Test that performance logging is skipped when disabled
      const disabledLogger = new Logger({ enablePerformanceMonitoring: false });
      const metrics: PerformanceMetrics = {
        operation: 'test-operation',
        duration: 150,
        timestamp: Date.now(),
      };

      disabledLogger.performance(metrics);

      expect(mockPinoLogger.info).not.toHaveBeenCalled();
    });
  });

  describe('security logging', () => {
    it('should log security events when enabled', () => {
      // Test security event logging when enabled
      const securityEvent: SecurityEvent = {
        type: 'authentication',
        severity: 'high',
        userId: 'test-user',
        resource: '/api/sensitive',
        action: 'login',
        result: 'failure',
        metadata: { ipAddress: '192.168.1.1' },
      };

      logger.security(securityEvent);

      expect(mockPinoLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'security',
          eventType: 'authentication',
          severity: 'high',
          userId: 'test-user',
          resource: '/api/sensitive',
          action: 'login',
          result: 'failure',
          metadata: { ipAddress: '192.168.1.1' },
        }),
        'Security Event: authentication - failure'
      );
    });

    it('should not log security events when disabled', () => {
      // Test that security logging is skipped when disabled
      const disabledLogger = new Logger({ enableSecurityLogging: false });
      const securityEvent: SecurityEvent = {
        type: 'authentication',
        severity: 'high',
        result: 'failure',
      };

      disabledLogger.security(securityEvent);

      expect(mockPinoLogger.warn).not.toHaveBeenCalled();
    });
  });

  describe('child logger', () => {
    it('should create child logger with additional context', () => {
      // Test child logger creation with additional context
      const childContext: LogContext = {
        service: 'child-service',
        operation: 'child-operation',
        requestId: 'child-request-456',
      };

      const childLogger = logger.child(childContext);
      expect(childLogger).toBeDefined();
      expect(mockPinoLogger.child).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'child-service',
          operation: 'child-operation',
          requestId: 'child-request-456',
        })
      );
    });

    it('should allow child logger to log with inherited context', () => {
      // Test that child logger inherits context and can log
      const childContext: LogContext = {
        service: 'child-service',
        operation: 'child-operation',
      };

      const mockChildLogger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        fatal: vi.fn(),
        child: vi.fn(),
        level: 'info',
      };

      mockPinoLogger.child.mockReturnValue(mockChildLogger);

      const childLogger = logger.child(childContext);
      childLogger.info('Child logger message');

      expect(mockChildLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'child-service',
          operation: 'child-operation',
        }),
        'Child logger message'
      );
    });
  });

  describe('performance timer', () => {
    it('should create and use performance timer', () => {
      // Test performance timer creation and usage
      const timer = logger.startTimer('test-operation', {
        service: 'test-service',
        operation: 'test-operation',
      });

      expect(timer).toBeDefined();
      expect(typeof timer.getDuration).toBe('function');
      expect(typeof timer.end).toBe('function');

      // Test getting duration
      const duration = timer.getDuration();
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);

      // Test ending timer
      const metrics = timer.end({ testKey: 'testValue' });
      expect(metrics.operation).toBe('test-operation');
      expect(metrics.duration).toBeGreaterThanOrEqual(0);
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.metadata).toEqual(
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          testKey: 'testValue',
        })
      );
    });
  });

  describe('log level management', () => {
    it('should set and get log level', () => {
      // Test log level setting and getting
      logger.setLevel('debug');
      expect(mockPinoLogger.level).toBe('debug');

      logger.setLevel('error');
      expect(mockPinoLogger.level).toBe('error');
    });
  });

  describe('configuration management', () => {
    it('should return current configuration', () => {
      // Test configuration retrieval
      const config = logger.getConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
      expect(config.level).toBeDefined();
      expect(config.destination).toBeDefined();
      expect(config.format).toBeDefined();
      expect(config.enablePerformanceMonitoring).toBeDefined();
      expect(config.enableSecurityLogging).toBeDefined();
    });

    it('should return immutable configuration', () => {
      // Test that configuration is immutable
      const config = logger.getConfig();
      const originalLevel = config.level;

      // Attempt to modify configuration
      (config as any).level = 'debug';

      // Verify original configuration is unchanged
      expect(logger.getConfig().level).toBe(originalLevel);
    });
  });

  describe('createLogger function', () => {
    it('should create logger with custom configuration', () => {
      // Test createLogger function with custom configuration
      const customConfig: Partial<LoggerConfig> = {
        level: 'warn',
        destination: 'console',
        enablePerformanceMonitoring: false,
      };

      const customLogger = createLogger(customConfig);
      expect(customLogger).toBeDefined();
      expect(customLogger.getConfig().level).toBe('warn');
      expect(customLogger.getConfig().enablePerformanceMonitoring).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects in error logging', () => {
      // Test error logging with non-Error objects
      const nonError = 'String error';
      logger.error('Test error message', undefined, nonError as any);

      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            name: 'Error',
            message: 'String error',
            stack: expect.any(String),
          }),
        }),
        'Test error message'
      );
    });

    it('should handle undefined context gracefully', () => {
      // Test logging with undefined context
      logger.info('Test message', undefined);

      expect(mockPinoLogger.info).toHaveBeenCalledWith({}, 'Test message');
    });
  });

  describe('context building', () => {
    it('should build context correctly with all fields', () => {
      // Test context building with all fields
      const fullContext: LogContext = {
        service: 'test-service',
        operation: 'test-operation',
        requestId: 'test-request-123',
        userId: 'test-user',
        version: '1.0.0',
        environment: 'test',
        metadata: {
          key1: 'value1',
          key2: 'value2',
        },
      };

      logger.info('Test message', fullContext);

      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          requestId: 'test-request-123',
          userId: 'test-user',
          version: '1.0.0',
          environment: 'test',
          key1: 'value1',
          key2: 'value2',
        }),
        'Test message'
      );
    });

    it('should build context correctly with minimal fields', () => {
      // Test context building with minimal fields
      const minimalContext: LogContext = {
        service: 'test-service',
      };

      logger.info('Test message', minimalContext);

      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
        }),
        'Test message'
      );
    });
  });
});
