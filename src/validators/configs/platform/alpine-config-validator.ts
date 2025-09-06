/**
 * Alpine Configuration Validator
 *
 * This module contains Joi validation schemas for Alpine-specific configuration.
 */

import Joi from 'joi';

/**
 * Alpine-specific configuration validation schema
 * Validates Alpine Linux specific settings
 */
export const alpineConfigSchema = Joi.object({
  cleanupCommands: Joi.array().items(Joi.string().min(1).max(200)).max(20).optional().messages({
    'array.base': 'alpine.cleanupCommands must be an array',
    'array.max': 'Maximum 20 cleanup commands allowed',
    'string.min': 'Cleanup command cannot be empty',
    'string.max': 'Cleanup command cannot exceed 200 characters',
  }),
  apkPackages: Joi.array().items(Joi.string().min(1).max(100)).max(100).optional().messages({
    'array.base': 'apkPackages must be an array',
    'array.max': 'Maximum 100 APK packages allowed',
    'string.min': 'Package name cannot be empty',
    'string.max': 'Package name cannot exceed 100 characters',
  }),
  apkRepositories: Joi.array().items(Joi.string().min(1).max(500)).max(10).optional().messages({
    'array.base': 'apkRepositories must be an array',
    'array.max': 'Maximum 10 APK repositories allowed',
    'string.min': 'Repository URL cannot be empty',
    'string.max': 'Repository URL cannot exceed 500 characters',
  }),
  apkKeys: Joi.array().items(Joi.string().min(1).max(100)).max(20).optional().messages({
    'array.base': 'apkKeys must be an array',
    'array.max': 'Maximum 20 APK keys allowed',
    'string.min': 'APK key cannot be empty',
    'string.max': 'APK key cannot exceed 100 characters',
  }),
}).optional();
