/**
 * Validation Engine Service
 *
 * This service validates configurations, generated files, and security settings.
 */

import type { BuildConfig } from '@/services';
import { ErrorHandlerService } from './error-handler';
import { logger } from './logger';
import { ConfigLoaderError, ErrorType, ErrorSeverity } from '@/types';

export class ValidationEngine {
  private readonly errorHandler: ErrorHandlerService;

  constructor(errorHandler?: ErrorHandlerService) {
    this.errorHandler =
      errorHandler ||
      new ErrorHandlerService({
        maxRetries: 1,
        retryDelay: 500,
        enableRecovery: false,
        enableClassification: true,
        enableUserFriendlyMessages: true,
      });
  }

  async validateConfig(config: BuildConfig): Promise<void> {
    try {
      // Validate input parameter
      this.validateInputConfig(config);

      logger.info('Validating configuration', {
        service: 'validation-engine',
        operation: 'validateConfig',
        metadata: {
          phpVersion: config.phpVersion,
          platform: config.platform,
        },
      });

      // Placeholder validation - will be replaced with actual validation logic
      this.validateBasicConfig(config);
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        operation: 'validateConfig',
        phpVersion: config?.phpVersion,
        platform: config?.platform,
      });
    }
  }

  private validateBasicConfig(config: BuildConfig): void {
    if (!config.phpVersion) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'PHP version is required',
        ErrorSeverity.HIGH,
        { phpVersion: config.phpVersion },
        ['Provide a valid PHP version string (e.g., "8.3", "8.4")']
      );
    }

    if (!config.platform) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Platform is required',
        ErrorSeverity.HIGH,
        { platform: config.platform },
        ['Use "alpine" for Alpine Linux or "ubuntu" for Ubuntu']
      );
    }

    if (!config.packages || config.packages.length === 0) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'At least one package is required',
        ErrorSeverity.HIGH,
        { packages: config.packages, packageCount: config.packages?.length },
        ['Provide an array of package names to install']
      );
    }

    if (!config.security) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Security configuration is required',
        ErrorSeverity.HIGH,
        { security: config.security },
        ['Provide a valid security configuration object']
      );
    }

    if (!config.security.user) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Security user is required',
        ErrorSeverity.HIGH,
        { securityUser: config.security.user },
        ['Provide a valid security user name (e.g., "www-data")']
      );
    }

    if (!config.security.group) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Security group is required',
        ErrorSeverity.HIGH,
        { securityGroup: config.security.group },
        ['Provide a valid security group name (e.g., "www-data")']
      );
    }

    logger.info('Basic configuration validation passed', {
      service: 'validation-engine',
      operation: 'validateBasicConfig',
    });
  }

  /**
   * Validates input configuration parameter
   * @param config Configuration to validate
   */
  private validateInputConfig(config: BuildConfig): void {
    if (!config) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Configuration is required',
        ErrorSeverity.HIGH,
        { config },
        ['Provide a valid BuildConfig object']
      );
    }

    if (typeof config !== 'object') {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Configuration must be an object',
        ErrorSeverity.HIGH,
        { config, type: typeof config },
        ['Provide a valid BuildConfig object']
      );
    }
  }

  /**
   * Gets the error handler instance
   * @returns ErrorHandlerService instance
   */
  getErrorHandler(): ErrorHandlerService {
    return this.errorHandler;
  }
}
