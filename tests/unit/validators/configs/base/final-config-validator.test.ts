/**
 * Final Configuration Validator Unit Tests
 *
 * This module contains unit tests for final configuration validation schemas.
 * Tests cover final configuration structure, architecture validation, and build settings.
 */

import { describe, it, expect } from 'vitest';
import { finalConfigSchema } from '@/validators';
import { Platform } from '@/types';

describe('Final Configuration Validator', () => {
  const createValidFinalConfig = () => ({
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
      buildArgs: {
        PHP_VERSION: '8.3',
        NGINX_VERSION: '1.24',
      },
      context: './docker',
      useCache: true,
    },
  });

  describe('finalConfigSchema', () => {
    it('should validate complete final configuration', () => {
      // Test validates complete final configuration with all required fields
      const config = createValidFinalConfig();
      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate final configuration with minimal build settings', () => {
      // Test validates final configuration with minimal build settings
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.build).toEqual(config.build);
    });

    it('should validate all supported architectures', () => {
      // Test validates all supported architecture values
      const architectures = ['amd64', 'arm64', 'arm/v7', 'arm/v6'];

      architectures.forEach(arch => {
        const config = {
          ...createValidFinalConfig(),
          architecture: arch,
        };

        const result = finalConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.architecture).toBe(arch);
      });
    });

    it('should reject invalid architecture values', () => {
      // Test rejects invalid architecture values with appropriate error messages
      const invalidArchitectures = ['x86_64', 'aarch64', 'invalid', ''];

      invalidArchitectures.forEach(arch => {
        const config = {
          ...createValidFinalConfig(),
          architecture: arch,
        };

        const result = finalConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('must be one of: amd64, arm64, arm/v7, arm/v6');
      });
    });

    it('should require architecture field', () => {
      // Test requires architecture field to be present
      const config = createValidFinalConfig();
      delete (config as any).architecture;

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('architecture is required');
    });

    it('should validate build configuration', () => {
      // Test validates build configuration with all optional fields
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'ubuntu:22.04',
          buildArgs: {
            PHP_VERSION: '8.3',
            NGINX_VERSION: '1.24',
            CUSTOM_ARG: 'value',
          },
          context: './custom-docker',
          useCache: false,
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.build).toEqual(config.build);
    });

    it('should require build.baseImage', () => {
      // Test requires build.baseImage to be present
      const config = {
        ...createValidFinalConfig(),
        build: {
          // baseImage is missing
          buildArgs: { PHP_VERSION: '8.3' },
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('build.baseImage is required');
    });

    it('should reject empty build.baseImage', () => {
      // Test rejects empty build.baseImage with appropriate error message
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: '',
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is not allowed to be empty');
    });

    it('should reject build.baseImage that exceeds maximum length', () => {
      // Test rejects build.baseImage that exceeds 200 character limit
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'a'.repeat(201),
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('build.baseImage cannot exceed 200 characters');
    });

    it('should validate build.buildArgs with valid key-value pairs', () => {
      // Test validates build.buildArgs with valid key-value pairs
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          buildArgs: {
            PHP_VERSION: '8.3',
            NGINX_VERSION: '1.24',
            CUSTOM_ARG: 'custom-value',
          },
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.build.buildArgs).toEqual(config.build.buildArgs);
    });

    it('should reject build.buildArgs with empty keys', () => {
      // Test rejects build.buildArgs with empty keys
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          buildArgs: {
            '': 'value',
            PHP_VERSION: '8.3',
          },
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is not allowed');
    });

    it('should reject build.buildArgs with empty values', () => {
      // Test rejects build.buildArgs with empty values
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          buildArgs: {
            PHP_VERSION: '',
            NGINX_VERSION: '1.24',
          },
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is not allowed');
    });

    it('should reject build.buildArgs with too many arguments', () => {
      // Test rejects build.buildArgs with more than 50 arguments
      const buildArgs: Record<string, string> = {};
      for (let i = 0; i < 51; i++) {
        buildArgs[`ARG_${i}`] = `value_${i}`;
      }

      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          buildArgs,
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Maximum 50 build arguments allowed');
    });

    it('should reject build.buildArgs with keys that exceed maximum length', () => {
      // Test rejects build.buildArgs with keys that exceed 50 character limit
      const longKey = 'a'.repeat(51);
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          buildArgs: {
            [longKey]: 'value',
          },
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is not allowed');
    });

    it('should reject build.buildArgs with values that exceed maximum length', () => {
      // Test rejects build.buildArgs with values that exceed 200 character limit
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          buildArgs: {
            PHP_VERSION: 'a'.repeat(201),
          },
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('cannot exceed 200 characters');
    });

    it('should validate build.context', () => {
      // Test validates build.context with valid path
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          context: './custom-docker-context',
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.build.context).toBe('./custom-docker-context');
    });

    it('should reject empty build.context', () => {
      // Test rejects empty build.context with appropriate error message
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          context: '',
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is not allowed to be empty');
    });

    it('should reject build.context that exceeds maximum length', () => {
      // Test rejects build.context that exceeds 500 character limit
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          context: 'a'.repeat(501),
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('build.context cannot exceed 500 characters');
    });

    it('should validate build.useCache as boolean', () => {
      // Test validates build.useCache as boolean value
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          useCache: false,
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.build.useCache).toBe(false);
    });

    it('should reject build.useCache as non-boolean', () => {
      // Test rejects build.useCache as non-boolean value
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          useCache: 123 as any,
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('must be a boolean');
    });

    it('should handle undefined build.buildArgs gracefully', () => {
      // Test handles undefined build.buildArgs gracefully without validation errors
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          // buildArgs is undefined
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.build.buildArgs).toBeUndefined();
    });

    it('should handle undefined build.context gracefully', () => {
      // Test handles undefined build.context gracefully without validation errors
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          // context is undefined
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.build.context).toBeUndefined();
    });

    it('should handle undefined build.useCache gracefully', () => {
      // Test handles undefined build.useCache gracefully without validation errors
      const config = {
        ...createValidFinalConfig(),
        build: {
          baseImage: 'alpine:3.18',
          // useCache is undefined
        },
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.build.useCache).toBeUndefined();
    });

    it('should require build configuration', () => {
      // Test requires build configuration to be present
      const config = createValidFinalConfig();
      delete (config as any).build;

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is required');
    });

    it('should validate platform configuration through platform schema', () => {
      // Test validates platform configuration through platform schema
      const config = {
        ...createValidFinalConfig(),
        platform: 'invalid' as any,
      };

      const result = finalConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Platform must be one of:');
    });
  });
});
