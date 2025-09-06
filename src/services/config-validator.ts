/**
 * Configuration Validator Service
 *
 * This service provides configuration validation using organized Joi schemas
 * for the Dockerfile Generator CLI.
 */

import Joi from 'joi';
import { ConfigLoaderError, ErrorType, ErrorSeverity } from '@/types';
import type { BaseConfig, FinalConfig, PlatformConfig } from '@/types';
import { baseConfigSchema, finalConfigSchema, platformConfigSchema } from '@/validators';
import { ErrorHandlerService } from './error-handler';

// Constants for repeated string literals
const CONFIG_TYPE_SUGGESTIONS = ['Use one of: base, platform, final'];

/**
 * Configuration type for validation schemas
 */
export type ConfigType = 'base' | 'platform' | 'final';

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  /** Whether the validation passed */
  readonly isValid: boolean;
  /** The validated and potentially transformed data */
  readonly data?: T;
  /** Validation errors if any */
  readonly errors?: readonly string[];
  /** Raw Joi validation error details */
  readonly details?: unknown;
}

/**
 * Validation schema map for different configuration types
 */
const validationSchemas = {
  base: baseConfigSchema,
  platform: platformConfigSchema,
  final: finalConfigSchema,
} as const;

/**
 * Configuration validator service
 * Handles validation of configuration objects using organized Joi schemas
 */
export class ConfigValidator {
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
  /**
   * Validates a configuration object against the specified schema
   * @param config Configuration object to validate
   * @param configType Type of configuration to validate against
   * @returns Validation result with success status and data/errors
   */
  async validateConfig<T extends BaseConfig | FinalConfig | PlatformConfig>(
    config: unknown,
    configType: ConfigType
  ): Promise<ValidationResult<T>> {
    try {
      const schema = validationSchemas[configType];

      if (!schema) {
        const unknownTypeError = new ConfigLoaderError(
          ErrorType.VALIDATION_ERROR,
          `Unknown configuration type: ${configType}`,
          ErrorSeverity.HIGH,
          { configType },
          CONFIG_TYPE_SUGGESTIONS
        );
        await this.errorHandler.handleError(unknownTypeError, {
          operation: 'validateConfig',
          configType,
        });
        throw unknownTypeError; // Re-throw to ensure function exits
      }

      const { error, value } = schema.validate(config, {
        abortEarly: false,
        stripUnknown: false,
        convert: true,
        allowUnknown: false,
      });

      if (error) {
        return {
          isValid: false,
          errors: this.formatValidationErrors(error),
          details: error.details,
        };
      }

      return {
        isValid: true,
        data: value as T,
      };
    } catch (error) {
      if (error instanceof ConfigLoaderError) {
        await this.errorHandler.handleError(error, {
          operation: 'validateConfig',
          configType,
        });
        throw error; // Re-throw to ensure function exits
      } else {
        // For unexpected errors during validation, return a failed result
        return {
          isValid: false,
          errors: [
            `Unexpected validation error: ${error instanceof Error ? error.message : String(error)}`,
          ],
          details: error,
        };
      }
    }
  }

  /**
   * Validates a base configuration
   * @param config Configuration object to validate
   * @returns Validation result
   */
  async validateBaseConfig(config: unknown): Promise<ValidationResult<BaseConfig>> {
    return await this.validateConfig<BaseConfig>(config, 'base');
  }

  /**
   * Validates a platform configuration
   * @param config Configuration object to validate
   * @returns Validation result
   */
  async validatePlatformConfig(config: unknown): Promise<ValidationResult<PlatformConfig>> {
    return await this.validateConfig<PlatformConfig>(config, 'platform');
  }

  /**
   * Validates a final configuration
   * @param config Configuration object to validate
   * @returns Validation result
   */
  async validateFinalConfig(config: unknown): Promise<ValidationResult<FinalConfig>> {
    return await this.validateConfig<FinalConfig>(config, 'final');
  }

  /**
   * Validates multiple configuration objects
   * @param configs Array of configuration objects to validate
   * @param configType Type of configuration to validate against
   * @returns Array of validation results
   */
  async validateMultipleConfigs<T extends BaseConfig | FinalConfig | PlatformConfig>(
    configs: readonly unknown[],
    configType: ConfigType
  ): Promise<readonly ValidationResult<T>[]> {
    return Promise.all(configs.map(config => this.validateConfig<T>(config, configType)));
  }

  /**
   * Validates a configuration and throws an error if invalid
   * @param config Configuration object to validate
   * @param configType Type of configuration to validate against
   * @returns Validated configuration object
   * @throws ConfigLoaderError if validation fails
   */
  async validateConfigOrThrow<T extends BaseConfig | FinalConfig | PlatformConfig>(
    config: unknown,
    configType: ConfigType
  ): Promise<T> {
    const result = await this.validateConfig<T>(config, configType);

    if (!result.isValid) {
      const validationError = new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        `Configuration validation failed for type: ${configType}`,
        ErrorSeverity.HIGH,
        {
          configType,
          errors: result.errors,
          details: result.details,
        },
        [
          'Check the configuration structure',
          'Verify all required fields are present',
          'Ensure field values match the expected format',
          'Review validation error messages for specific issues',
        ]
      );
      await this.errorHandler.handleError(validationError, {
        operation: 'validateConfigOrThrow',
        configType,
        errors: result.errors,
      });
    }

    return result.data!;
  }

  /**
   * Checks if a configuration object is valid without returning the validated data
   * @param config Configuration object to validate
   * @param configType Type of configuration to validate against
   * @returns True if valid, false otherwise
   */
  async isConfigValid(config: unknown, configType: ConfigType): Promise<boolean> {
    const result = await this.validateConfig(config, configType);
    return result.isValid;
  }

  /**
   * Gets validation schema for a specific configuration type
   * @param configType Type of configuration
   * @returns Joi schema for the configuration type
   */
  async getSchema(configType: ConfigType): Promise<Joi.ObjectSchema> {
    const schema = validationSchemas[configType];

    if (!schema) {
      const unknownTypeError = new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        `Unknown configuration type: ${configType}`,
        ErrorSeverity.HIGH,
        { configType },
        ['Use one of: base, platform, final']
      );
      await this.errorHandler.handleError(unknownTypeError, {
        operation: 'getSchema',
        configType,
      });
      throw unknownTypeError; // Re-throw to ensure function exits
    }

    return schema;
  }

  /**
   * Formats Joi validation errors into user-friendly messages
   * @param error Joi validation error
   * @returns Array of formatted error messages
   */
  private formatValidationErrors(error: Joi.ValidationError): readonly string[] {
    return error.details.map(detail => {
      const path = detail.path.join('.');
      const message = detail.message;

      if (path) {
        return `${path}: ${message}`;
      }

      return message;
    });
  }

  /**
   * Gets available configuration types
   * @returns Array of available configuration types
   */
  getAvailableConfigTypes(): readonly ConfigType[] {
    return Object.keys(validationSchemas) as ConfigType[];
  }

  /**
   * Validates configuration with custom options
   * @param config Configuration object to validate
   * @param configType Type of configuration to validate against
   * @param options Joi validation options
   * @returns Validation result
   */
  async validateConfigWithOptions<T extends BaseConfig | FinalConfig | PlatformConfig>(
    config: unknown,
    configType: ConfigType,
    options: Joi.ValidationOptions
  ): Promise<ValidationResult<T>> {
    try {
      const schema = validationSchemas[configType];

      if (!schema) {
        const unknownTypeError = new ConfigLoaderError(
          ErrorType.VALIDATION_ERROR,
          `Unknown configuration type: ${configType}`,
          ErrorSeverity.HIGH,
          { configType },
          CONFIG_TYPE_SUGGESTIONS
        );
        await this.errorHandler.handleError(unknownTypeError, {
          operation: 'validateConfigWithOptions',
          configType,
        });
        throw unknownTypeError; // Re-throw to ensure function exits
      }

      const { error, value } = schema.validate(config, options);

      if (error) {
        return {
          isValid: false,
          errors: this.formatValidationErrors(error),
          details: error.details,
        };
      }

      return {
        isValid: true,
        data: value as T,
      };
    } catch (error) {
      if (error instanceof ConfigLoaderError) {
        await this.errorHandler.handleError(error, {
          operation: 'validateConfigWithOptions',
          configType,
        });
        throw error; // Re-throw to ensure function exits
      } else {
        // For unexpected errors during validation, return a failed result
        return {
          isValid: false,
          errors: [
            `Unexpected validation error: ${error instanceof Error ? error.message : String(error)}`,
          ],
          details: error,
        };
      }
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
