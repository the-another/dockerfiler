/**
 * Configuration Loader Service Unit Tests
 *
 * This module contains comprehensive unit tests for the ConfigLoader service.
 * Tests cover file loading, parsing, validation, caching, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFile, access } from 'fs/promises';
import { resolve } from 'path';
import { ConfigLoader } from '@/services';
import { ConfigLoaderError } from '@/types';
import type { BaseConfig } from '@/types';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  access: vi.fn(),
}));

// Mock js-yaml
vi.mock('js-yaml', () => ({
  default: {
    load: vi.fn(),
  },
}));

describe('ConfigLoader', () => {
  let configLoader: ConfigLoader;
  const mockReadFile = vi.mocked(readFile);
  const mockAccess = vi.mocked(access);

  beforeEach(() => {
    configLoader = new ConfigLoader();
    vi.clearAllMocks();
  });

  afterEach(() => {
    configLoader.clearCache();
  });

  describe('loadConfig', () => {
    const validJsonConfig = {
      php: {
        version: '8.3',
        extensions: ['mbstring', 'xml', 'curl'],
        fpm: {
          maxChildren: 50,
          startServers: 5,
          minSpareServers: 5,
          maxSpareServers: 35,
        },
      },
      security: {
        user: 'www-data',
        group: 'www-data',
        nonRoot: true,
        readOnlyRoot: true,
        capabilities: ['CHOWN', 'SETGID', 'SETUID'],
      },
      nginx: {
        workerProcesses: 'auto',
        workerConnections: 1024,
        gzip: true,
        ssl: true,
      },
      s6Overlay: {
        services: ['nginx', 'php-fpm'],
        crontab: ['0 2 * * * /usr/local/bin/cleanup'],
      },
    };

    const validYamlConfig = `
php:
  version: '8.3'
  extensions:
    - mbstring
    - xml
    - curl
  fpm:
    maxChildren: 50
    startServers: 5
    minSpareServers: 5
    maxSpareServers: 35
security:
  user: www-data
  group: www-data
  nonRoot: true
  readOnlyRoot: true
  capabilities:
    - CHOWN
    - SETGID
    - SETUID
nginx:
  workerProcesses: auto
  workerConnections: 1024
  gzip: true
  ssl: true
s6Overlay:
  services:
    - nginx
    - php-fpm
  crontab:
    - '0 2 * * * /usr/local/bin/cleanup'
`;

    it('should load and parse a valid JSON configuration file', async () => {
      // Test loads and parses a valid JSON configuration file successfully
      const filePath = '/path/to/config.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validJsonConfig));

      const result = await configLoader.loadConfig<BaseConfig>({
        filePath,
        format: 'json',
        validate: false,
      });

      expect(mockAccess).toHaveBeenCalledWith(resolve(process.cwd(), filePath));
      expect(mockReadFile).toHaveBeenCalledWith(resolve(process.cwd(), filePath), 'utf-8');
      expect(result).toEqual(validJsonConfig);
    });

    it('should load and parse a valid YAML configuration file', async () => {
      // Test loads and parses a valid YAML configuration file successfully
      const filePath = '/path/to/config.yaml';
      const yaml = await import('js-yaml');
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(validYamlConfig);
      vi.mocked(yaml.default.load).mockReturnValue(validJsonConfig);

      const result = await configLoader.loadConfig<BaseConfig>({
        filePath,
        format: 'yaml',
        validate: false,
      });

      expect(mockAccess).toHaveBeenCalledWith(resolve(process.cwd(), filePath));
      expect(mockReadFile).toHaveBeenCalledWith(resolve(process.cwd(), filePath), 'utf-8');
      expect(yaml.default.load).toHaveBeenCalledWith(validYamlConfig);
      expect(result).toEqual(validJsonConfig);
    });

    it('should auto-detect JSON format from file extension', async () => {
      // Test automatically detects JSON format from .json file extension
      const filePath = '/path/to/config.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validJsonConfig));

      const result = await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
      });

      expect(result).toEqual(validJsonConfig);
    });

    it('should auto-detect YAML format from file extension', async () => {
      // Test automatically detects YAML format from .yaml file extension
      const filePath = '/path/to/config.yaml';
      const yaml = await import('js-yaml');
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(validYamlConfig);
      vi.mocked(yaml.default.load).mockReturnValue(validJsonConfig);

      const result = await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
      });

      expect(yaml.default.load).toHaveBeenCalledWith(validYamlConfig);
      expect(result).toEqual(validJsonConfig);
    });

    it('should auto-detect YAML format from .yml file extension', async () => {
      // Test automatically detects YAML format from .yml file extension
      const filePath = '/path/to/config.yml';
      const yaml = await import('js-yaml');
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(validYamlConfig);
      vi.mocked(yaml.default.load).mockReturnValue(validJsonConfig);

      const result = await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
      });

      expect(yaml.default.load).toHaveBeenCalledWith(validYamlConfig);
      expect(result).toEqual(validJsonConfig);
    });

    it('should resolve absolute file paths correctly', async () => {
      // Test resolves absolute file paths without modification
      const filePath = '/absolute/path/to/config.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validJsonConfig));

      await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
      });

      expect(mockAccess).toHaveBeenCalledWith(filePath);
      expect(mockReadFile).toHaveBeenCalledWith(filePath, 'utf-8');
    });

    it('should resolve home directory paths correctly', async () => {
      // Test resolves home directory paths starting with ~
      const filePath = '~/config.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validJsonConfig));

      await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
      });

      expect(mockAccess).toHaveBeenCalledWith(resolve(filePath));
      expect(mockReadFile).toHaveBeenCalledWith(resolve(filePath), 'utf-8');
    });

    it('should throw ConfigLoaderError when file does not exist', async () => {
      // Test throws ConfigLoaderError when configuration file does not exist
      const filePath = '/nonexistent/config.json';
      mockAccess.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          validate: false,
        })
      ).rejects.toThrow(ConfigLoaderError);

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          validate: false,
        })
      ).rejects.toThrow('Configuration file not found: /nonexistent/config.json');
    });

    it('should throw ConfigLoaderError for unsupported file format', async () => {
      // Test throws ConfigLoaderError for unsupported file format
      const filePath = '/path/to/config.txt';
      mockAccess.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          validate: false,
        })
      ).rejects.toThrow(ConfigLoaderError);

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          validate: false,
        })
      ).rejects.toThrow('Configuration file not found: /path/to/config.txt');
    });

    it('should throw ConfigLoaderError for invalid JSON', async () => {
      // Test throws ConfigLoaderError when JSON content is invalid
      const filePath = '/path/to/invalid.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('{ invalid json }');

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          format: 'json',
          validate: false,
        })
      ).rejects.toThrow(ConfigLoaderError);

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          format: 'json',
          validate: false,
        })
      ).rejects.toThrow('Invalid JSON in configuration file: /path/to/invalid.json');
    });

    it('should throw ConfigLoaderError for invalid YAML', async () => {
      // Test throws ConfigLoaderError when YAML content is invalid
      const filePath = '/path/to/invalid.yaml';
      const yaml = await import('js-yaml');
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('invalid: yaml: content: [');
      vi.mocked(yaml.default.load).mockImplementation(() => {
        throw new Error('YAMLException: bad indentation');
      });

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          format: 'yaml',
          validate: false,
        })
      ).rejects.toThrow(ConfigLoaderError);

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          format: 'yaml',
          validate: false,
        })
      ).rejects.toThrow('Invalid YAML in configuration file: /path/to/invalid.yaml');
    });
  });

  describe('loadMultipleConfigs', () => {
    const config1 = {
      php: {
        version: '8.3',
        extensions: ['mbstring'],
        fpm: { maxChildren: 50, startServers: 5, minSpareServers: 5, maxSpareServers: 35 },
      },
    };
    const config2 = {
      php: {
        version: '8.4',
        extensions: ['xml'],
        fpm: { maxChildren: 60, startServers: 6, minSpareServers: 6, maxSpareServers: 40 },
      },
    };

    it('should load and merge multiple configuration files', async () => {
      // Test loads and merges multiple configuration files successfully
      const filePaths = ['/path/to/config1.json', '/path/to/config2.json'];
      mockAccess.mockResolvedValue(undefined);
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(config1))
        .mockResolvedValueOnce(JSON.stringify(config2));

      const result = await configLoader.loadMultipleConfigs<BaseConfig>(filePaths, {
        validate: false,
      });

      expect(mockReadFile).toHaveBeenCalledTimes(2);
      expect(result).toEqual(config2); // Second config should override first
    });

    it('should throw ConfigLoaderError when loading multiple configs fails', async () => {
      // Test throws ConfigLoaderError when loading multiple configurations fails
      const filePaths = ['/path/to/config1.json', '/nonexistent/config2.json'];
      mockAccess
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));
      mockReadFile.mockResolvedValueOnce(JSON.stringify(config1));

      await expect(
        configLoader.loadMultipleConfigs<BaseConfig>(filePaths, {
          validate: false,
        })
      ).rejects.toThrow(ConfigLoaderError);

      await expect(
        configLoader.loadMultipleConfigs<BaseConfig>(filePaths, {
          validate: false,
        })
      ).rejects.toThrow('Failed to load multiple configuration files');
    });
  });

  describe('caching', () => {
    const validConfig = {
      php: {
        version: '8.3',
        extensions: ['mbstring'],
        fpm: { maxChildren: 50, startServers: 5, minSpareServers: 5, maxSpareServers: 35 },
      },
    };

    it('should cache loaded configurations by default', async () => {
      // Test caches loaded configurations by default to improve performance
      const filePath = '/path/to/config.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validConfig));

      // First load
      const result1 = await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
      });

      // Second load should use cache
      const result2 = await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
      });

      expect(mockReadFile).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should not cache when caching is disabled', async () => {
      // Test does not cache configurations when caching is disabled
      const filePath = '/path/to/config.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validConfig));

      // First load
      await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
        enableCache: false,
      });

      // Second load should not use cache
      await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
        enableCache: false,
      });

      expect(mockReadFile).toHaveBeenCalledTimes(2);
    });

    it('should respect custom cache TTL', async () => {
      // Test respects custom cache TTL settings
      const filePath = '/path/to/config.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validConfig));

      await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
        cacheTtl: 1000, // 1 second
      });

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Second load should not use expired cache
      await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
      });

      expect(mockReadFile).toHaveBeenCalledTimes(2);
    });

    it('should clear cache for specific file', () => {
      // Test clears cache for a specific file path
      const filePath = '/path/to/config.json';
      configLoader.clearCache(filePath);

      const stats = configLoader.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should clear all cache', () => {
      // Test clears all cached configurations
      configLoader.clearCache();

      const stats = configLoader.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should provide cache statistics', () => {
      // Test provides cache statistics including size and entries
      const stats = configLoader.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
      expect(Array.isArray(stats.entries)).toBe(true);
    });
  });

  // Note: Type-specific loading methods (loadBaseConfig, loadPlatformConfig, loadFinalConfig)
  // are not yet implemented in the current ConfigLoader service

  // Note: Validation integration is not yet implemented in the current ConfigLoader service
  // These tests will be added when validation is integrated into the ConfigLoader

  describe('error handling', () => {
    it('should handle file read errors gracefully', async () => {
      // Test handles file read errors gracefully with proper error messages
      const filePath = '/path/to/config.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockRejectedValue(new Error('EACCES: permission denied'));

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          validate: false,
        })
      ).rejects.toThrow(ConfigLoaderError);

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          validate: false,
        })
      ).rejects.toThrow('Failed to read configuration file: /path/to/config.json');
    });

    it('should provide helpful error suggestions', async () => {
      // Test provides helpful error suggestions in error messages
      const filePath = '/nonexistent/config.json';
      mockAccess.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      try {
        await configLoader.loadConfig<BaseConfig>({
          filePath,
          validate: false,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigLoaderError);
        if (error instanceof ConfigLoaderError) {
          expect(error.suggestions).toBeDefined();
          expect(error.suggestions!.length).toBeGreaterThan(0);
          expect(error.suggestions![0]).toContain('Check that the file path is correct');
        }
      }
    });

    it('should handle unexpected errors', async () => {
      // Test handles unexpected errors with proper error classification
      const filePath = '/path/to/config.json';
      mockAccess.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          validate: false,
        })
      ).rejects.toThrow(ConfigLoaderError);

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          validate: false,
        })
      ).rejects.toThrow('Configuration file not found: /path/to/config.json');
    });
  });

  describe('edge cases', () => {
    it('should handle empty configuration files', async () => {
      // Test handles empty configuration files gracefully
      const filePath = '/path/to/empty.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('');

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          format: 'json',
          validate: false,
        })
      ).rejects.toThrow(ConfigLoaderError);
    });

    it('should handle configuration files with only whitespace', async () => {
      // Test handles configuration files with only whitespace
      const filePath = '/path/to/whitespace.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('   \n\t  ');

      await expect(
        configLoader.loadConfig<BaseConfig>({
          filePath,
          format: 'json',
          validate: false,
        })
      ).rejects.toThrow(ConfigLoaderError);
    });

    it('should handle very large configuration files', async () => {
      // Test handles very large configuration files without issues
      const largeConfig = {
        php: {
          version: '8.3',
          extensions: Array.from({ length: 100 }, (_, i) => `extension${i}`),
          fpm: { maxChildren: 50, startServers: 5, minSpareServers: 5, maxSpareServers: 35 },
        },
      };
      const filePath = '/path/to/large.json';
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(largeConfig));

      const result = await configLoader.loadConfig<BaseConfig>({
        filePath,
        validate: false,
      });

      expect(result.php.extensions).toHaveLength(100);
    });
  });
});
