/**
 * Logger Service
 *
 * This module implements a structured logging system using Pino for high-performance,
 * structured logging with support for performance monitoring, security events, and
 * comprehensive log management.
 */

import pino, { type Logger as PinoLogger, type LoggerOptions } from 'pino';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import type {
  LoggerService,
  LoggerConfig,
  LogLevel,
  LogContext,
  PerformanceMetrics,
  SecurityEvent,
  PerformanceTimer,
} from '@/types/services/logger';

/**
 * Performance timer implementation
 */
class PerformanceTimerImpl implements PerformanceTimer {
  private readonly startTime: number;
  private readonly startCpuUsage: NodeJS.CpuUsage;
  private readonly operation: string;
  private readonly context?: LogContext | undefined;

  constructor(operation: string, context?: LogContext) {
    this.startTime = Date.now();
    this.startCpuUsage = process.cpuUsage();
    this.operation = operation;
    this.context = context;
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  end(metadata?: Record<string, unknown>): PerformanceMetrics {
    const duration = this.getDuration();
    const cpuUsage = process.cpuUsage(this.startCpuUsage);
    const memoryUsage = process.memoryUsage();

    const metrics: PerformanceMetrics = {
      operation: this.operation,
      duration,
      memoryUsage,
      cpuUsage,
      timestamp: Date.now(),
      metadata: {
        service: this.context?.service,
        operation: this.context?.operation,
        ...this.context?.metadata,
        ...metadata,
      },
    };

    return metrics;
  }
}

/**
 * Logger service implementation using Pino
 */
export class Logger implements LoggerService {
  public readonly logger: PinoLogger;
  private readonly config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...this.getDefaultConfig(), ...config };
    this.logger = this.createPinoLogger();
  }

  /**
   * Get default logger configuration
   */
  private getDefaultConfig(): LoggerConfig {
    return {
      level: 'info',
      destination: 'console',
      format: 'pretty',
      enablePerformanceMonitoring: true,
      enableSecurityLogging: true,
      enableRequestLogging: false,
      enableRotation: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    };
  }

  /**
   * Create the underlying Pino logger instance
   */
  private createPinoLogger(): PinoLogger {
    const options: LoggerOptions = {
      level: this.config.level,
      timestamp: pino.stdTimeFunctions?.isoTime || (() => () => new Date().toISOString()),
      formatters: {
        level: label => ({ level: label }),
        log: object => {
          // Add service context to all logs
          return {
            ...object,
            service: 'dockerfile-generator-cli',
            version: process.env.npm_package_version || '0.1.0',
            environment: process.env.NODE_ENV || 'development',
          };
        },
      },
      serializers: {
        ...this.config.serializers,
        error:
          pino.stdSerializers?.err ||
          ((err: Error) => ({
            name: err.name,
            message: err.message,
            stack: err.stack,
          })),
        req: pino.stdSerializers?.req || ((req: unknown) => req),
        res: pino.stdSerializers?.res || ((res: unknown) => res),
      },
    };

    // Configure output destination
    if (this.config.destination === 'file' || this.config.destination === 'both') {
      if (!this.config.filePath) {
        throw new Error('File path is required when using file logging');
      }

      const filePath = resolve(this.config.filePath);
      const stream = createWriteStream(filePath, { flags: 'a' });

      if (this.config.destination === 'both') {
        // Use both console and file
        return pino(options, pino.multistream([{ stream: process.stdout }, { stream }]));
      } else {
        // Use file only
        return pino(options, stream);
      }
    }

    // Console only
    return pino(options);
  }

  /**
   * Log a fatal error
   */
  fatal(message: string, context?: LogContext, error?: Error): void {
    this.logger.fatal(
      {
        ...this.buildLogContext(context),
        error: error ? this.normalizeError(error) : undefined,
      },
      message
    );
  }

  /**
   * Log an error
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.logger.error(
      {
        ...this.buildLogContext(context),
        error: error ? this.normalizeError(error) : undefined,
      },
      message
    );
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.buildLogContext(context), message);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(this.buildLogContext(context), message);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.buildLogContext(context), message);
  }

  /**
   * Log a trace message
   */
  trace(message: string, context?: LogContext): void {
    this.logger.trace(this.buildLogContext(context), message);
  }

  /**
   * Log performance metrics
   */
  performance(metrics: PerformanceMetrics): void {
    if (!this.config.enablePerformanceMonitoring) {
      return;
    }

    this.logger.info(
      {
        type: 'performance',
        operation: metrics.operation,
        duration: metrics.duration,
        memoryUsage: metrics.memoryUsage,
        cpuUsage: metrics.cpuUsage,
        metadata: metrics.metadata,
      },
      `Performance: ${metrics.operation} completed in ${metrics.duration}ms`
    );
  }

  /**
   * Log security events
   */
  security(event: SecurityEvent): void {
    if (!this.config.enableSecurityLogging) {
      return;
    }

    this.logger.warn(
      {
        type: 'security',
        eventType: event.type,
        severity: event.severity,
        userId: event.userId,
        resource: event.resource,
        action: event.action,
        result: event.result,
        metadata: event.metadata,
      },
      `Security Event: ${event.type} - ${event.result}`
    );
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): LoggerService {
    const childLogger = this.logger.child(this.buildLogContext(context));
    return new ChildLogger(childLogger, this.config, context);
  }

  /**
   * Start a performance timer
   */
  startTimer(operation: string, context?: LogContext): PerformanceTimer {
    return new PerformanceTimerImpl(operation, context);
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.logger.level = level;
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Build log context object
   */
  private buildLogContext(context?: LogContext): Record<string, unknown> {
    if (!context) {
      return {};
    }

    return {
      service: context.service,
      operation: context.operation,
      requestId: context.requestId,
      userId: context.userId,
      version: context.version,
      environment: context.environment,
      ...context.metadata,
    };
  }

  /**
   * Normalize error object to ensure it has proper Error properties
   */
  private normalizeError(error: unknown): { name: string; message: string; stack: string } {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack || '',
      };
    }

    // Convert non-Error objects to Error-like objects
    const errorMessage = typeof error === 'string' ? error : String(error);
    const errorObj = new Error(errorMessage);

    return {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack || '',
    };
  }
}

/**
 * Child logger implementation
 */
class ChildLogger implements LoggerService {
  public readonly logger: PinoLogger;
  private readonly config: LoggerConfig;
  private readonly inheritedContext: LogContext;

  constructor(logger: PinoLogger, config: LoggerConfig, inheritedContext: LogContext) {
    this.logger = logger;
    this.config = config;
    this.inheritedContext = inheritedContext;
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    this.logger.fatal(
      {
        ...this.buildLogContext(context),
        error: error ? this.normalizeError(error) : undefined,
      },
      message
    );
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.logger.error(
      {
        ...this.buildLogContext(context),
        error: error ? this.normalizeError(error) : undefined,
      },
      message
    );
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.buildLogContext(context), message);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.buildLogContext(context), message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.buildLogContext(context), message);
  }

  trace(message: string, context?: LogContext): void {
    this.logger.trace(this.buildLogContext(context), message);
  }

  performance(metrics: PerformanceMetrics): void {
    if (!this.config.enablePerformanceMonitoring) {
      return;
    }

    this.logger.info(
      {
        type: 'performance',
        operation: metrics.operation,
        duration: metrics.duration,
        memoryUsage: metrics.memoryUsage,
        cpuUsage: metrics.cpuUsage,
        metadata: metrics.metadata,
      },
      `Performance: ${metrics.operation} completed in ${metrics.duration}ms`
    );
  }

  security(event: SecurityEvent): void {
    if (!this.config.enableSecurityLogging) {
      return;
    }

    this.logger.warn(
      {
        type: 'security',
        eventType: event.type,
        severity: event.severity,
        userId: event.userId,
        resource: event.resource,
        action: event.action,
        result: event.result,
        metadata: event.metadata,
      },
      `Security Event: ${event.type} - ${event.result}`
    );
  }

  child(context: LogContext): LoggerService {
    const mergedContext = {
      ...this.inheritedContext,
      ...context,
      metadata: {
        ...this.inheritedContext.metadata,
        ...context.metadata,
      },
    };
    const childLogger = this.logger.child(this.buildLogContext(context));
    return new ChildLogger(childLogger, this.config, mergedContext);
  }

  startTimer(operation: string, context?: LogContext): PerformanceTimer {
    return new PerformanceTimerImpl(operation, context);
  }

  setLevel(level: LogLevel): void {
    this.logger.level = level;
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  private buildLogContext(context?: LogContext): Record<string, unknown> {
    // Merge inherited context with provided context
    const mergedContext = {
      ...this.inheritedContext,
      ...context,
      metadata: {
        ...this.inheritedContext.metadata,
        ...context?.metadata,
      },
    };

    return {
      service: mergedContext.service,
      operation: mergedContext.operation,
      requestId: mergedContext.requestId,
      userId: mergedContext.userId,
      version: mergedContext.version,
      environment: mergedContext.environment,
      ...mergedContext.metadata,
    };
  }

  /**
   * Normalize error object to ensure it has proper Error properties
   */
  private normalizeError(error: unknown): { name: string; message: string; stack: string } {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack || '',
      };
    }

    // Convert non-Error objects to Error-like objects
    const errorMessage = typeof error === 'string' ? error : String(error);
    const errorObj = new Error(errorMessage);

    return {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack || '',
    };
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create a logger with custom configuration
 */
export function createLogger(config: Partial<LoggerConfig>): LoggerService {
  return new Logger(config);
}
