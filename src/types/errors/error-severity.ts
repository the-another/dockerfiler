/**
 * Error Severity Enum
 *
 * This module contains the ErrorSeverity enum for the Dockerfile Generator CLI.
 */

/**
 * Error severity levels
 * Indicates the severity of an error
 */
export enum ErrorSeverity {
  /** Low severity - warning level */
  LOW = 'LOW',
  /** Medium severity - error level */
  MEDIUM = 'MEDIUM',
  /** High severity - critical level */
  HIGH = 'HIGH',
  /** Critical severity - fatal level */
  CRITICAL = 'CRITICAL',
}
