/**
 * Alpine Configuration Validator Unit Tests
 *
 * This module contains unit tests for Alpine-specific configuration validation schemas.
 * Tests cover Alpine cleanup commands, APK packages, repositories, and keys validation.
 */

import { describe, it, expect } from 'vitest';
import { alpineConfigSchema } from '@/validators';

describe('Alpine Configuration Validator', () => {
  describe('alpineConfigSchema', () => {
    it('should validate complete Alpine configuration', () => {
      // Test validates complete Alpine configuration with all optional fields
      const config = {
        cleanupCommands: ['apk del build-dependencies', 'rm -rf /var/cache/apk/*'],
        apkPackages: ['nginx', 'php83-fpm', 'php83-mbstring'],
        apkRepositories: ['http://dl-cdn.alpinelinux.org/alpine/v3.18/main'],
        apkKeys: ['alpine-devel@lists.alpinelinux.org-4a6a0840.rsa.pub'],
      };

      const result = alpineConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Alpine configuration with minimal fields', () => {
      // Test validates Alpine configuration with minimal required fields
      const config = {
        cleanupCommands: ['apk del build-dependencies'],
      };

      const result = alpineConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Alpine configuration with only APK packages', () => {
      // Test validates Alpine configuration with only APK packages
      const config = {
        apkPackages: ['nginx', 'php83-fpm'],
      };

      const result = alpineConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Alpine configuration with only APK repositories', () => {
      // Test validates Alpine configuration with only APK repositories
      const config = {
        apkRepositories: ['http://dl-cdn.alpinelinux.org/alpine/v3.18/main'],
      };

      const result = alpineConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Alpine configuration with only APK keys', () => {
      // Test validates Alpine configuration with only APK keys
      const config = {
        apkKeys: ['alpine-devel@lists.alpinelinux.org-4a6a0840.rsa.pub'],
      };

      const result = alpineConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should handle undefined configuration gracefully', () => {
      // Test handles undefined Alpine configuration gracefully without validation errors
      const result = alpineConfigSchema.validate(undefined);

      expect(result.error).toBeUndefined();
      expect(result.value).toBeUndefined();
    });

    it('should handle null configuration gracefully', () => {
      // Test handles null Alpine configuration gracefully without validation errors
      const result = alpineConfigSchema.validate(null);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('must be of type object');
    });

    it('should handle empty object configuration gracefully', () => {
      // Test handles empty object Alpine configuration gracefully without validation errors
      const result = alpineConfigSchema.validate({});

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual({});
    });

    describe('cleanupCommands validation', () => {
      it('should validate cleanup commands with valid values', () => {
        // Test validates cleanup commands with valid command strings
        const config = {
          cleanupCommands: [
            'apk del build-dependencies',
            'rm -rf /var/cache/apk/*',
            'rm -rf /tmp/*',
            'rm -rf /var/tmp/*',
          ],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.cleanupCommands).toEqual(config.cleanupCommands);
      });

      it('should reject cleanup commands that exceed maximum count', () => {
        // Test rejects cleanup commands that exceed 20 command limit
        const cleanupCommands = Array.from({ length: 21 }, (_, i) => `command-${i}`);

        const config = {
          cleanupCommands,
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Maximum 20 cleanup commands allowed');
      });

      it('should reject empty cleanup commands', () => {
        // Test rejects empty cleanup commands in the array
        const config = {
          cleanupCommands: ['apk del build-dependencies', ''],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('is not allowed to be empty');
      });

      it('should reject cleanup commands that exceed maximum length', () => {
        // Test rejects cleanup commands that exceed 200 character limit
        const config = {
          cleanupCommands: ['apk del build-dependencies', 'a'.repeat(201)],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Cleanup command cannot exceed 200 characters');
      });

      it('should validate maximum allowed cleanup commands', () => {
        // Test validates maximum allowed cleanup commands (20)
        const cleanupCommands = Array.from({ length: 20 }, (_, i) => `command-${i}`);

        const config = {
          cleanupCommands,
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.cleanupCommands).toHaveLength(20);
      });
    });

    describe('apkPackages validation', () => {
      it('should validate APK packages with valid package names', () => {
        // Test validates APK packages with valid package names
        const config = {
          apkPackages: ['nginx', 'php83-fpm', 'php83-mbstring', 'php83-xml', 'php83-curl'],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.apkPackages).toEqual(config.apkPackages);
      });

      it('should reject APK packages that exceed maximum count', () => {
        // Test rejects APK packages that exceed 100 package limit
        const apkPackages = Array.from({ length: 101 }, (_, i) => `package-${i}`);

        const config = {
          apkPackages,
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Maximum 100 APK packages allowed');
      });

      it('should reject empty APK package names', () => {
        // Test rejects empty APK package names in the array
        const config = {
          apkPackages: ['nginx', '', 'php83-fpm'],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('is not allowed to be empty');
      });

      it('should reject APK package names that exceed maximum length', () => {
        // Test rejects APK package names that exceed 100 character limit
        const config = {
          apkPackages: ['nginx', 'a'.repeat(101)],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Package name cannot exceed 100 characters');
      });

      it('should validate maximum allowed APK packages', () => {
        // Test validates maximum allowed APK packages (100)
        const apkPackages = Array.from({ length: 100 }, (_, i) => `package-${i}`);

        const config = {
          apkPackages,
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.apkPackages).toHaveLength(100);
      });
    });

    describe('apkRepositories validation', () => {
      it('should validate APK repositories with valid repository URLs', () => {
        // Test validates APK repositories with valid repository URLs
        const config = {
          apkRepositories: [
            'http://dl-cdn.alpinelinux.org/alpine/v3.18/main',
            'http://dl-cdn.alpinelinux.org/alpine/v3.18/community',
            'http://dl-cdn.alpinelinux.org/alpine/edge/main',
          ],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.apkRepositories).toEqual(config.apkRepositories);
      });

      it('should reject APK repositories that exceed maximum count', () => {
        // Test rejects APK repositories that exceed 10 repository limit
        const apkRepositories = Array.from(
          { length: 11 },
          (_, i) => `http://repo-${i}.alpinelinux.org`
        );

        const config = {
          apkRepositories,
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Maximum 10 APK repositories allowed');
      });

      it('should reject empty APK repository URLs', () => {
        // Test rejects empty APK repository URLs in the array
        const config = {
          apkRepositories: ['http://dl-cdn.alpinelinux.org/alpine/v3.18/main', ''],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('is not allowed to be empty');
      });

      it('should reject APK repository URLs that exceed maximum length', () => {
        // Test rejects APK repository URLs that exceed 500 character limit
        const config = {
          apkRepositories: ['http://dl-cdn.alpinelinux.org/alpine/v3.18/main', 'a'.repeat(501)],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Repository URL cannot exceed 500 characters');
      });

      it('should validate maximum allowed APK repositories', () => {
        // Test validates maximum allowed APK repositories (10)
        const apkRepositories = Array.from(
          { length: 10 },
          (_, i) => `http://repo-${i}.alpinelinux.org`
        );

        const config = {
          apkRepositories,
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.apkRepositories).toHaveLength(10);
      });
    });

    describe('apkKeys validation', () => {
      it('should validate APK keys with valid key identifiers', () => {
        // Test validates APK keys with valid key identifiers
        const config = {
          apkKeys: [
            'alpine-devel@lists.alpinelinux.org-4a6a0840.rsa.pub',
            'alpine-devel@lists.alpinelinux.org-5243ef4b.rsa.pub',
          ],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.apkKeys).toEqual(config.apkKeys);
      });

      it('should reject APK keys that exceed maximum count', () => {
        // Test rejects APK keys that exceed 20 key limit
        const apkKeys = Array.from({ length: 21 }, (_, i) => `key-${i}.rsa.pub`);

        const config = {
          apkKeys,
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Maximum 20 APK keys allowed');
      });

      it('should reject empty APK key identifiers', () => {
        // Test rejects empty APK key identifiers in the array
        const config = {
          apkKeys: ['alpine-devel@lists.alpinelinux.org-4a6a0840.rsa.pub', ''],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('is not allowed to be empty');
      });

      it('should reject APK key identifiers that exceed maximum length', () => {
        // Test rejects APK key identifiers that exceed 100 character limit
        const config = {
          apkKeys: ['alpine-devel@lists.alpinelinux.org-4a6a0840.rsa.pub', 'a'.repeat(101)],
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('APK key cannot exceed 100 characters');
      });

      it('should validate maximum allowed APK keys', () => {
        // Test validates maximum allowed APK keys (20)
        const apkKeys = Array.from({ length: 20 }, (_, i) => `key-${i}.rsa.pub`);

        const config = {
          apkKeys,
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.apkKeys).toHaveLength(20);
      });
    });

    describe('combined validation', () => {
      it('should validate Alpine configuration with all fields at maximum limits', () => {
        // Test validates Alpine configuration with all fields at their maximum limits
        const config = {
          cleanupCommands: Array.from({ length: 20 }, (_, i) => `command-${i}`),
          apkPackages: Array.from({ length: 100 }, (_, i) => `package-${i}`),
          apkRepositories: Array.from({ length: 10 }, (_, i) => `http://repo-${i}.alpinelinux.org`),
          apkKeys: Array.from({ length: 20 }, (_, i) => `key-${i}.rsa.pub`),
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value).toEqual(config);
      });

      it('should validate Alpine configuration with mixed field combinations', () => {
        // Test validates Alpine configuration with various combinations of fields
        const config = {
          cleanupCommands: ['apk del build-dependencies'],
          apkPackages: ['nginx', 'php83-fpm'],
          apkRepositories: ['http://dl-cdn.alpinelinux.org/alpine/v3.18/main'],
          // apkKeys is omitted
        };

        const result = alpineConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.cleanupCommands).toEqual(config.cleanupCommands);
        expect(result.value.apkPackages).toEqual(config.apkPackages);
        expect(result.value.apkRepositories).toEqual(config.apkRepositories);
        expect(result.value.apkKeys).toBeUndefined();
      });
    });
  });
});
