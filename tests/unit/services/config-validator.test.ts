/**
 * Configuration Validator Service Unit Tests
 *
 * This module contains comprehensive unit tests for the ConfigValidator service.
 * Tests cover validation logic, error handling, and schema validation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigValidator, type ConfigType } from '@/services';
import { ConfigLoaderError } from '@/types';
import type { BaseConfig, FinalConfig, PlatformConfig } from '@/types';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  describe('validateConfig', () => {
    const validBaseConfig: BaseConfig = {
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

    const validPlatformConfig: PlatformConfig = {
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
      platform: 'alpine',
      platformSpecific: {
        packageManager: {
          useCache: true,
          cleanCache: true,
        },
        optimizations: {
          security: true,
          minimal: true,
          performance: true,
        },
        cleanupCommands: ['rm -rf /tmp/*'],
      },
    };

    const validFinalConfig: FinalConfig = {
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
      platform: 'alpine',
      platformSpecific: {
        packageManager: {
          useCache: true,
          cleanCache: true,
        },
        optimizations: {
          security: true,
          minimal: true,
          performance: true,
        },
        cleanupCommands: ['rm -rf /tmp/*'],
      },
      architecture: 'amd64',
      build: {
        baseImage: 'alpine:3.18',
      },
    };

    it('should validate a valid base configuration', async () => {
      // Test validates a valid base configuration successfully
      const result = await validator.validateConfig<BaseConfig>(validBaseConfig, 'base');

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validBaseConfig);
      expect(result.errors).toBeUndefined();
    });

    it('should validate a valid platform configuration', async () => {
      // Test validates a valid platform configuration successfully
      const result = await validator.validateConfig<PlatformConfig>(
        validPlatformConfig,
        'platform'
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validPlatformConfig);
      expect(result.errors).toBeUndefined();
    });

    it('should validate a valid final configuration', async () => {
      // Test validates a valid final configuration successfully
      const result = await validator.validateConfig<FinalConfig>(validFinalConfig, 'final');

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validFinalConfig);
      expect(result.errors).toBeUndefined();
    });

    it('should return validation errors for invalid base configuration', async () => {
      // Test returns validation errors for invalid base configuration
      const invalidConfig = {
        php: {
          version: 'invalid',
          extensions: [],
          fpm: {
            maxChildren: 50,
            startServers: 5,
            minSpareServers: 5,
            maxSpareServers: 35,
          },
        },
      };

      const result = await validator.validateConfig<BaseConfig>(invalidConfig, 'base');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0]).toContain('version');
    });

    it('should return validation errors for invalid platform configuration', async () => {
      // Test returns validation errors for invalid platform configuration
      const invalidConfig = {
        platform: 'invalid',
        baseImage: '',
        packages: [],
      };

      const result = await validator.validateConfig<PlatformConfig>(invalidConfig, 'platform');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should return validation errors for invalid final configuration', async () => {
      // Test returns validation errors for invalid final configuration
      const invalidConfig = {
        platform: 'alpine',
        baseImage: 'alpine:3.18',
        packages: ['nginx'],
        architecture: 'invalid',
        build: {
          baseImage: '',
        },
      };

      const result = await validator.validateConfig<FinalConfig>(invalidConfig, 'final');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should throw ConfigLoaderError for unknown configuration type', async () => {
      // Test throws ConfigLoaderError for unknown configuration type
      await expect(
        validator.validateConfig(validBaseConfig, 'unknown' as ConfigType)
      ).rejects.toThrow(ConfigLoaderError);

      await expect(
        validator.validateConfig(validBaseConfig, 'unknown' as ConfigType)
      ).rejects.toThrow('Unknown configuration type: unknown');
    });

    it('should handle null and undefined configurations', async () => {
      // Test handles null and undefined configurations gracefully
      const nullResult = await validator.validateConfig<BaseConfig>(null, 'base');
      expect(nullResult.isValid).toBe(false);
      expect(nullResult.errors).toBeDefined();

      const undefinedResult = await validator.validateConfig<BaseConfig>(undefined, 'base');
      expect(undefinedResult.isValid).toBe(false);
      expect(undefinedResult.errors).toBeDefined();
    });
  });

  describe('type-specific validation methods', () => {
    const validBaseConfig: BaseConfig = {
      php: {
        version: '8.3',
        extensions: ['mbstring'],
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
        capabilities: ['CHOWN'],
      },
      nginx: {
        workerProcesses: 'auto',
        workerConnections: 1024,
        gzip: true,
        ssl: true,
      },
      s6Overlay: {
        services: ['nginx'],
        crontab: [],
      },
    };

    it('should validate base configuration using validateBaseConfig', async () => {
      // Test validates base configuration using the dedicated method
      const result = await validator.validateBaseConfig(validBaseConfig);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validBaseConfig);
    });

    it('should validate platform configuration using validatePlatformConfig', async () => {
      // Test validates platform configuration using the dedicated method
      const validPlatformConfig: PlatformConfig = {
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
        platform: 'alpine',
        platformSpecific: {
          packageManager: {
            useCache: true,
            cleanCache: true,
          },
          optimizations: {
            security: true,
            minimal: true,
            performance: true,
          },
          cleanupCommands: ['rm -rf /tmp/*'],
        },
      };

      const result = await validator.validatePlatformConfig(validPlatformConfig);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validPlatformConfig);
    });

    it('should validate final configuration using validateFinalConfig', async () => {
      // Test validates final configuration using the dedicated method
      const validFinalConfig: FinalConfig = {
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
        platform: 'alpine',
        platformSpecific: {
          packageManager: {
            useCache: true,
            cleanCache: true,
          },
          optimizations: {
            security: true,
            minimal: true,
            performance: true,
          },
          cleanupCommands: ['rm -rf /tmp/*'],
        },
        architecture: 'amd64',
        build: {
          baseImage: 'alpine:3.18',
        },
      };

      const result = await validator.validateFinalConfig(validFinalConfig);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validFinalConfig);
    });
  });

  describe('validateMultipleConfigs', () => {
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

    it('should validate multiple configurations', async () => {
      // Test validates multiple configurations and returns array of results
      const configs = [config1, config2];
      const results = await validator.validateMultipleConfigs<BaseConfig>(configs, 'base');

      expect(results).toHaveLength(2);
      // @ts-ignore
      expect(results[0].isValid).toBe(false); // Missing required fields
      // @ts-ignore
      expect(results[1].isValid).toBe(false); // Missing required fields
    });

    it('should handle empty array of configurations', async () => {
      // Test handles empty array of configurations gracefully
      const results = await validator.validateMultipleConfigs<BaseConfig>([], 'base');

      expect(results).toHaveLength(0);
    });
  });

  describe('validateConfigOrThrow', () => {
    const validBaseConfig: BaseConfig = {
      php: {
        version: '8.3',
        extensions: ['mbstring'],
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
        capabilities: ['CHOWN'],
      },
      nginx: {
        workerProcesses: 'auto',
        workerConnections: 1024,
        gzip: true,
        ssl: true,
      },
      s6Overlay: {
        services: ['nginx'],
        crontab: [],
      },
    };

    it('should return validated data for valid configuration', async () => {
      // Test returns validated data for valid configuration without throwing
      const result = await validator.validateConfigOrThrow<BaseConfig>(validBaseConfig, 'base');

      expect(result).toEqual(validBaseConfig);
    });

    it('should include helpful suggestions in error', async () => {
      // Test includes helpful suggestions in validation error
      const invalidConfig = {
        php: {
          version: 'invalid',
          extensions: [],
          fpm: {
            maxChildren: 50,
            startServers: 5,
            minSpareServers: 5,
            maxSpareServers: 35,
          },
        },
      };

      try {
        await validator.validateConfigOrThrow<BaseConfig>(invalidConfig, 'base');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigLoaderError);
        if (error instanceof ConfigLoaderError) {
          expect(error.suggestions).toBeDefined();
          expect(error.suggestions!.length).toBeGreaterThan(0);
          expect(error.suggestions![0]).toContain('Check the configuration structure');
        }
      }
    });
  });

  describe('isConfigValid', () => {
    const validBaseConfig: BaseConfig = {
      php: {
        version: '8.3',
        extensions: ['mbstring'],
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
        capabilities: ['CHOWN'],
      },
      nginx: {
        workerProcesses: 'auto',
        workerConnections: 1024,
        gzip: true,
        ssl: true,
      },
      s6Overlay: {
        services: ['nginx'],
        crontab: [],
      },
    };

    it('should return true for valid configuration', async () => {
      // Test returns true for valid configuration
      const isValid = await validator.isConfigValid(validBaseConfig, 'base');

      expect(isValid).toBe(true);
    });

    it('should return false for invalid configuration', async () => {
      // Test returns false for invalid configuration
      const invalidConfig = {
        php: {
          version: 'invalid',
          extensions: [],
          fpm: {
            maxChildren: 50,
            startServers: 5,
            minSpareServers: 5,
            maxSpareServers: 35,
          },
        },
      };

      const isValid = await validator.isConfigValid(invalidConfig, 'base');

      expect(isValid).toBe(false);
    });
  });

  describe('getSchema', () => {
    it('should return schema for valid configuration type', async () => {
      // Test returns Joi schema for valid configuration type
      const baseSchema = validator.getSchema('base');
      const platformSchema = validator.getSchema('platform');
      const finalSchema = validator.getSchema('final');

      expect(baseSchema).toBeDefined();
      expect(platformSchema).toBeDefined();
      expect(finalSchema).toBeDefined();
    });

    it('should throw ConfigLoaderError for unknown configuration type', async () => {
      // Test throws ConfigLoaderError for unknown configuration type
      await expect(validator.getSchema('unknown' as ConfigType)).rejects.toThrow(ConfigLoaderError);

      await expect(validator.getSchema('unknown' as ConfigType)).rejects.toThrow(
        'Unknown configuration type: unknown'
      );
    });
  });

  describe('getAvailableConfigTypes', () => {
    it('should return array of available configuration types', async () => {
      // Test returns array of available configuration types
      const types = validator.getAvailableConfigTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('base');
      expect(types).toContain('platform');
      expect(types).toContain('final');
      expect(types).toHaveLength(3);
    });
  });

  describe('validateConfigWithOptions', () => {
    const validBaseConfig: BaseConfig = {
      php: {
        version: '8.3',
        extensions: ['mbstring'],
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
        capabilities: ['CHOWN'],
      },
      nginx: {
        workerProcesses: 'auto',
        workerConnections: 1024,
        gzip: true,
        ssl: true,
      },
      s6Overlay: {
        services: ['nginx'],
        crontab: [],
      },
    };

    it('should validate configuration with custom options', async () => {
      // Test validates configuration with custom Joi validation options
      const options = {
        abortEarly: true,
        stripUnknown: true,
        convert: false,
      };

      const result = await validator.validateConfigWithOptions<BaseConfig>(
        validBaseConfig,
        'base',
        options
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validBaseConfig);
    });

    it('should handle validation errors with custom options', async () => {
      // Test handles validation errors when using custom options
      const invalidConfig = {
        php: {
          version: 'invalid',
          extensions: [],
          fpm: {
            maxChildren: 50,
            startServers: 5,
            minSpareServers: 5,
            maxSpareServers: 35,
          },
        },
      };

      const options = {
        abortEarly: true,
        stripUnknown: false,
        convert: true,
      };

      const result = await validator.validateConfigWithOptions<BaseConfig>(
        invalidConfig,
        'base',
        options
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should throw ConfigLoaderError for unknown configuration type with options', async () => {
      // Test throws ConfigLoaderError for unknown configuration type when using custom options
      const options = { abortEarly: true };

      await expect(
        validator.validateConfigWithOptions(validBaseConfig, 'unknown' as ConfigType, options)
      ).rejects.toThrow(ConfigLoaderError);
    });
  });

  describe('error handling', () => {
    it('should handle unexpected validation errors', async () => {
      // Test handles unexpected validation errors gracefully
      const malformedConfig = {
        php: {
          version: '8.3',
          extensions: 'not-an-array', // This should cause a validation error
          fpm: {
            maxChildren: 50,
            startServers: 5,
            minSpareServers: 5,
            maxSpareServers: 35,
          },
        },
      };

      const result = await validator.validateConfig<BaseConfig>(malformedConfig, 'base');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should provide detailed error information', async () => {
      // Test provides detailed error information including field paths
      const invalidConfig = {
        php: {
          version: 'invalid',
          extensions: [],
          fpm: {
            maxChildren: -1, // Invalid negative value
            startServers: 5,
            minSpareServers: 5,
            maxSpareServers: 35,
          },
        },
      };

      const result = await validator.validateConfig<BaseConfig>(invalidConfig, 'base');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.details).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', async () => {
      // Test handles empty configuration objects
      const result = await validator.validateConfig<BaseConfig>({}, 'base');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle objects with extra properties', async () => {
      // Test handles objects with extra properties not defined in schema
      const configWithExtra = {
        php: {
          version: '8.3',
          extensions: ['mbstring'],
          fpm: {
            maxChildren: 50,
            startServers: 5,
            minSpareServers: 5,
            maxSpareServers: 35,
          },
        },
        extraProperty: 'should be ignored',
      };

      const result = await validator.validateConfig<BaseConfig>(configWithExtra, 'base');

      expect(result.isValid).toBe(false); // Still invalid due to missing required fields
    });

    it('should handle deeply nested invalid configurations', async () => {
      // Test handles deeply nested invalid configurations
      const deeplyNestedInvalid = {
        php: {
          version: '8.3',
          extensions: ['mbstring'],
          fpm: {
            maxChildren: 50,
            startServers: 5,
            minSpareServers: 5,
            maxSpareServers: 35,
          },
          options: {
            memoryLimit: 'invalid-format',
          },
        },
      };

      const result = await validator.validateConfig<BaseConfig>(deeplyNestedInvalid, 'base');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
