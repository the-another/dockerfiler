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
  /** Docker build failures */
  DOCKER_BUILD_ERROR = 'DOCKER_BUILD_ERROR',
  /** Docker daemon connection failures */
  DOCKER_DAEMON_ERROR = 'DOCKER_DAEMON_ERROR',
  /** Docker image pull failures */
  DOCKER_PULL_ERROR = 'DOCKER_PULL_ERROR',
  /** Docker image push failures */
  DOCKER_PUSH_ERROR = 'DOCKER_PUSH_ERROR',
  /** Docker multi-architecture build failures */
  DOCKER_MULTIARCH_ERROR = 'DOCKER_MULTIARCH_ERROR',
  /** Docker build cache failures */
  DOCKER_CACHE_ERROR = 'DOCKER_CACHE_ERROR',
  /** Registry operation failures */
  REGISTRY_ERROR = 'REGISTRY_ERROR',
  /** Registry authentication failures */
  REGISTRY_AUTH_ERROR = 'REGISTRY_AUTH_ERROR',
  /** Registry rate limiting failures */
  REGISTRY_RATE_LIMIT_ERROR = 'REGISTRY_RATE_LIMIT_ERROR',
  /** Registry network connectivity failures */
  REGISTRY_NETWORK_ERROR = 'REGISTRY_NETWORK_ERROR',
  /** Registry quota exceeded failures */
  REGISTRY_QUOTA_ERROR = 'REGISTRY_QUOTA_ERROR',
  /** Registry image not found failures */
  REGISTRY_NOT_FOUND_ERROR = 'REGISTRY_NOT_FOUND_ERROR',
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
