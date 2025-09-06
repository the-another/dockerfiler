/**
 * Platform Configuration Validator Unit Tests
 *
 * This module contains unit tests for platform configuration validation schemas.
 * Tests cover platform validation, base image validation, and platform-specific settings.
 */

import { describe, it, expect } from 'vitest';
import { platformSchema, platformConfigSchema } from '@/validators';
import { Platform } from '@/types';

describe('Platform Configuration Validator', () => {
  describe('platformSchema', () => {
    it('should validate all supported platforms', () => {
      // Test validates all supported platform values
      Object.values(Platform).forEach(platform => {
        const result = platformSchema.validate(platform);

        expect(result.error).toBeUndefined();
        expect(result.value).toBe(platform);
      });
    });

    it('should reject invalid platform values', () => {
      // Test rejects invalid platform values with appropriate error messages
      const invalidPlatforms = ['windows', 'macos', 'invalid', ''];

      invalidPlatforms.forEach(platform => {
        const result = platformSchema.validate(platform);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Platform must be one of:');
      });
    });

    it('should require platform to be present', () => {
      // Test requires platform to be present
      const result = platformSchema.validate(undefined);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Platform is required');
    });

    it('should reject null platform', () => {
      // Test rejects null platform value
      const result = platformSchema.validate(null);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Platform must be one of:');
    });
  });

  describe('platformConfigSchema', () => {
    const createValidAlpineConfig = () => ({
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
      platform: Platform.ALPINE,
      platformSpecific: {
        packageManager: {
          useCache: true,
          cleanCache: true,
          repositories: ['http://dl-cdn.alpinelinux.org/alpine/edge/main'],
        },
        optimizations: {
          security: true,
          minimal: true,
          performance: true,
        },
        cleanupCommands: ['apk del build-dependencies', 'rm -rf /var/cache/apk/*'],
        environment: {
          ALPINE_VERSION: '3.18',
        },
      },
    });

    const createValidUbuntuConfig = () => ({
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
      platform: Platform.UBUNTU,
      platformSpecific: {
        packageManager: {
          updateLists: true,
          upgrade: true,
          cleanCache: true,
          repositories: ['http://archive.ubuntu.com/ubuntu/'],
        },
        optimizations: {
          security: true,
          minimal: true,
          performance: true,
        },
        cleanupCommands: ['apt-get clean', 'rm -rf /var/lib/apt/lists/*'],
        environment: {
          UBUNTU_VERSION: '22.04',
        },
      },
    });

    it('should validate complete Alpine platform configuration', () => {
      // Test validates complete Alpine platform configuration with all required fields
      const config = createValidAlpineConfig();
      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate complete Ubuntu platform configuration', () => {
      // Test validates complete Ubuntu platform configuration with all required fields
      const config = createValidUbuntuConfig();
      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should require platform field', () => {
      // Test requires platform field to be present
      const config = createValidAlpineConfig();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { platform: _, ...configWithoutPlatform } = config;

      const result = platformConfigSchema.validate(configWithoutPlatform);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Platform is required');
    });

    it('should require platformSpecific field', () => {
      // Test requires platformSpecific field to be present
      const config = createValidAlpineConfig();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { platformSpecific: _, ...configWithoutPlatformSpecific } = config;

      const result = platformConfigSchema.validate(configWithoutPlatformSpecific);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('platformSpecific is required');
    });

    it('should require packageManager configuration', () => {
      // Test requires packageManager configuration in platformSpecific
      const config = createValidAlpineConfig();
      delete config.platformSpecific.packageManager;

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain(
        'platformSpecific must be a valid Alpine or Ubuntu configuration'
      );
    });

    it('should require optimizations configuration', () => {
      // Test requires optimizations configuration in platformSpecific
      const config = createValidAlpineConfig();
      delete config.platformSpecific.optimizations;

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain(
        'platformSpecific must be a valid Alpine or Ubuntu configuration'
      );
    });

    it('should require cleanupCommands', () => {
      // Test requires cleanupCommands in platformSpecific
      const config = createValidAlpineConfig();
      delete config.platformSpecific.cleanupCommands;

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain(
        'platformSpecific must be a valid Alpine or Ubuntu configuration'
      );
    });

    it('should validate cleanup commands with maximum allowed count', () => {
      // Test validates cleanup commands with maximum allowed count (20)
      const cleanupCommands = Array.from({ length: 20 }, (_, i) => `command-${i}`);

      const config = {
        ...createValidAlpineConfig(),
        platformSpecific: {
          ...createValidAlpineConfig().platformSpecific,
          cleanupCommands,
        },
      };

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.platformSpecific.cleanupCommands).toHaveLength(20);
    });

    it('should reject cleanup commands that exceed maximum count', () => {
      // Test rejects cleanup commands that exceed 20 command limit
      const cleanupCommands = Array.from({ length: 21 }, (_, i) => `command-${i}`);

      const config = {
        ...createValidAlpineConfig(),
        platformSpecific: {
          ...createValidAlpineConfig().platformSpecific,
          cleanupCommands,
        },
      };

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain(
        'platformSpecific must be a valid Alpine or Ubuntu configuration'
      );
    });

    it('should reject empty cleanup commands', () => {
      // Test rejects empty cleanup commands
      const config = {
        ...createValidAlpineConfig(),
        platformSpecific: {
          ...createValidAlpineConfig().platformSpecific,
          cleanupCommands: ['apk del build-dependencies', ''],
        },
      };

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain(
        'platformSpecific must be a valid Alpine or Ubuntu configuration'
      );
    });

    it('should reject cleanup commands that exceed maximum length', () => {
      // Test rejects cleanup commands that exceed 200 character limit
      const config = {
        ...createValidAlpineConfig(),
        platformSpecific: {
          ...createValidAlpineConfig().platformSpecific,
          cleanupCommands: ['apk del build-dependencies', 'a'.repeat(201)],
        },
      };

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain(
        'platformSpecific must be a valid Alpine or Ubuntu configuration'
      );
    });

    it('should validate optional repositories array', () => {
      // Test validates optional repositories array in packageManager
      const config = {
        ...createValidAlpineConfig(),
        platformSpecific: {
          ...createValidAlpineConfig().platformSpecific,
          packageManager: {
            ...createValidAlpineConfig().platformSpecific.packageManager,
            repositories: [
              'http://dl-cdn.alpinelinux.org/alpine/edge/main',
              'http://dl-cdn.alpinelinux.org/alpine/edge/community',
            ],
          },
        },
      };

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.platformSpecific.packageManager.repositories).toHaveLength(2);
    });

    it('should reject repositories array with more than 10 items', () => {
      // Test rejects repositories array with more than 10 items
      const repositories = Array.from({ length: 11 }, (_, i) => `repo-${i}`);

      const config = {
        ...createValidAlpineConfig(),
        platformSpecific: {
          ...createValidAlpineConfig().platformSpecific,
          packageManager: {
            ...createValidAlpineConfig().platformSpecific.packageManager,
            repositories,
          },
        },
      };

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain(
        'platformSpecific must be a valid Alpine or Ubuntu configuration'
      );
    });

    it('should validate optional environment variables', () => {
      // Test validates optional environment variables
      const config = {
        ...createValidAlpineConfig(),
        platformSpecific: {
          ...createValidAlpineConfig().platformSpecific,
          environment: {
            ALPINE_VERSION: '3.18',
            PHP_VERSION: '8.3',
            NGINX_VERSION: '1.24',
          },
        },
      };

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.platformSpecific.environment).toEqual(
        config.platformSpecific.environment
      );
    });

    it('should handle undefined repositories gracefully', () => {
      // Test handles undefined repositories gracefully without validation errors
      const config = {
        ...createValidAlpineConfig(),
        platformSpecific: {
          ...createValidAlpineConfig().platformSpecific,
          packageManager: {
            useCache: true,
            cleanCache: true,
            // repositories is undefined
          },
        },
      };

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.platformSpecific.packageManager.repositories).toBeUndefined();
    });

    it('should handle undefined environment gracefully', () => {
      // Test handles undefined environment gracefully without validation errors
      const config = {
        ...createValidAlpineConfig(),
        platformSpecific: {
          packageManager: createValidAlpineConfig().platformSpecific.packageManager,
          optimizations: createValidAlpineConfig().platformSpecific.optimizations,
          cleanupCommands: createValidAlpineConfig().platformSpecific.cleanupCommands,
          // environment is undefined
        },
      };

      const result = platformConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.platformSpecific.environment).toBeUndefined();
    });
  });
});
