/**
 * Ubuntu Configuration Validator
 *
 * This module contains Joi validation schemas for Ubuntu-specific configuration.
 */

import Joi from 'joi';

/**
 * Ubuntu-specific configuration validation schema
 * Validates Ubuntu Linux specific settings
 */
export const ubuntuConfigSchema = Joi.object({
  cleanupCommands: Joi.array().items(Joi.string().min(1).max(200)).max(20).optional().messages({
    'array.base': 'ubuntu.cleanupCommands must be an array',
    'array.max': 'Maximum 20 cleanup commands allowed',
    'string.min': 'Cleanup command cannot be empty',
    'string.max': 'Cleanup command cannot exceed 200 characters',
  }),
  aptPackages: Joi.array().items(Joi.string().min(1).max(100)).max(100).optional().messages({
    'array.base': 'aptPackages must be an array',
    'array.max': 'Maximum 100 APT packages allowed',
    'string.min': 'Package name cannot be empty',
    'string.max': 'Package name cannot exceed 100 characters',
  }),
  aptRepositories: Joi.array().items(Joi.string().min(1).max(500)).max(10).optional().messages({
    'array.base': 'aptRepositories must be an array',
    'array.max': 'Maximum 10 APT repositories allowed',
    'string.min': 'Repository URL cannot be empty',
    'string.max': 'Repository URL cannot exceed 500 characters',
  }),
  aptKeys: Joi.array().items(Joi.string().min(1).max(100)).max(20).optional().messages({
    'array.base': 'aptKeys must be an array',
    'array.max': 'Maximum 20 APT keys allowed',
    'string.min': 'APT key cannot be empty',
    'string.max': 'APT key cannot exceed 100 characters',
  }),
  aptSources: Joi.array().items(Joi.string().min(1).max(500)).max(20).optional().messages({
    'array.base': 'aptSources must be an array',
    'array.max': 'Maximum 20 APT sources allowed',
    'string.min': 'APT source cannot be empty',
    'string.max': 'APT source cannot exceed 500 characters',
  }),
}).optional();
