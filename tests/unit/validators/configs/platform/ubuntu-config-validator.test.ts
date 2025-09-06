/**
 * Ubuntu Configuration Validator Unit Tests
 *
 * This module contains unit tests for Ubuntu-specific configuration validation schemas.
 * Tests cover Ubuntu cleanup commands, APT packages, repositories, keys, and sources validation.
 */

import { describe, it, expect } from 'vitest';
import { ubuntuConfigSchema } from '@/validators';

describe('Ubuntu Configuration Validator', () => {
  describe('ubuntuConfigSchema', () => {
    it('should validate complete Ubuntu configuration', () => {
      // Test validates complete Ubuntu configuration with all optional fields
      const config = {
        cleanupCommands: ['apt-get clean', 'rm -rf /var/lib/apt/lists/*'],
        aptPackages: ['nginx', 'php8.3-fpm', 'php8.3-mbstring'],
        aptRepositories: ['ppa:ondrej/php'],
        aptKeys: ['https://packages.sury.org/php/apt.gpg'],
        aptSources: ['deb https://packages.sury.org/php/ ubuntu focal main'],
      };

      const result = ubuntuConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Ubuntu configuration with minimal fields', () => {
      // Test validates Ubuntu configuration with minimal required fields
      const config = {
        cleanupCommands: ['apt-get clean'],
      };

      const result = ubuntuConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Ubuntu configuration with only APT packages', () => {
      // Test validates Ubuntu configuration with only APT packages
      const config = {
        aptPackages: ['nginx', 'php8.3-fpm'],
      };

      const result = ubuntuConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Ubuntu configuration with only APT repositories', () => {
      // Test validates Ubuntu configuration with only APT repositories
      const config = {
        aptRepositories: ['ppa:ondrej/php'],
      };

      const result = ubuntuConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Ubuntu configuration with only APT keys', () => {
      // Test validates Ubuntu configuration with only APT keys
      const config = {
        aptKeys: ['https://packages.sury.org/php/apt.gpg'],
      };

      const result = ubuntuConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Ubuntu configuration with only APT sources', () => {
      // Test validates Ubuntu configuration with only APT sources
      const config = {
        aptSources: ['deb https://packages.sury.org/php/ ubuntu focal main'],
      };

      const result = ubuntuConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should handle undefined configuration gracefully', () => {
      // Test handles undefined Ubuntu configuration gracefully without validation errors
      const result = ubuntuConfigSchema.validate(undefined);

      expect(result.error).toBeUndefined();
      expect(result.value).toBeUndefined();
    });

    it('should handle null configuration gracefully', () => {
      // Test handles null Ubuntu configuration gracefully without validation errors
      const result = ubuntuConfigSchema.validate(null);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('must be of type object');
    });

    it('should handle empty object configuration gracefully', () => {
      // Test handles empty object Ubuntu configuration gracefully without validation errors
      const result = ubuntuConfigSchema.validate({});

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual({});
    });

    describe('cleanupCommands validation', () => {
      it('should validate cleanup commands with valid values', () => {
        // Test validates cleanup commands with valid command strings
        const config = {
          cleanupCommands: [
            'apt-get clean',
            'rm -rf /var/lib/apt/lists/*',
            'rm -rf /tmp/*',
            'rm -rf /var/tmp/*',
          ],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.cleanupCommands).toEqual(config.cleanupCommands);
      });

      it('should reject cleanup commands that exceed maximum count', () => {
        // Test rejects cleanup commands that exceed 20 command limit
        const cleanupCommands = Array.from({ length: 21 }, (_, i) => `command-${i}`);

        const config = {
          cleanupCommands,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Maximum 20 cleanup commands allowed');
      });

      it('should reject empty cleanup commands', () => {
        // Test rejects empty cleanup commands in the array
        const config = {
          cleanupCommands: ['apt-get clean', ''],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('is not allowed to be empty');
      });

      it('should reject cleanup commands that exceed maximum length', () => {
        // Test rejects cleanup commands that exceed 200 character limit
        const config = {
          cleanupCommands: ['apt-get clean', 'a'.repeat(201)],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Cleanup command cannot exceed 200 characters');
      });

      it('should validate maximum allowed cleanup commands', () => {
        // Test validates maximum allowed cleanup commands (20)
        const cleanupCommands = Array.from({ length: 20 }, (_, i) => `command-${i}`);

        const config = {
          cleanupCommands,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.cleanupCommands).toHaveLength(20);
      });
    });

    describe('aptPackages validation', () => {
      it('should validate APT packages with valid package names', () => {
        // Test validates APT packages with valid package names
        const config = {
          aptPackages: ['nginx', 'php8.3-fpm', 'php8.3-mbstring', 'php8.3-xml', 'php8.3-curl'],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.aptPackages).toEqual(config.aptPackages);
      });

      it('should reject APT packages that exceed maximum count', () => {
        // Test rejects APT packages that exceed 100 package limit
        const aptPackages = Array.from({ length: 101 }, (_, i) => `package-${i}`);

        const config = {
          aptPackages,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Maximum 100 APT packages allowed');
      });

      it('should reject empty APT package names', () => {
        // Test rejects empty APT package names in the array
        const config = {
          aptPackages: ['nginx', '', 'php8.3-fpm'],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('is not allowed to be empty');
      });

      it('should reject APT package names that exceed maximum length', () => {
        // Test rejects APT package names that exceed 100 character limit
        const config = {
          aptPackages: ['nginx', 'a'.repeat(101)],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Package name cannot exceed 100 characters');
      });

      it('should validate maximum allowed APT packages', () => {
        // Test validates maximum allowed APT packages (100)
        const aptPackages = Array.from({ length: 100 }, (_, i) => `package-${i}`);

        const config = {
          aptPackages,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.aptPackages).toHaveLength(100);
      });
    });

    describe('aptRepositories validation', () => {
      it('should validate APT repositories with valid repository identifiers', () => {
        // Test validates APT repositories with valid repository identifiers
        const config = {
          aptRepositories: [
            'ppa:ondrej/php',
            'ppa:nginx/stable',
            'deb http://archive.ubuntu.com/ubuntu/ focal main',
          ],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.aptRepositories).toEqual(config.aptRepositories);
      });

      it('should reject APT repositories that exceed maximum count', () => {
        // Test rejects APT repositories that exceed 10 repository limit
        const aptRepositories = Array.from({ length: 11 }, (_, i) => `ppa:repo-${i}/package`);

        const config = {
          aptRepositories,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Maximum 10 APT repositories allowed');
      });

      it('should reject empty APT repository identifiers', () => {
        // Test rejects empty APT repository identifiers in the array
        const config = {
          aptRepositories: ['ppa:ondrej/php', ''],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('is not allowed to be empty');
      });

      it('should reject APT repository identifiers that exceed maximum length', () => {
        // Test rejects APT repository identifiers that exceed 500 character limit
        const config = {
          aptRepositories: ['ppa:ondrej/php', 'a'.repeat(501)],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Repository URL cannot exceed 500 characters');
      });

      it('should validate maximum allowed APT repositories', () => {
        // Test validates maximum allowed APT repositories (10)
        const aptRepositories = Array.from({ length: 10 }, (_, i) => `ppa:repo-${i}/package`);

        const config = {
          aptRepositories,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.aptRepositories).toHaveLength(10);
      });
    });

    describe('aptKeys validation', () => {
      it('should validate APT keys with valid key URLs', () => {
        // Test validates APT keys with valid key URLs
        const config = {
          aptKeys: [
            'https://packages.sury.org/php/apt.gpg',
            'https://nginx.org/keys/nginx_signing.key',
          ],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.aptKeys).toEqual(config.aptKeys);
      });

      it('should reject APT keys that exceed maximum count', () => {
        // Test rejects APT keys that exceed 20 key limit
        const aptKeys = Array.from({ length: 21 }, (_, i) => `https://key-${i}.gpg`);

        const config = {
          aptKeys,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Maximum 20 APT keys allowed');
      });

      it('should reject empty APT key URLs', () => {
        // Test rejects empty APT key URLs in the array
        const config = {
          aptKeys: ['https://packages.sury.org/php/apt.gpg', ''],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('is not allowed to be empty');
      });

      it('should reject APT key URLs that exceed maximum length', () => {
        // Test rejects APT key URLs that exceed 100 character limit
        const config = {
          aptKeys: ['https://packages.sury.org/php/apt.gpg', 'a'.repeat(101)],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('APT key cannot exceed 100 characters');
      });

      it('should validate maximum allowed APT keys', () => {
        // Test validates maximum allowed APT keys (20)
        const aptKeys = Array.from({ length: 20 }, (_, i) => `https://key-${i}.gpg`);

        const config = {
          aptKeys,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.aptKeys).toHaveLength(20);
      });
    });

    describe('aptSources validation', () => {
      it('should validate APT sources with valid source lines', () => {
        // Test validates APT sources with valid source lines
        const config = {
          aptSources: [
            'deb https://packages.sury.org/php/ ubuntu focal main',
            'deb-src https://packages.sury.org/php/ ubuntu focal main',
            'deb http://archive.ubuntu.com/ubuntu/ focal main restricted',
          ],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.aptSources).toEqual(config.aptSources);
      });

      it('should reject APT sources that exceed maximum count', () => {
        // Test rejects APT sources that exceed 20 source limit
        const aptSources = Array.from(
          { length: 21 },
          (_, i) => `deb http://source-${i}.com/ ubuntu focal main`
        );

        const config = {
          aptSources,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('Maximum 20 APT sources allowed');
      });

      it('should reject empty APT source lines', () => {
        // Test rejects empty APT source lines in the array
        const config = {
          aptSources: ['deb https://packages.sury.org/php/ ubuntu focal main', ''],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('is not allowed to be empty');
      });

      it('should reject APT source lines that exceed maximum length', () => {
        // Test rejects APT source lines that exceed 500 character limit
        const config = {
          aptSources: ['deb https://packages.sury.org/php/ ubuntu focal main', 'a'.repeat(501)],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('APT source cannot exceed 500 characters');
      });

      it('should validate maximum allowed APT sources', () => {
        // Test validates maximum allowed APT sources (20)
        const aptSources = Array.from(
          { length: 20 },
          (_, i) => `deb http://source-${i}.com/ ubuntu focal main`
        );

        const config = {
          aptSources,
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.aptSources).toHaveLength(20);
      });
    });

    describe('combined validation', () => {
      it('should validate Ubuntu configuration with all fields at maximum limits', () => {
        // Test validates Ubuntu configuration with all fields at their maximum limits
        const config = {
          cleanupCommands: Array.from({ length: 20 }, (_, i) => `command-${i}`),
          aptPackages: Array.from({ length: 100 }, (_, i) => `package-${i}`),
          aptRepositories: Array.from({ length: 10 }, (_, i) => `ppa:repo-${i}/package`),
          aptKeys: Array.from({ length: 20 }, (_, i) => `https://key-${i}.gpg`),
          aptSources: Array.from(
            { length: 20 },
            (_, i) => `deb http://source-${i}.com/ ubuntu focal main`
          ),
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value).toEqual(config);
      });

      it('should validate Ubuntu configuration with mixed field combinations', () => {
        // Test validates Ubuntu configuration with various combinations of fields
        const config = {
          cleanupCommands: ['apt-get clean'],
          aptPackages: ['nginx', 'php8.3-fpm'],
          aptRepositories: ['ppa:ondrej/php'],
          aptKeys: ['https://packages.sury.org/php/apt.gpg'],
          // aptSources is omitted
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.cleanupCommands).toEqual(config.cleanupCommands);
        expect(result.value.aptPackages).toEqual(config.aptPackages);
        expect(result.value.aptRepositories).toEqual(config.aptRepositories);
        expect(result.value.aptKeys).toEqual(config.aptKeys);
        expect(result.value.aptSources).toBeUndefined();
      });

      it('should validate Ubuntu configuration with only cleanup commands and APT packages', () => {
        // Test validates Ubuntu configuration with only cleanup commands and APT packages
        const config = {
          cleanupCommands: ['apt-get clean', 'rm -rf /var/lib/apt/lists/*'],
          aptPackages: ['nginx', 'php8.3-fpm', 'php8.3-mbstring'],
        };

        const result = ubuntuConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.cleanupCommands).toEqual(config.cleanupCommands);
        expect(result.value.aptPackages).toEqual(config.aptPackages);
        expect(result.value.aptRepositories).toBeUndefined();
        expect(result.value.aptKeys).toBeUndefined();
        expect(result.value.aptSources).toBeUndefined();
      });
    });
  });
});
