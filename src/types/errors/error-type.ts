/**
 * Error Type Enum
 *
 * This module contains the ErrorType enum for the Dockerfile Generator CLI.
 */

/**
 * Error types for the Dockerfile Generator CLI
 * Categorizes different types of errors that can occur
 */
export enum ErrorType {
  /** Configuration file loading failures */
  CONFIG_LOAD_ERROR = 'CONFIG_LOAD_ERROR',
  /** Configuration validation failures */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Template rendering failures */
  TEMPLATE_ERROR = 'TEMPLATE_ERROR',
  /** File system operation failures */
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  /** Security validation failures */
  SECURITY_ERROR = 'SECURITY_ERROR',
  /** Docker operation failures */
  DOCKER_ERROR = 'DOCKER_ERROR',
  /** Registry operation failures */
  REGISTRY_ERROR = 'REGISTRY_ERROR',
  /** Command argument validation failures */
  ARGUMENT_ERROR = 'ARGUMENT_ERROR',
  /** Network operation failures */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Build process failures */
  BUILD_ERROR = 'BUILD_ERROR',
  /** Manifest operation failures */
  MANIFEST_ERROR = 'MANIFEST_ERROR',
  /** Test execution failures */
  TEST_ERROR = 'TEST_ERROR',
  /** Unknown or unexpected errors */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
