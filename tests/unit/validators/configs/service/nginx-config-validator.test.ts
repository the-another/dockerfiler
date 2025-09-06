/**
 * Nginx Configuration Validator Unit Tests
 *
 * This module contains unit tests for Nginx configuration validation schemas.
 * Tests cover Nginx worker settings, SSL configuration, and advanced options validation.
 */

import { describe, it, expect } from 'vitest';
import { nginxConfigSchema } from '@/validators';

describe('Nginx Configuration Validator', () => {
  describe('nginxConfigSchema', () => {
    const createValidNginxConfig = () => ({
      workerProcesses: 'auto',
      workerConnections: 1024,
      gzip: true,
      ssl: false,
    });

    it('should validate complete Nginx configuration', () => {
      // Test validates complete Nginx configuration with all required fields
      const config = createValidNginxConfig();
      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate Nginx configuration with numeric worker processes', () => {
      // Test validates Nginx configuration with numeric worker processes
      const config = {
        ...createValidNginxConfig(),
        workerProcesses: '4',
      };

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.workerProcesses).toBe('4');
    });

    it('should validate Nginx configuration with auto worker processes', () => {
      // Test validates Nginx configuration with auto worker processes
      const config = {
        ...createValidNginxConfig(),
        workerProcesses: 'auto',
      };

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.workerProcesses).toBe('auto');
    });

    it('should reject invalid worker processes values', () => {
      // Test rejects invalid worker processes values with appropriate error messages
      const invalidValues = ['invalid', 'auto2', '-1'];

      invalidValues.forEach(value => {
        const config = {
          ...createValidNginxConfig(),
          workerProcesses: value,
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('workerProcesses must be "auto" or a number');
      });
    });

    it('should require worker processes field', () => {
      // Test requires worker processes field to be present
      const config = createValidNginxConfig();
      delete (config as any).workerProcesses;

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('workerProcesses is required');
    });

    it('should validate worker connections with valid values', () => {
      // Test validates worker connections with valid integer values
      const validValues = [1, 100, 1024, 4096, 65535];

      validValues.forEach(value => {
        const config = {
          ...createValidNginxConfig(),
          workerConnections: value,
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.workerConnections).toBe(value);
      });
    });

    it('should reject worker connections below minimum value', () => {
      // Test rejects worker connections below minimum value (1)
      const config = {
        ...createValidNginxConfig(),
        workerConnections: 0,
      };

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('workerConnections must be at least 1');
    });

    it('should reject worker connections above maximum value', () => {
      // Test rejects worker connections above maximum value (65535)
      const config = {
        ...createValidNginxConfig(),
        workerConnections: 65536,
      };

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('workerConnections must not exceed 65535');
    });

    it('should reject non-integer worker connections', () => {
      // Test rejects non-integer worker connections
      const config = {
        ...createValidNginxConfig(),
        workerConnections: 1024.5,
      };

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('workerConnections must be an integer');
    });

    it('should require worker connections field', () => {
      // Test requires worker connections field to be present
      const config = createValidNginxConfig();
      delete (config as any).workerConnections;

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('workerConnections is required');
    });

    it('should validate gzip configuration as boolean', () => {
      // Test validates gzip configuration as boolean value
      const config = {
        ...createValidNginxConfig(),
        gzip: false,
      };

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.gzip).toBe(false);
    });

    it('should reject gzip as non-boolean', () => {
      // Test rejects gzip as non-boolean value
      const config = {
        ...createValidNginxConfig(),
        gzip: 123 as any,
      };

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('gzip must be a boolean');
    });

    it('should require gzip field', () => {
      // Test requires gzip field to be present
      const config = createValidNginxConfig();
      delete (config as any).gzip;

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('gzip is required');
    });

    it('should validate SSL configuration as boolean', () => {
      // Test validates SSL configuration as boolean value
      const config = {
        ...createValidNginxConfig(),
        ssl: true,
      };

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.ssl).toBe(true);
    });

    it('should reject SSL as non-boolean', () => {
      // Test rejects SSL as non-boolean value
      const config = {
        ...createValidNginxConfig(),
        ssl: 456 as any,
      };

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('ssl must be a boolean');
    });

    it('should require SSL field', () => {
      // Test requires SSL field to be present
      const config = createValidNginxConfig();
      delete (config as any).ssl;

      const result = nginxConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('ssl is required');
    });

    describe('options validation', () => {
      it('should validate Nginx configuration with options', () => {
        // Test validates Nginx configuration with optional settings
        const config = {
          ...createValidNginxConfig(),
          options: {
            clientMaxBodySize: '10M',
            proxyTimeout: {
              connect: '30s',
              send: '60s',
              read: '60s',
            },
            rateLimit: {
              enabled: true,
              requests: 100,
              window: '1m',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options).toEqual(config.options);
      });

      it('should validate clientMaxBodySize with valid formats', () => {
        // Test validates clientMaxBodySize with valid size formats
        const validSizes = ['1M', '10M', '100M', '1G', '1024', '2048K'];

        validSizes.forEach(size => {
          const config = {
            ...createValidNginxConfig(),
            options: {
              clientMaxBodySize: size,
            },
          };

          const result = nginxConfigSchema.validate(config);

          expect(result.error).toBeUndefined();
          expect(result.value.options?.clientMaxBodySize).toBe(size);
        });
      });

      it('should reject clientMaxBodySize with invalid formats', () => {
        // Test rejects clientMaxBodySize with invalid size formats
        const invalidSizes = ['1MB', '10GB', 'invalid', '1.5M'];

        invalidSizes.forEach(size => {
          const config = {
            ...createValidNginxConfig(),
            options: {
              clientMaxBodySize: size,
            },
          };

          const result = nginxConfigSchema.validate(config);

          expect(result.error).toBeDefined();
          expect(result.error!.message).toContain('clientMaxBodySize must be a valid size');
        });
      });

      it('should validate proxy timeout configurations', () => {
        // Test validates proxy timeout configurations with valid duration formats
        const config = {
          ...createValidNginxConfig(),
          options: {
            proxyTimeout: {
              connect: '30s',
              send: '60s',
              read: '60s',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options?.proxyTimeout).toEqual(config.options.proxyTimeout);
      });

      it('should validate proxy timeout with different duration formats', () => {
        // Test validates proxy timeout with different duration formats
        const config = {
          ...createValidNginxConfig(),
          options: {
            proxyTimeout: {
              connect: '30',
              send: '1m',
              read: '1h',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options?.proxyTimeout).toEqual(config.options.proxyTimeout);
      });

      it('should reject proxy timeout with invalid duration formats', () => {
        // Test rejects proxy timeout with invalid duration formats
        const config = {
          ...createValidNginxConfig(),
          options: {
            proxyTimeout: {
              connect: '30sec',
              send: '1min',
              read: '1hour',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('timeout must be a valid duration');
      });

      it('should validate rate limit configuration', () => {
        // Test validates rate limit configuration with valid settings
        const config = {
          ...createValidNginxConfig(),
          options: {
            rateLimit: {
              enabled: true,
              requests: 100,
              window: '1m',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options?.rateLimit).toEqual(config.options.rateLimit);
      });

      it('should validate rate limit with different window formats', () => {
        // Test validates rate limit with different window duration formats
        const config = {
          ...createValidNginxConfig(),
          options: {
            rateLimit: {
              enabled: false,
              requests: 1000,
              window: '1h',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options?.rateLimit).toEqual(config.options.rateLimit);
      });

      it('should reject rate limit with invalid enabled value', () => {
        // Test rejects rate limit with invalid enabled value
        const config = {
          ...createValidNginxConfig(),
          options: {
            rateLimit: {
              enabled: 789 as any,
              requests: 100,
              window: '1m',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('rateLimit.enabled must be a boolean');
      });

      it('should require rate limit enabled field', () => {
        // Test requires rate limit enabled field to be present
        const config = {
          ...createValidNginxConfig(),
          options: {
            rateLimit: {
              requests: 100,
              window: '1m',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('rateLimit.enabled is required');
      });

      it('should reject rate limit requests below minimum', () => {
        // Test rejects rate limit requests below minimum value (1)
        const config = {
          ...createValidNginxConfig(),
          options: {
            rateLimit: {
              enabled: true,
              requests: 0,
              window: '1m',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('rateLimit.requests must be at least 1');
      });

      it('should reject rate limit requests above maximum', () => {
        // Test rejects rate limit requests above maximum value (10000)
        const config = {
          ...createValidNginxConfig(),
          options: {
            rateLimit: {
              enabled: true,
              requests: 10001,
              window: '1m',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('rateLimit.requests must not exceed 10000');
      });

      it('should reject rate limit window with invalid format', () => {
        // Test rejects rate limit window with invalid duration format
        const config = {
          ...createValidNginxConfig(),
          options: {
            rateLimit: {
              enabled: true,
              requests: 100,
              window: '1min',
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('rateLimit.window must be a valid duration');
      });

      it('should require rate limit window field', () => {
        // Test requires rate limit window field to be present
        const config = {
          ...createValidNginxConfig(),
          options: {
            rateLimit: {
              enabled: true,
              requests: 100,
            },
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('rateLimit.window is required');
      });

      it('should handle undefined options gracefully', () => {
        // Test handles undefined options gracefully without validation errors
        const config = createValidNginxConfig();
        // options is undefined by default

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options).toBeUndefined();
      });

      it('should handle null options gracefully', () => {
        // Test handles null options gracefully without validation errors
        const config = {
          ...createValidNginxConfig(),
          options: null,
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('must be of type object');
      });

      it('should validate partial options configuration', () => {
        // Test validates partial options configuration with only some fields
        const config = {
          ...createValidNginxConfig(),
          options: {
            clientMaxBodySize: '10M',
            // proxyTimeout and rateLimit are omitted
          },
        };

        const result = nginxConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options?.clientMaxBodySize).toBe('10M');
        expect(result.value.options?.proxyTimeout).toBeUndefined();
        expect(result.value.options?.rateLimit).toBeUndefined();
      });
    });
  });
});
