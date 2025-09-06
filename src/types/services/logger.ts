/**
 * Logger Service Types
 *
 * This module contains type definitions for the structured logging system
 * using Pino for high-performance, structured logging.
 */

import type { Logger as PinoLogger } from 'pino';

/**
 * Log levels supported by the logging system
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Log output destinations
 */
export type LogDestination = 'console' | 'file' | 'both';

/**
 * Log format options
 */
export type LogFormat = 'json' | 'pretty' | 'minimal';

/**
 * Performance metrics that can be logged
 */
export interface PerformanceMetrics {
  readonly operation: string;
  readonly duration: number;
  readonly memoryUsage?: NodeJS.MemoryUsage;
  readonly cpuUsage?: NodeJS.CpuUsage;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Security event types for audit logging
 */
export type SecurityEventType =
  | 'authentication'
  | 'authorization'
  | 'configuration_change'
  | 'file_access'
  | 'docker_operation'
  | 'registry_access'
  | 'validation_failure'
  | 'security_scan';

/**
 * Security event data
 */
export interface SecurityEvent {
  readonly type: SecurityEventType;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly userId?: string;
  readonly resource?: string;
  readonly action?: string;
  readonly result: 'success' | 'failure' | 'blocked';
  readonly metadata?: Record<string, unknown>;
}

/**
 * Application context for structured logging
 */
export interface LogContext {
  readonly service: string;
  readonly operation?: string;
  readonly requestId?: string;
  readonly userId?: string;
  readonly version?: string;
  readonly environment?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Log level threshold */
  readonly level: LogLevel;
  /** Output destination */
  readonly destination: LogDestination;
  /** Log format */
  readonly format: LogFormat;
  /** File path for file logging */
  readonly filePath?: string;
  /** Enable performance monitoring */
  readonly enablePerformanceMonitoring: boolean;
  /** Enable security event logging */
  readonly enableSecurityLogging: boolean;
  /** Enable request/response logging */
  readonly enableRequestLogging: boolean;
  /** Maximum log file size in bytes */
  readonly maxFileSize?: number;
  /** Maximum number of log files to keep */
  readonly maxFiles?: number;
  /** Enable log rotation */
  readonly enableRotation: boolean;
  /** Custom serializers */
  readonly serializers?: Record<string, (value: unknown) => unknown>;
}

/**
 * Logger service interface
 */
export interface LoggerService {
  /** Get the underlying Pino logger instance */
  readonly logger: PinoLogger;

  /** Log a fatal error */
  fatal(message: string, context?: LogContext, error?: Error): void;

  /** Log an error */
  error(message: string, context?: LogContext, error?: Error): void;

  /** Log a warning */
  warn(message: string, context?: LogContext): void;

  /** Log an info message */
  info(message: string, context?: LogContext): void;

  /** Log a debug message */
  debug(message: string, context?: LogContext): void;

  /** Log a trace message */
  trace(message: string, context?: LogContext): void;

  /** Log performance metrics */
  performance(metrics: PerformanceMetrics): void;

  /** Log security events */
  security(event: SecurityEvent): void;

  /** Create a child logger with additional context */
  child(context: LogContext): LoggerService;

  /** Start a performance timer */
  startTimer(operation: string, context?: LogContext): PerformanceTimer;

  /** Set the log level */
  setLevel(level: LogLevel): void;

  /** Get current configuration */
  getConfig(): LoggerConfig;
}

/**
 * Performance timer interface
 */
export interface PerformanceTimer {
  /** End the timer and log the performance metrics */
  end(metadata?: Record<string, unknown>): PerformanceMetrics;

  /** Get the current duration without ending the timer */
  getDuration(): number;
}

/**
 * Default logger configuration
 */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: 'info',
  destination: 'console',
  format: 'pretty',
  enablePerformanceMonitoring: true,
  enableSecurityLogging: true,
  enableRequestLogging: false,
  enableRotation: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
} as const;
