/**
 * Base Configuration Validator
 *
 * This module contains Joi validation schemas for base configuration.
 */

import Joi from 'joi';
import { phpConfigSchema } from '../service/php-config-validator';
import { securityConfigSchema } from '../service/security-config-validator';
import { nginxConfigSchema } from '../service/nginx-config-validator';
import { s6OverlayConfigSchema } from '../service/s6-overlay-config-validator';

/**
 * Base configuration validation schema
 * Validates the complete base configuration structure
 */
export const baseConfigSchema = Joi.object({
  php: phpConfigSchema,
  security: securityConfigSchema,
  nginx: nginxConfigSchema,
  s6Overlay: s6OverlayConfigSchema,
  metadata: Joi.object({
    version: Joi.string().min(1).max(20).optional().messages({
      'string.min': 'metadata.version cannot be empty',
      'string.max': 'metadata.version cannot exceed 20 characters',
    }),
    description: Joi.string().min(1).max(500).optional().messages({
      'string.min': 'metadata.description cannot be empty',
      'string.max': 'metadata.description cannot exceed 500 characters',
    }),
    author: Joi.string().min(1).max(100).optional().messages({
      'string.min': 'metadata.author cannot be empty',
      'string.max': 'metadata.author cannot exceed 100 characters',
    }),
    lastUpdated: Joi.string().isoDate().optional().messages({
      'string.isoDate': 'metadata.lastUpdated must be a valid ISO date',
    }),
  }).optional(),
}).required();
