/**
 * s6-overlay Configuration Validator
 *
 * This module contains Joi validation schemas for s6-overlay configuration.
 */

import Joi from 'joi';

/**
 * s6-overlay configuration validation schema
 * Validates process supervision and service management
 */
export const s6OverlayConfigSchema = Joi.object({
  services: Joi.array().items(Joi.string().min(1).max(50)).min(1).max(20).required().messages({
    'array.base': 'services must be an array',
    'array.min': 'At least one service is required',
    'array.max': 'Maximum 20 services allowed',
    'string.min': 'Service name cannot be empty',
    'string.max': 'Service name cannot exceed 50 characters',
    'any.required': 'services are required',
  }),
  crontab: Joi.array().items(Joi.string().min(1).max(200)).max(50).required().messages({
    'array.base': 'crontab must be an array',
    'array.max': 'Maximum 50 crontab entries allowed',
    'string.min': 'Crontab entry cannot be empty',
    'string.max': 'Crontab entry cannot exceed 200 characters',
    'any.required': 'crontab is required',
  }),
  options: Joi.object({
    logging: Joi.boolean().optional().messages({
      'boolean.base': 'logging must be a boolean',
    }),
    logLevel: Joi.string().valid('debug', 'info', 'warn', 'error').optional().messages({
      'any.only': 'logLevel must be one of: debug, info, warn, error',
    }),
    notifications: Joi.boolean().optional().messages({
      'boolean.base': 'notifications must be a boolean',
    }),
  }).optional(),
}).required();
