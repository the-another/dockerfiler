/**
 * s6-overlay Configuration Validator Unit Tests
 *
 * This module contains unit tests for s6-overlay configuration validation schemas.
 * Tests cover service management, crontab configuration, and logging options validation.
 */

import { describe, it, expect } from 'vitest';
import { s6OverlayConfigSchema } from '@/validators';

describe('s6-overlay Configuration Validator', () => {
  describe('s6OverlayConfigSchema', () => {
    const createValidS6OverlayConfig = () => ({
      services: ['nginx', 'php-fpm'],
      crontab: ['0 2 * * * /usr/local/bin/cleanup.sh'],
    });

    it('should validate complete s6-overlay configuration', () => {
      // Test validates complete s6-overlay configuration with all required fields
      const config = createValidS6OverlayConfig();
      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(config);
    });

    it('should validate s6-overlay configuration with options', () => {
      // Test validates s6-overlay configuration with optional settings
      const config = {
        ...createValidS6OverlayConfig(),
        options: {
          logging: true,
          logLevel: 'info',
          notifications: false,
        },
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.options).toEqual(config.options);
    });

    it('should validate s6-overlay configuration with minimal options', () => {
      // Test validates s6-overlay configuration with minimal optional settings
      const config = {
        ...createValidS6OverlayConfig(),
        options: {
          logging: false,
        },
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.options).toEqual(config.options);
    });

    it('should require services field', () => {
      // Test requires services field to be present
      const config = createValidS6OverlayConfig();
      delete (config as any).services;

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('services are required');
    });

    it('should require at least one service', () => {
      // Test requires at least one service in the services array
      const config = {
        ...createValidS6OverlayConfig(),
        services: [],
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('At least one service is required');
    });

    it('should reject services array with more than 20 items', () => {
      // Test rejects services array with more than 20 service limit
      const services = Array.from({ length: 21 }, (_, i) => `service-${i}`);

      const config = {
        ...createValidS6OverlayConfig(),
        services,
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Maximum 20 services allowed');
    });

    it('should reject empty service names', () => {
      // Test rejects empty service names in the services array
      const config = {
        ...createValidS6OverlayConfig(),
        services: ['nginx', '', 'php-fpm'],
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is not allowed to be empty');
    });

    it('should reject service names that exceed maximum length', () => {
      // Test rejects service names that exceed 50 character limit
      const config = {
        ...createValidS6OverlayConfig(),
        services: ['nginx', 'a'.repeat(51)],
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Service name cannot exceed 50 characters');
    });

    it('should validate maximum allowed services', () => {
      // Test validates maximum allowed services (20)
      const services = Array.from({ length: 20 }, (_, i) => `service-${i}`);

      const config = {
        ...createValidS6OverlayConfig(),
        services,
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.services).toHaveLength(20);
    });

    it('should validate services with valid names', () => {
      // Test validates services with valid service names
      const config = {
        ...createValidS6OverlayConfig(),
        services: ['nginx', 'php-fpm', 'redis', 'mysql', 'postgresql'],
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.services).toEqual(config.services);
    });

    it('should require crontab field', () => {
      // Test requires crontab field to be present
      const config = createValidS6OverlayConfig();
      delete (config as any).crontab;

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('crontab is required');
    });

    it('should validate crontab with valid entries', () => {
      // Test validates crontab with valid cron entries
      const config = {
        ...createValidS6OverlayConfig(),
        crontab: [
          '0 2 * * * /usr/local/bin/cleanup.sh',
          '*/5 * * * * /usr/local/bin/health-check.sh',
          '0 0 * * 0 /usr/local/bin/weekly-backup.sh',
        ],
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.crontab).toEqual(config.crontab);
    });

    it('should reject crontab array with more than 50 items', () => {
      // Test rejects crontab array with more than 50 entry limit
      const crontab = Array.from(
        { length: 51 },
        (_, i) => `0 ${i} * * * /usr/local/bin/task-${i}.sh`
      );

      const config = {
        ...createValidS6OverlayConfig(),
        crontab,
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Maximum 50 crontab entries allowed');
    });

    it('should reject empty crontab entries', () => {
      // Test rejects empty crontab entries in the array
      const config = {
        ...createValidS6OverlayConfig(),
        crontab: ['0 2 * * * /usr/local/bin/cleanup.sh', ''],
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('is not allowed to be empty');
    });

    it('should reject crontab entries that exceed maximum length', () => {
      // Test rejects crontab entries that exceed 200 character limit
      const config = {
        ...createValidS6OverlayConfig(),
        crontab: ['0 2 * * * /usr/local/bin/cleanup.sh', 'a'.repeat(201)],
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Crontab entry cannot exceed 200 characters');
    });

    it('should validate maximum allowed crontab entries', () => {
      // Test validates maximum allowed crontab entries (50)
      const crontab = Array.from(
        { length: 50 },
        (_, i) => `0 ${i} * * * /usr/local/bin/task-${i}.sh`
      );

      const config = {
        ...createValidS6OverlayConfig(),
        crontab,
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.crontab).toHaveLength(50);
    });

    it('should validate crontab with complex cron expressions', () => {
      // Test validates crontab with complex cron expressions
      const config = {
        ...createValidS6OverlayConfig(),
        crontab: [
          '0 2 * * * /usr/local/bin/cleanup.sh',
          '*/15 * * * * /usr/local/bin/health-check.sh',
          '0 0 1 * * /usr/local/bin/monthly-report.sh',
          '0 9 * * 1-5 /usr/local/bin/daily-backup.sh',
          '0 0 * * 0 /usr/local/bin/weekly-maintenance.sh',
        ],
      };

      const result = s6OverlayConfigSchema.validate(config);

      expect(result.error).toBeUndefined();
      expect(result.value.crontab).toEqual(config.crontab);
    });

    describe('options validation', () => {
      it('should validate logging option as boolean', () => {
        // Test validates logging option as boolean value
        const config = {
          ...createValidS6OverlayConfig(),
          options: {
            logging: false,
          },
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options?.logging).toBe(false);
      });

      it('should reject logging as non-boolean', () => {
        // Test rejects logging as non-boolean value
        const config = {
          ...createValidS6OverlayConfig(),
          options: {
            logging: 123 as any,
          },
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('logging must be a boolean');
      });

      it('should validate logLevel with valid values', () => {
        // Test validates logLevel with valid log level values
        const validLogLevels = ['debug', 'info', 'warn', 'error'];

        validLogLevels.forEach(level => {
          const config = {
            ...createValidS6OverlayConfig(),
            options: {
              logLevel: level,
            },
          };

          const result = s6OverlayConfigSchema.validate(config);

          expect(result.error).toBeUndefined();
          expect(result.value.options?.logLevel).toBe(level);
        });
      });

      it('should reject logLevel with invalid values', () => {
        // Test rejects logLevel with invalid log level values
        const invalidLogLevels = ['trace', 'verbose', 'critical', 'fatal', ''];

        invalidLogLevels.forEach(level => {
          const config = {
            ...createValidS6OverlayConfig(),
            options: {
              logLevel: level,
            },
          };

          const result = s6OverlayConfigSchema.validate(config);

          expect(result.error).toBeDefined();
          expect(result.error!.message).toContain(
            'logLevel must be one of: debug, info, warn, error'
          );
        });
      });

      it('should validate notifications option as boolean', () => {
        // Test validates notifications option as boolean value
        const config = {
          ...createValidS6OverlayConfig(),
          options: {
            notifications: true,
          },
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options?.notifications).toBe(true);
      });

      it('should reject notifications as non-boolean', () => {
        // Test rejects notifications as non-boolean value
        const config = {
          ...createValidS6OverlayConfig(),
          options: {
            notifications: 456 as any,
          },
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('notifications must be a boolean');
      });

      it('should validate complete options configuration', () => {
        // Test validates complete options configuration with all fields
        const config = {
          ...createValidS6OverlayConfig(),
          options: {
            logging: true,
            logLevel: 'warn',
            notifications: true,
          },
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options).toEqual(config.options);
      });

      it('should handle undefined options gracefully', () => {
        // Test handles undefined options gracefully without validation errors
        const config = createValidS6OverlayConfig();
        // options is undefined by default

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options).toBeUndefined();
      });

      it('should handle null options gracefully', () => {
        // Test handles null options gracefully without validation errors
        const config = {
          ...createValidS6OverlayConfig(),
          options: null,
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeDefined();
        expect(result.error!.message).toContain('must be of type object');
      });

      it('should validate partial options configuration', () => {
        // Test validates partial options configuration with only some fields
        const config = {
          ...createValidS6OverlayConfig(),
          options: {
            logging: true,
            // logLevel and notifications are omitted
          },
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.options?.logging).toBe(true);
        expect(result.value.options?.logLevel).toBeUndefined();
        expect(result.value.options?.notifications).toBeUndefined();
      });
    });

    describe('combined validation', () => {
      it('should validate s6-overlay configuration with all fields at maximum limits', () => {
        // Test validates s6-overlay configuration with all fields at their maximum limits
        const config = {
          services: Array.from({ length: 20 }, (_, i) => `service-${i}`),
          crontab: Array.from({ length: 50 }, (_, i) => `0 ${i} * * * /usr/local/bin/task-${i}.sh`),
          options: {
            logging: true,
            logLevel: 'debug',
            notifications: true,
          },
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value).toEqual(config);
      });

      it('should validate s6-overlay configuration with minimal required fields', () => {
        // Test validates s6-overlay configuration with minimal required fields only
        const config = {
          services: ['nginx'],
          crontab: ['0 2 * * * /usr/local/bin/cleanup.sh'],
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value).toEqual(config);
      });

      it('should validate s6-overlay configuration with single service and crontab entry', () => {
        // Test validates s6-overlay configuration with single service and crontab entry
        const config = {
          services: ['php-fpm'],
          crontab: ['*/5 * * * * /usr/local/bin/health-check.sh'],
        };

        const result = s6OverlayConfigSchema.validate(config);

        expect(result.error).toBeUndefined();
        expect(result.value.services).toEqual(['php-fpm']);
        expect(result.value.crontab).toEqual(['*/5 * * * * /usr/local/bin/health-check.sh']);
      });
    });
  });
});
