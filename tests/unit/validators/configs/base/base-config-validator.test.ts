/**
 * Base Configuration Validator Unit Tests
 *
 * This module contains unit tests for base configuration validation schemas.
 * Tests cover base configuration structure, metadata validation, and service integration.
 */

import { describe, it, expect } from 'vitest';
import { baseConfigSchema } from '@/validators';

describe('Base Configuration Validator', () => {
  const createValidBaseConfig = () => ({
    php: {
      version: '8.3',
      extensions: ['mbstring', 'xml', 'curl'],
      fpm: {
        maxChildren: 50,
        startServers: 5,
        minSpareServers: 5,
        maxSpareServers: 35,
      },
      options: {
        memoryLimit: '256M',
        maxExecutionTime: 30,
        uploadMaxFilesize: '10M',
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
      ssl: false,
    },
    s6Overlay: {
      services: ['nginx', 'php-fpm'],
      crontab: ['0 2 * * * /usr/local/bin/cleanup.sh'],
    },
  });

  describe('baseConfigSchema', () => {
    it('should validate complete base configuration', () => {
      // Test validates complete base configuration with all required fields
      const config = createValidBaseConfig();
      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate base configuration with metadata', () => {
      // Test validates base configuration with optional metadata fields
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        metadata: {
          version: '1.0.0',
          description: 'Base configuration for web server setup',
          author: 'Dockerfile Generator',
          lastUpdated: '2024-01-01T00:00:00.000Z',
        },
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.metadata).toEqual(config.metadata);
    });

    it('should validate base configuration with minimal metadata', () => {
      // Test validates base configuration with minimal metadata
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        metadata: {
          version: '1.0',
        },
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.metadata?.version).toBe('1.0');
    });

    it('should reject empty metadata fields', () => {
      // Test rejects empty metadata fields with appropriate error messages
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        metadata: {
          version: '',
          description: '',
          author: '',
        },
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is not allowed');
    });

    it('should reject metadata fields that exceed maximum length', () => {
      // Test rejects metadata fields that exceed maximum allowed length
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        metadata: {
          version: 'a'.repeat(21), // Exceeds 20 character limit
          description: 'a'.repeat(501), // Exceeds 500 character limit
          author: 'a'.repeat(101), // Exceeds 100 character limit
        },
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('cannot exceed 20 characters');
    });

    it('should reject invalid ISO date format', () => {
      // Test rejects invalid ISO date format in lastUpdated field
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        metadata: {
          lastUpdated: 'invalid-date', // Invalid ISO date format
        },
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('must be a valid ISO date');
    });

    it('should accept valid ISO date format', () => {
      // Test accepts valid ISO date format in lastUpdated field
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        metadata: {
          lastUpdated: '2024-01-01T12:30:45.123Z',
        },
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.metadata?.lastUpdated).toBe('2024-01-01T12:30:45.123Z');
    });

    it('should require all service configurations', () => {
      // Test requires all service configurations to be present
      const config = createValidBaseConfig();
      delete (config as any).php;

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('required');
    });

    it('should validate service configurations through their schemas', () => {
      // Test validates service configurations through their respective schemas
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        php: {
          ...baseConfig.php,
          version: 'invalid' as any,
        },
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('must be one of:');
    });

    it('should handle undefined metadata gracefully', () => {
      // Test handles undefined metadata gracefully without validation errors
      const config = createValidBaseConfig();
      // metadata is undefined by default

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.metadata).toBeUndefined();
    });

    it('should handle null metadata gracefully', () => {
      // Test handles null metadata gracefully without validation errors
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        metadata: null,
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('must be of type object');
    });

    it('should validate metadata with all optional fields', () => {
      // Test validates metadata with all optional fields present
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        metadata: {
          version: '2.0.0',
          description: 'Updated base configuration with enhanced security',
          author: 'Development Team',
          lastUpdated: '2024-12-01T10:15:30.000Z',
        },
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.metadata).toEqual(config.metadata);
    });

    it('should reject non-object metadata', () => {
      // Test rejects non-object metadata with appropriate error message
      const baseConfig = createValidBaseConfig();
      const config = {
        ...baseConfig,
        metadata: 'invalid',
      };

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('must be of type object');
    });

    it('should validate base configuration without any metadata', () => {
      // Test validates base configuration without any metadata fields
      const config = createValidBaseConfig();

      const result = baseConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });
  });
});
