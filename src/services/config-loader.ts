/**
 * Configuration Loader Service
 *
 * This service handles loading and parsing configuration files for the Dockerfile Generator CLI.
 * It supports JSON and YAML formats with validation and caching.
 */

import { readFile, access } from 'fs/promises';
import { resolve, extname } from 'path';
import yaml from 'js-yaml';
import { ConfigLoaderError, ErrorType, ErrorSeverity } from '@/types';
import type { BaseConfig, FinalConfig } from '@/types';
import { ErrorHandlerService } from './error-handler';

/**
 * Configuration file format types
 */
export type ConfigFormat = 'json' | 'yaml' | 'yml';

/**
 * Configuration loader options
 */
export interface ConfigLoaderOptions {
  /** Configuration file path */
  readonly filePath: string;
  /** Expected configuration format */
  readonly format?: ConfigFormat;
  /** Whether to enable caching */
  readonly enableCache?: boolean;
  /** Cache TTL in milliseconds */
  readonly cacheTtl?: number;
  /** Whether to validate configuration */
  readonly validate?: boolean;
}

/**
 * Configuration cache entry
 */
interface ConfigCacheEntry {
  readonly config: BaseConfig | FinalConfig;
  readonly timestamp: number;
  readonly ttl: number;
}

/**
 * Configuration loader service
 * Handles loading, parsing, and caching of configuration files
 */
export class ConfigLoader {
  private readonly cache = new Map<string, ConfigCacheEntry>();
  private readonly defaultCacheTtl = 5 * 60 * 1000; // 5 minutes
  private readonly errorHandler: ErrorHandlerService;

  constructor(errorHandler?: ErrorHandlerService) {
    this.errorHandler =
      errorHandler ||
      new ErrorHandlerService({
        maxRetries: 2,
        retryDelay: 1000,
        enableRecovery: true,
        enableClassification: true,
        enableUserFriendlyMessages: true,
      });
  }

  /**
   * Loads a configuration file
   * @param options Configuration loader options
   * @returns Parsed configuration object
   */
  async loadConfig<T extends BaseConfig | FinalConfig>(options: ConfigLoaderOptions): Promise<T> {
    try {
      const resolvedPath = this.resolveConfigPath(options.filePath);

      await this.validateFileExists(resolvedPath);

      const cached = this.getCachedConfigIfEnabled<T>(resolvedPath, options);
      if (cached) {
        return cached;
      }

      const format = await this.detectFileFormat(resolvedPath, options.format);
      const content = await readFile(resolvedPath, 'utf-8');
      const config = await this.parseConfigContent<T>(content, format, resolvedPath);

      this.cacheConfigIfEnabled(resolvedPath, config, options);

      return config;
    } catch (error) {
      await this.handleLoadConfigError(error, options);
      throw error;
    }
  }

  /**
   * Validates that a file exists
   * @param filePath Path to the file
   */
  private async validateFileExists(filePath: string): Promise<void> {
    try {
      await access(filePath);
    } catch (error) {
      const configError = new ConfigLoaderError(
        ErrorType.CONFIG_LOAD_ERROR,
        `Configuration file not found: ${filePath}`,
        ErrorSeverity.HIGH,
        { filePath, error: error instanceof Error ? error.message : String(error) },
        ['Check that the file path is correct', 'Verify file permissions', 'Ensure the file exists']
      );
      await this.errorHandler.handleError(configError, {
        operation: 'validateFileExists',
        filePath,
      });
      throw configError;
    }
  }

  /**
   * Gets cached config if caching is enabled
   * @param filePath Path to the file
   * @param options Configuration loader options
   * @returns Cached config or null
   */
  private getCachedConfigIfEnabled<T extends BaseConfig | FinalConfig>(
    filePath: string,
    options: ConfigLoaderOptions
  ): T | null {
    if (options.enableCache !== false) {
      return this.getCachedConfig<T>(filePath);
    }
    return null;
  }

  /**
   * Detects file format from extension or options
   * @param filePath Path to the file
   * @param formatOverride Format override from options
   * @returns Detected format
   */
  private async detectFileFormat(
    filePath: string,
    formatOverride?: ConfigFormat
  ): Promise<ConfigFormat> {
    if (formatOverride) {
      return formatOverride;
    }

    try {
      const ext = extname(filePath).toLowerCase();
      switch (ext) {
        case '.json':
          return 'json';
        case '.yaml':
        case '.yml':
          return 'yaml';
        default:
          throw new ConfigLoaderError(
            ErrorType.CONFIG_LOAD_ERROR,
            `Unsupported configuration file format: ${ext}`,
            ErrorSeverity.MEDIUM,
            { filePath, extension: ext },
            [
              'Use .json for JSON configuration files',
              'Use .yaml or .yml for YAML configuration files',
            ]
          );
      }
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        operation: 'detectFormat',
        filePath,
      });
      throw error;
    }
  }

  /**
   * Parses configuration content based on format
   * @param content File content
   * @param format File format
   * @param filePath Path to the file
   * @returns Parsed configuration
   */
  private async parseConfigContent<T extends BaseConfig | FinalConfig>(
    content: string,
    format: ConfigFormat,
    filePath: string
  ): Promise<T> {
    try {
      switch (format) {
        case 'json':
          return this.parseJsonContent<T>(content, filePath);
        case 'yaml':
          return this.parseYamlContent<T>(content, filePath);
        default:
          throw new ConfigLoaderError(
            ErrorType.CONFIG_LOAD_ERROR,
            `Unsupported configuration format: ${format}`,
            ErrorSeverity.MEDIUM,
            { filePath, format }
          );
      }
    } catch (error) {
      if (error instanceof ConfigLoaderError) {
        await this.errorHandler.handleError(error, {
          operation: 'parseConfigFile',
          filePath,
          format,
        });
        throw error;
      } else {
        const configError = new ConfigLoaderError(
          ErrorType.CONFIG_LOAD_ERROR,
          `Failed to parse configuration file: ${filePath}`,
          ErrorSeverity.HIGH,
          {
            filePath,
            format,
            error: error instanceof Error ? error.message : String(error),
          },
          [
            'Check file format and syntax',
            'Verify file permissions',
            'Ensure file is not corrupted',
          ]
        );
        await this.errorHandler.handleError(configError, {
          operation: 'parseConfigFile',
          filePath,
          format,
        });
        throw configError;
      }
    }
  }

  /**
   * Parses JSON content
   * @param content JSON content
   * @param filePath Path to the file
   * @returns Parsed JSON
   */
  private parseJsonContent<T extends BaseConfig | FinalConfig>(
    content: string,
    filePath: string
  ): T {
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      throw new ConfigLoaderError(
        ErrorType.CONFIG_LOAD_ERROR,
        `Invalid JSON in configuration file: ${filePath}`,
        ErrorSeverity.HIGH,
        {
          filePath,
          error: error instanceof Error ? error.message : String(error),
        },
        ['Check JSON syntax', 'Validate JSON structure', 'Use a JSON validator tool']
      );
    }
  }

  /**
   * Parses YAML content
   * @param content YAML content
   * @param filePath Path to the file
   * @returns Parsed YAML
   */
  private parseYamlContent<T extends BaseConfig | FinalConfig>(
    content: string,
    filePath: string
  ): T {
    try {
      return yaml.load(content) as T;
    } catch (error) {
      throw new ConfigLoaderError(
        ErrorType.CONFIG_LOAD_ERROR,
        `Invalid YAML in configuration file: ${filePath}`,
        ErrorSeverity.HIGH,
        {
          filePath,
          error: error instanceof Error ? error.message : String(error),
        },
        ['Check YAML syntax', 'Validate YAML indentation', 'Use a YAML validator tool']
      );
    }
  }

  /**
   * Caches config if caching is enabled
   * @param filePath Path to the file
   * @param config Configuration to cache
   * @param options Configuration loader options
   */
  private cacheConfigIfEnabled<T extends BaseConfig | FinalConfig>(
    filePath: string,
    config: T,
    options: ConfigLoaderOptions
  ): void {
    if (options.enableCache !== false) {
      this.setCachedConfig(filePath, config, options.cacheTtl);
    }
  }

  /**
   * Handles load config errors
   * @param error Error that occurred
   * @param options Configuration loader options
   */
  private async handleLoadConfigError(error: unknown, options: ConfigLoaderOptions): Promise<void> {
    if (error instanceof ConfigLoaderError) {
      await this.errorHandler.handleError(error, {
        operation: 'loadConfig',
        filePath: options.filePath,
        format: options.format,
      });
    } else {
      const configError = new ConfigLoaderError(
        ErrorType.CONFIG_LOAD_ERROR,
        `Failed to load configuration file: ${options.filePath}`,
        ErrorSeverity.HIGH,
        {
          filePath: options.filePath,
          format: options.format,
          error: error instanceof Error ? error.message : String(error),
        },
        [
          'Check file path and permissions',
          'Verify file format',
          'Ensure file exists and is readable',
        ]
      );
      await this.errorHandler.handleError(configError, {
        operation: 'loadConfig',
        filePath: options.filePath,
        format: options.format,
      });
      throw configError;
    }
  }

  /**
   * Loads multiple configuration files and merges them
   * @param filePaths Array of configuration file paths
   * @param options Configuration loader options
   * @returns Merged configuration object
   */
  async loadMultipleConfigs<T extends BaseConfig | FinalConfig>(
    filePaths: readonly string[],
    options: Omit<ConfigLoaderOptions, 'filePath'> = {}
  ): Promise<T> {
    try {
      const configs = await Promise.all(
        filePaths.map(filePath => this.loadConfig<T>({ ...options, filePath }))
      );

      try {
        if (configs.length === 0) {
          throw new ConfigLoaderError(
            ErrorType.CONFIG_LOAD_ERROR,
            'No configuration files provided for merging',
            ErrorSeverity.MEDIUM,
            { configCount: configs.length }
          );
        }

        if (configs.length === 1) {
          return configs[0]!;
        }

        // Deep merge configurations (later configs override earlier ones)
        return configs.reduce((merged, config) => {
          return this.deepMerge(merged, config);
        }, {} as T);
      } catch (error) {
        if (error instanceof ConfigLoaderError) {
          await this.errorHandler.handleError(error, {
            operation: 'mergeConfigs',
            configCount: configs.length,
          });
          throw error; // Re-throw to ensure function exits
        } else {
          const mergeError = new ConfigLoaderError(
            ErrorType.CONFIG_LOAD_ERROR,
            'Failed to merge configuration files',
            ErrorSeverity.HIGH,
            {
              configCount: configs.length,
              error: error instanceof Error ? error.message : String(error),
            },
            [
              'Check for conflicting configuration keys',
              'Verify configuration structure compatibility',
              'Ensure all configurations are valid',
            ]
          );
          await this.errorHandler.handleError(mergeError, {
            operation: 'mergeConfigs',
            configCount: configs.length,
          });
          throw mergeError; // Re-throw to ensure function exits
        }
      }
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        operation: 'loadMultipleConfigs',
        filePaths,
        configCount: filePaths.length,
      });
      throw error; // Re-throw to ensure function exits
    }
  }

  /**
   * Clears the configuration cache
   * @param filePath Optional specific file path to clear, or all if not provided
   */
  clearCache(filePath?: string): void {
    if (filePath) {
      const resolvedPath = this.resolveConfigPath(filePath);
      this.cache.delete(resolvedPath);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Gets cache statistics
   * @returns Cache statistics object
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Resolves configuration file path
   * @param filePath Configuration file path
   * @returns Resolved absolute path
   */
  private resolveConfigPath(filePath: string): string {
    if (filePath.startsWith('/') || filePath.startsWith('~')) {
      return resolve(filePath);
    }

    // If relative path, resolve from current working directory
    return resolve(process.cwd(), filePath);
  }

  /**
   * Deep merges two objects
   * @param target Target object
   * @param source Source object
   * @returns Merged object
   */
  private deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          result[key] = this.deepMerge(targetValue, sourceValue);
        } else {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }

  /**
   * Gets cached configuration if valid
   * @param filePath File path
   * @returns Cached configuration or null
   */
  private getCachedConfig<T extends BaseConfig | FinalConfig>(filePath: string): T | null {
    const entry = this.cache.get(filePath);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(filePath);
      return null;
    }

    return entry.config as T;
  }

  /**
   * Sets cached configuration
   * @param filePath File path
   * @param config Configuration object
   * @param ttl TTL in milliseconds
   */
  private setCachedConfig<T extends BaseConfig | FinalConfig>(
    filePath: string,
    config: T,
    ttl?: number
  ): void {
    this.cache.set(filePath, {
      config,
      timestamp: Date.now(),
      ttl: ttl || this.defaultCacheTtl,
    });
  }

  /**
   * Gets the error handler instance
   * @returns ErrorHandlerService instance
   */
  getErrorHandler(): ErrorHandlerService {
    return this.errorHandler;
  }
}
