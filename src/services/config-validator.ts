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
  /**
   * Validates a configuration object against the specified schema
   * @param config Configuration object to validate
   * @param configType Type of configuration to validate against
   * @returns Validation result with success status and data/errors
   */
  validateConfig<T extends BaseConfig | FinalConfig | PlatformConfig>(
    config: unknown,
    configType: ConfigType
  ): ValidationResult<T> {
    try {
      const schema = validationSchemas[configType];

      if (!schema) {
        throw new ConfigLoaderError(
          ErrorType.VALIDATION_ERROR,
          `Unknown configuration type: ${configType}`,
          ErrorSeverity.HIGH,
          { configType },
          ['Use one of: base, platform, final']
        );
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
        throw error;
      }

      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Configuration validation failed',
        ErrorSeverity.HIGH,
        { configType, error: error instanceof Error ? error.message : String(error) },
        [
          'Check configuration structure',
          'Verify all required fields are present',
          'Ensure field values are valid',
        ]
      );
    }
  }

  /**
   * Validates a base configuration
   * @param config Configuration object to validate
   * @returns Validation result
   */
  validateBaseConfig(config: unknown): ValidationResult<BaseConfig> {
    return this.validateConfig<BaseConfig>(config, 'base');
  }

  /**
   * Validates a platform configuration
   * @param config Configuration object to validate
   * @returns Validation result
   */
  validatePlatformConfig(config: unknown): ValidationResult<PlatformConfig> {
    return this.validateConfig<PlatformConfig>(config, 'platform');
  }

  /**
   * Validates a final configuration
   * @param config Configuration object to validate
   * @returns Validation result
   */
  validateFinalConfig(config: unknown): ValidationResult<FinalConfig> {
    return this.validateConfig<FinalConfig>(config, 'final');
  }

  /**
   * Validates multiple configuration objects
   * @param configs Array of configuration objects to validate
   * @param configType Type of configuration to validate against
   * @returns Array of validation results
   */
  validateMultipleConfigs<T extends BaseConfig | FinalConfig | PlatformConfig>(
    configs: readonly unknown[],
    configType: ConfigType
  ): readonly ValidationResult<T>[] {
    return configs.map(config => this.validateConfig<T>(config, configType));
  }

  /**
   * Validates a configuration and throws an error if invalid
   * @param config Configuration object to validate
   * @param configType Type of configuration to validate against
   * @returns Validated configuration object
   * @throws ConfigLoaderError if validation fails
   */
  validateConfigOrThrow<T extends BaseConfig | FinalConfig | PlatformConfig>(
    config: unknown,
    configType: ConfigType
  ): T {
    const result = this.validateConfig<T>(config, configType);

    if (!result.isValid) {
      throw new ConfigLoaderError(
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
    }

    return result.data!;
  }

  /**
   * Checks if a configuration object is valid without returning the validated data
   * @param config Configuration object to validate
   * @param configType Type of configuration to validate against
   * @returns True if valid, false otherwise
   */
  isConfigValid(config: unknown, configType: ConfigType): boolean {
    const result = this.validateConfig(config, configType);
    return result.isValid;
  }

  /**
   * Gets validation schema for a specific configuration type
   * @param configType Type of configuration
   * @returns Joi schema for the configuration type
   */
  getSchema(configType: ConfigType): Joi.ObjectSchema {
    const schema = validationSchemas[configType];

    if (!schema) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        `Unknown configuration type: ${configType}`,
        ErrorSeverity.HIGH,
        { configType },
        ['Use one of: base, platform, final']
      );
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
  validateConfigWithOptions<T extends BaseConfig | FinalConfig | PlatformConfig>(
    config: unknown,
    configType: ConfigType,
    options: Joi.ValidationOptions
  ): ValidationResult<T> {
    try {
      const schema = validationSchemas[configType];

      if (!schema) {
        throw new ConfigLoaderError(
          ErrorType.VALIDATION_ERROR,
          `Unknown configuration type: ${configType}`,
          ErrorSeverity.HIGH,
          { configType },
          ['Use one of: base, platform, final']
        );
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
        throw error;
      }

      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Configuration validation with custom options failed',
        ErrorSeverity.HIGH,
        { configType, options, error: error instanceof Error ? error.message : String(error) },
        [
          'Check configuration structure',
          'Verify validation options are correct',
          'Ensure field values are valid',
        ]
      );
    }
  }
}
