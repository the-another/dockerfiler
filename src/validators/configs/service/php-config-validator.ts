/**
 * PHP Configuration Validator
 *
 * This module contains Joi validation schemas for PHP configuration.
 */

import Joi from 'joi';
import { PHPVersion } from '@/types';

/**
 * PHP version validation schema
 * Validates against supported PHP versions
 */
export const phpVersionSchema = Joi.string()
  .valid(...Object.values(PHPVersion))
  .required()
  .messages({
    'any.only': 'PHP version must be one of: {{#valids}}',
    'any.required': 'PHP version is required',
  });

/**
 * PHP-FPM configuration validation schema
 * Validates PHP-FPM process manager settings
 */
export const phpFpmConfigSchema = Joi.object({
  maxChildren: Joi.number().integer().min(1).max(1000).required().messages({
    'number.base': 'maxChildren must be a number',
    'number.integer': 'maxChildren must be an integer',
    'number.min': 'maxChildren must be at least 1',
    'number.max': 'maxChildren must not exceed 1000',
    'any.required': 'maxChildren is required',
  }),
  startServers: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'startServers must be a number',
    'number.integer': 'startServers must be an integer',
    'number.min': 'startServers must be at least 1',
    'number.max': 'startServers must not exceed 100',
    'any.required': 'startServers is required',
  }),
  minSpareServers: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'minSpareServers must be a number',
    'number.integer': 'minSpareServers must be an integer',
    'number.min': 'minSpareServers must be at least 1',
    'number.max': 'minSpareServers must not exceed 100',
    'any.required': 'minSpareServers is required',
  }),
  maxSpareServers: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'maxSpareServers must be a number',
    'number.integer': 'maxSpareServers must be an integer',
    'number.min': 'maxSpareServers must be at least 1',
    'number.max': 'maxSpareServers must not exceed 100',
    'any.required': 'maxSpareServers is required',
  }),
  maxRequests: Joi.number().integer().min(1).max(100000).optional().messages({
    'number.base': 'maxRequests must be a number',
    'number.integer': 'maxRequests must be an integer',
    'number.min': 'maxRequests must be at least 1',
    'number.max': 'maxRequests must not exceed 100000',
  }),
  processIdleTimeout: Joi.number().integer().min(1).max(3600).optional().messages({
    'number.base': 'processIdleTimeout must be a number',
    'number.integer': 'processIdleTimeout must be an integer',
    'number.min': 'processIdleTimeout must be at least 1 second',
    'number.max': 'processIdleTimeout must not exceed 3600 seconds',
  }),
}).required();

/**
 * PHP configuration validation schema
 * Validates PHP version, extensions, and FPM settings
 */
export const phpConfigSchema = Joi.object({
  version: phpVersionSchema,
  extensions: Joi.array().items(Joi.string().min(1).max(50)).min(1).max(50).required().messages({
    'array.base': 'extensions must be an array',
    'array.min': 'At least one PHP extension is required',
    'array.max': 'Maximum 50 PHP extensions allowed',
    'string.min': 'Extension name cannot be empty',
    'string.max': 'Extension name cannot exceed 50 characters',
    'any.required': 'extensions are required',
  }),
  fpm: phpFpmConfigSchema,
  options: Joi.object({
    memoryLimit: Joi.string()
      .pattern(/^\d+[KMG]?$/)
      .optional()
      .messages({
        'string.pattern.base': 'memoryLimit must be a valid size (e.g., 128M, 512K)',
      }),
    maxExecutionTime: Joi.number().integer().min(0).max(3600).optional().messages({
      'number.base': 'maxExecutionTime must be a number',
      'number.integer': 'maxExecutionTime must be an integer',
      'number.min': 'maxExecutionTime must be at least 0',
      'number.max': 'maxExecutionTime must not exceed 3600 seconds',
    }),
    maxInputTime: Joi.number().integer().min(0).max(3600).optional().messages({
      'number.base': 'maxInputTime must be a number',
      'number.integer': 'maxInputTime must be an integer',
      'number.min': 'maxInputTime must be at least 0',
      'number.max': 'maxInputTime must not exceed 3600 seconds',
    }),
    uploadMaxFilesize: Joi.string()
      .pattern(/^\d+[KMG]?$/)
      .optional()
      .messages({
        'string.pattern.base': 'uploadMaxFilesize must be a valid size (e.g., 2M, 10M)',
      }),
    maxFileUploads: Joi.number().integer().min(1).max(100).optional().messages({
      'number.base': 'maxFileUploads must be a number',
      'number.integer': 'maxFileUploads must be an integer',
      'number.min': 'maxFileUploads must be at least 1',
      'number.max': 'maxFileUploads must not exceed 100',
    }),
  }).optional(),
}).required();
