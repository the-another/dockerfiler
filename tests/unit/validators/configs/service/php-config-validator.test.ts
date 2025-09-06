/**
 * PHP Configuration Validator Unit Tests
 *
 * This module contains unit tests for PHP configuration validation schemas.
 * Tests cover PHP version, extensions, FPM settings, and options validation.
 */

import { describe, it, expect } from 'vitest';
import { phpConfigSchema, phpFpmConfigSchema, phpVersionSchema } from '@/validators';
import { PHPVersion } from '@/types';

describe('PHP Configuration Validator', () => {
  describe('phpVersionSchema', () => {
    it('should validate supported PHP versions', () => {
      // Test validates all supported PHP versions successfully
      Object.values(PHPVersion).forEach(version => {
        const result = phpVersionSchema.validate(version);
        expect(result.error).toBeUndefined();
        expect(result.value).toBe(version);
      });
    });

    it('should reject invalid PHP versions', () => {
      // Test rejects invalid PHP versions with appropriate error messages
      const invalidVersions = ['7.3', '8.5', '9.0', 'invalid', ''];

      invalidVersions.forEach(version => {
        const result = phpVersionSchema.validate(version);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('must be one of:');
      });
    });

    it('should require PHP version to be present', () => {
      // Test requires PHP version to be present
      const result = phpVersionSchema.validate(undefined);
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('required');
    });
  });

  describe('phpFpmConfigSchema', () => {
    const validFpmConfig = {
      maxChildren: 50,
      startServers: 5,
      minSpareServers: 5,
      maxSpareServers: 35,
    };

    it('should validate valid FPM configuration', () => {
      // Test validates valid FPM configuration successfully
      const result = phpFpmConfigSchema.validate(validFpmConfig);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validFpmConfig);
    });

    it('should validate FPM configuration with optional fields', () => {
      // Test validates FPM configuration with optional fields
      const configWithOptional = {
        ...validFpmConfig,
        maxRequests: 1000,
        processIdleTimeout: 300,
      };

      const result = phpFpmConfigSchema.validate(configWithOptional);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(configWithOptional);
    });

    it('should reject invalid maxChildren values', () => {
      // Test rejects invalid maxChildren values
      const invalidValues = [0, -1, 1001, 'invalid', null];

      invalidValues.forEach(value => {
        const config = { ...validFpmConfig, maxChildren: value };
        const result = phpFpmConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('maxChildren');
      });
    });

    it('should reject invalid startServers values', () => {
      // Test rejects invalid startServers values
      const invalidValues = [0, -1, 101, 'invalid', null];

      invalidValues.forEach(value => {
        const config = { ...validFpmConfig, startServers: value };
        const result = phpFpmConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('startServers');
      });
    });

    it('should reject invalid minSpareServers values', () => {
      // Test rejects invalid minSpareServers values
      const invalidValues = [0, -1, 101, 'invalid', null];

      invalidValues.forEach(value => {
        const config = { ...validFpmConfig, minSpareServers: value };
        const result = phpFpmConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('minSpareServers');
      });
    });

    it('should reject invalid maxSpareServers values', () => {
      // Test rejects invalid maxSpareServers values
      const invalidValues = [0, -1, 101, 'invalid', null];

      invalidValues.forEach(value => {
        const config = { ...validFpmConfig, maxSpareServers: value };
        const result = phpFpmConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('maxSpareServers');
      });
    });

    it('should reject invalid maxRequests values', () => {
      // Test rejects invalid maxRequests values
      const invalidValues = [0, -1, 100001, 'invalid'];

      invalidValues.forEach(value => {
        const config = { ...validFpmConfig, maxRequests: value };
        const result = phpFpmConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('maxRequests');
      });
    });

    it('should reject invalid processIdleTimeout values', () => {
      // Test rejects invalid processIdleTimeout values
      const invalidValues = [0, -1, 3601, 'invalid'];

      invalidValues.forEach(value => {
        const config = { ...validFpmConfig, processIdleTimeout: value };
        const result = phpFpmConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('processIdleTimeout');
      });
    });

    it('should require all mandatory FPM fields', () => {
      // Test requires all mandatory FPM configuration fields
      const requiredFields = ['maxChildren', 'startServers', 'minSpareServers', 'maxSpareServers'];

      requiredFields.forEach(field => {
        const config = { ...validFpmConfig };
        delete config[field as keyof typeof config];
        const result = phpFpmConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain(field);
        expect(result.error!.message).toContain('required');
      });
    });
  });

  describe('phpConfigSchema', () => {
    const validPhpConfig = {
      version: '8.3',
      extensions: ['mbstring', 'xml', 'curl'],
      fpm: {
        maxChildren: 50,
        startServers: 5,
        minSpareServers: 5,
        maxSpareServers: 35,
      },
    };

    it('should validate valid PHP configuration', () => {
      // Test validates valid PHP configuration successfully
      const result = phpConfigSchema.validate(validPhpConfig);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validPhpConfig);
    });

    it('should validate PHP configuration with options', () => {
      // Test validates PHP configuration with optional settings
      const configWithOptions = {
        ...validPhpConfig,
        options: {
          memoryLimit: '128M',
          maxExecutionTime: 30,
          maxInputTime: 60,
          uploadMaxFilesize: '2M',
          maxFileUploads: 20,
        },
      };

      const result = phpConfigSchema.validate(configWithOptions);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(configWithOptions);
    });

    it('should reject empty extensions array', () => {
      // Test rejects empty extensions array
      const config = { ...validPhpConfig, extensions: [] };
      const result = phpConfigSchema.validate(config);
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('At least one PHP extension is required');
    });

    it('should reject too many extensions', () => {
      // Test rejects too many extensions
      const manyExtensions = Array.from({ length: 51 }, (_, i) => `extension${i}`);
      const config = { ...validPhpConfig, extensions: manyExtensions };
      const result = phpConfigSchema.validate(config);
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Maximum 50 PHP extensions allowed');
    });

    it('should reject empty extension names', () => {
      // Test rejects empty extension names
      const config = { ...validPhpConfig, extensions: ['mbstring', '', 'curl'] };
      const result = phpConfigSchema.validate(config);
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is not allowed to be empty');
    });

    it('should reject extension names that are too long', () => {
      // Test rejects extension names that exceed maximum length
      const longExtension = 'a'.repeat(51);
      const config = { ...validPhpConfig, extensions: [longExtension] };
      const result = phpConfigSchema.validate(config);
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Extension name cannot exceed 50 characters');
    });

    it('should validate memory limit format', () => {
      // Test validates memory limit format
      const validMemoryLimits = ['128M', '512K', '1G', '1024'];
      const invalidMemoryLimits = ['128MB', 'invalid', '1.5G'];

      validMemoryLimits.forEach(limit => {
        const config = {
          ...validPhpConfig,
          options: { memoryLimit: limit },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeUndefined();
      });

      invalidMemoryLimits.forEach(limit => {
        const config = {
          ...validPhpConfig,
          options: { memoryLimit: limit },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('memoryLimit');
      });
    });

    it('should validate maxExecutionTime range', () => {
      // Test validates maxExecutionTime within valid range
      const validTimes = [0, 30, 300, 3600];
      const invalidTimes = [-1, 3601, 'invalid'];

      validTimes.forEach(time => {
        const config = {
          ...validPhpConfig,
          options: { maxExecutionTime: time },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeUndefined();
      });

      invalidTimes.forEach(time => {
        const config = {
          ...validPhpConfig,
          options: { maxExecutionTime: time },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('maxExecutionTime');
      });
    });

    it('should validate maxInputTime range', () => {
      // Test validates maxInputTime within valid range
      const validTimes = [0, 30, 300, 3600];
      const invalidTimes = [-1, 3601, 'invalid'];

      validTimes.forEach(time => {
        const config = {
          ...validPhpConfig,
          options: { maxInputTime: time },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeUndefined();
      });

      invalidTimes.forEach(time => {
        const config = {
          ...validPhpConfig,
          options: { maxInputTime: time },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('maxInputTime');
      });
    });

    it('should validate uploadMaxFilesize format', () => {
      // Test validates uploadMaxFilesize format
      const validSizes = ['2M', '10M', '100K', '1G'];
      const invalidSizes = ['2MB', 'invalid', '1.5G'];

      validSizes.forEach(size => {
        const config = {
          ...validPhpConfig,
          options: { uploadMaxFilesize: size },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeUndefined();
      });

      invalidSizes.forEach(size => {
        const config = {
          ...validPhpConfig,
          options: { uploadMaxFilesize: size },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('uploadMaxFilesize');
      });
    });

    it('should validate maxFileUploads range', () => {
      // Test validates maxFileUploads within valid range
      const validCounts = [1, 10, 50, 100];
      const invalidCounts = [0, 101, -1, 'invalid'];

      validCounts.forEach(count => {
        const config = {
          ...validPhpConfig,
          options: { maxFileUploads: count },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeUndefined();
      });

      invalidCounts.forEach(count => {
        const config = {
          ...validPhpConfig,
          options: { maxFileUploads: count },
        };
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('maxFileUploads');
      });
    });

    it('should require all mandatory PHP configuration fields', () => {
      // Test requires all mandatory PHP configuration fields
      const requiredFields = ['version', 'extensions', 'fpm'];

      requiredFields.forEach(field => {
        const config = { ...validPhpConfig };
        delete config[field as keyof typeof config];
        const result = phpConfigSchema.validate(config);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain(field);
        expect(result.error!.message).toContain('required');
      });
    });

    it('should handle missing options gracefully', () => {
      // Test handles missing options gracefully
      const result = phpConfigSchema.validate(validPhpConfig);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validPhpConfig);
    });
  });
});
