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

  /**
   * Loads a configuration file
   * @param options Configuration loader options
   * @returns Parsed configuration object
   */
  async loadConfig<T extends BaseConfig | FinalConfig>(options: ConfigLoaderOptions): Promise<T> {
    try {
      // Resolve the file path
      const resolvedPath = this.resolveConfigPath(options.filePath);

      // Check if file exists
      await this.validateFileExists(resolvedPath);

      // Check cache if enabled
      if (options.enableCache !== false) {
        const cached = this.getCachedConfig<T>(resolvedPath);
        if (cached) {
          return cached;
        }
      }

      // Determine file format
      const format = options.format || this.detectFormat(resolvedPath);

      // Read and parse the file
      const config = await this.parseConfigFile<T>(resolvedPath, format);

      // Cache the result if enabled
      if (options.enableCache !== false) {
        this.setCachedConfig(resolvedPath, config, options.cacheTtl);
      }

      return config;
    } catch (error) {
      this.handleConfigLoadError(error, options.filePath);
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

      return this.mergeConfigs<T>(configs);
    } catch (error) {
      throw new ConfigLoaderError(
        ErrorType.CONFIG_LOAD_ERROR,
        'Failed to load multiple configuration files',
        ErrorSeverity.HIGH,
        { filePaths, error: error instanceof Error ? error.message : String(error) },
        [
          'Check that all configuration files exist',
          'Verify file permissions',
          'Ensure configuration files are valid JSON or YAML',
        ]
      );
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
   * Validates that a file exists and is readable
   * @param filePath File path to validate
   */
  private async validateFileExists(filePath: string): Promise<void> {
    try {
      await access(filePath);
    } catch (error) {
      throw new ConfigLoaderError(
        ErrorType.CONFIG_LOAD_ERROR,
        `Configuration file not found: ${filePath}`,
        ErrorSeverity.HIGH,
        { filePath, error: error instanceof Error ? error.message : String(error) },
        ['Check that the file path is correct', 'Verify file permissions', 'Ensure the file exists']
      );
    }
  }

  /**
   * Detects configuration file format from extension
   * @param filePath File path
   * @returns Detected format
   */
  private detectFormat(filePath: string): ConfigFormat {
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
  }

  /**
   * Parses a configuration file based on format
   * @param filePath File path
   * @param format File format
   * @returns Parsed configuration object
   */
  private async parseConfigFile<T extends BaseConfig | FinalConfig>(
    filePath: string,
    format: ConfigFormat
  ): Promise<T> {
    try {
      const content = await readFile(filePath, 'utf-8');

      switch (format) {
        case 'json':
          return this.parseJSON<T>(content, filePath);
        case 'yaml':
          return this.parseYAML<T>(content, filePath);
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
        throw error;
      }

      throw new ConfigLoaderError(
        ErrorType.CONFIG_LOAD_ERROR,
        `Failed to read configuration file: ${filePath}`,
        ErrorSeverity.HIGH,
        { filePath, error: error instanceof Error ? error.message : String(error) },
        [
          'Check file permissions',
          'Verify file is not corrupted',
          'Ensure file is valid JSON or YAML',
        ]
      );
    }
  }

  /**
   * Parses JSON configuration content
   * @param content JSON content
   * @param filePath File path for error context
   * @returns Parsed configuration object
   */
  private parseJSON<T extends BaseConfig | FinalConfig>(content: string, filePath: string): T {
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      throw new ConfigLoaderError(
        ErrorType.CONFIG_LOAD_ERROR,
        `Invalid JSON in configuration file: ${filePath}`,
        ErrorSeverity.HIGH,
        { filePath, error: error instanceof Error ? error.message : String(error) },
        ['Check JSON syntax', 'Validate JSON structure', 'Use a JSON validator tool']
      );
    }
  }

  /**
   * Parses YAML configuration content
   * @param content YAML content
   * @param filePath File path for error context
   * @returns Parsed configuration object
   */
  private parseYAML<T extends BaseConfig | FinalConfig>(content: string, filePath: string): T {
    try {
      return yaml.load(content) as T;
    } catch (error) {
      throw new ConfigLoaderError(
        ErrorType.CONFIG_LOAD_ERROR,
        `Invalid YAML in configuration file: ${filePath}`,
        ErrorSeverity.HIGH,
        { filePath, error: error instanceof Error ? error.message : String(error) },
        ['Check YAML syntax', 'Validate YAML indentation', 'Use a YAML validator tool']
      );
    }
  }

  /**
   * Merges multiple configuration objects
   * @param configs Array of configuration objects
   * @returns Merged configuration object
   */
  private mergeConfigs<T extends BaseConfig | FinalConfig>(configs: readonly T[]): T {
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

    try {
      // Deep merge configurations (later configs override earlier ones)
      return configs.reduce((merged, config) => {
        return this.deepMerge(merged, config);
      }, {} as T);
    } catch (error) {
      throw new ConfigLoaderError(
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
    }
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
   * Handles configuration loading errors
   * @param error Error object
   * @param filePath File path for context
   */
  private handleConfigLoadError(error: unknown, filePath: string): never {
    if (error instanceof ConfigLoaderError) {
      throw error;
    }

    throw new ConfigLoaderError(
      ErrorType.CONFIG_LOAD_ERROR,
      `Unexpected error loading configuration: ${filePath}`,
      ErrorSeverity.HIGH,
      { filePath, error: error instanceof Error ? error.message : String(error) },
      ['Check file permissions', 'Verify file format', 'Ensure file is not corrupted']
    );
  }
}
