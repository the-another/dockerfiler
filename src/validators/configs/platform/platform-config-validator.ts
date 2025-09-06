/**
 * Platform Configuration Validator
 *
 * This module contains Joi validation schemas for platform configuration.
 */

import Joi from 'joi';
import { Platform } from '@/types';
import { baseConfigSchema } from '../base/base-config-validator';

/**
 * Platform validation schema
 * Validates against supported platforms
 */
export const platformSchema = Joi.string()
  .valid(...Object.values(Platform))
  .required()
  .messages({
    'any.only': 'Platform must be one of: {{#valids}}',
    'any.required': 'Platform is required',
  });

/**
 * Platform-specific configuration validation schema
 * Validates platform-specific settings
 */
export const platformConfigSchema = baseConfigSchema.concat(
  Joi.object({
    platform: platformSchema,
    platformSpecific: Joi.alternatives()
      .try(
        // Alpine configuration
        Joi.object({
          packageManager: Joi.object({
            useCache: Joi.boolean().required().messages({
              'boolean.base': 'packageManager.useCache must be a boolean',
              'any.required': 'packageManager.useCache is required',
            }),
            cleanCache: Joi.boolean().required().messages({
              'boolean.base': 'packageManager.cleanCache must be a boolean',
              'any.required': 'packageManager.cleanCache is required',
            }),
            repositories: Joi.array()
              .items(Joi.string().min(1).max(200))
              .max(10)
              .optional()
              .messages({
                'array.base': 'packageManager.repositories must be an array',
                'array.max': 'Maximum 10 repositories allowed',
                'string.min': 'Repository URL cannot be empty',
                'string.max': 'Repository URL cannot exceed 200 characters',
              }),
          })
            .required()
            .messages({
              'object.base': 'packageManager must be an object',
              'any.required': 'packageManager is required',
            }),
          optimizations: Joi.object({
            security: Joi.boolean().required().messages({
              'boolean.base': 'optimizations.security must be a boolean',
              'any.required': 'optimizations.security is required',
            }),
            minimal: Joi.boolean().required().messages({
              'boolean.base': 'optimizations.minimal must be a boolean',
              'any.required': 'optimizations.minimal is required',
            }),
            performance: Joi.boolean().required().messages({
              'boolean.base': 'optimizations.performance must be a boolean',
              'any.required': 'optimizations.performance is required',
            }),
          })
            .required()
            .messages({
              'object.base': 'optimizations must be an object',
              'any.required': 'optimizations is required',
            }),
          cleanupCommands: Joi.array()
            .items(Joi.string().min(1).max(200))
            .max(20)
            .required()
            .messages({
              'array.base': 'cleanupCommands must be an array',
              'array.max': 'Maximum 20 cleanup commands allowed',
              'string.min': 'Cleanup command cannot be empty',
              'string.max': 'Cleanup command cannot exceed 200 characters',
              'any.required': 'cleanupCommands are required',
            }),
          environment: Joi.object().pattern(Joi.string(), Joi.string()).optional().messages({
            'object.base': 'environment must be an object',
          }),
        }),
        // Ubuntu configuration
        Joi.object({
          packageManager: Joi.object({
            updateLists: Joi.boolean().required().messages({
              'boolean.base': 'packageManager.updateLists must be a boolean',
              'any.required': 'packageManager.updateLists is required',
            }),
            upgrade: Joi.boolean().required().messages({
              'boolean.base': 'packageManager.upgrade must be a boolean',
              'any.required': 'packageManager.upgrade is required',
            }),
            cleanCache: Joi.boolean().required().messages({
              'boolean.base': 'packageManager.cleanCache must be a boolean',
              'any.required': 'packageManager.cleanCache is required',
            }),
            repositories: Joi.array()
              .items(Joi.string().min(1).max(200))
              .max(10)
              .optional()
              .messages({
                'array.base': 'packageManager.repositories must be an array',
                'array.max': 'Maximum 10 repositories allowed',
                'string.min': 'Repository URL cannot be empty',
                'string.max': 'Repository URL cannot exceed 200 characters',
              }),
          })
            .required()
            .messages({
              'object.base': 'packageManager must be an object',
              'any.required': 'packageManager is required',
            }),
          optimizations: Joi.object({
            security: Joi.boolean().required().messages({
              'boolean.base': 'optimizations.security must be a boolean',
              'any.required': 'optimizations.security is required',
            }),
            minimal: Joi.boolean().required().messages({
              'boolean.base': 'optimizations.minimal must be a boolean',
              'any.required': 'optimizations.minimal is required',
            }),
            performance: Joi.boolean().required().messages({
              'boolean.base': 'optimizations.performance must be a boolean',
              'any.required': 'optimizations.performance is required',
            }),
          })
            .required()
            .messages({
              'object.base': 'optimizations must be an object',
              'any.required': 'optimizations is required',
            }),
          cleanupCommands: Joi.array()
            .items(Joi.string().min(1).max(200))
            .max(20)
            .required()
            .messages({
              'array.base': 'cleanupCommands must be an array',
              'array.max': 'Maximum 20 cleanup commands allowed',
              'string.min': 'Cleanup command cannot be empty',
              'string.max': 'Cleanup command cannot exceed 200 characters',
              'any.required': 'cleanupCommands are required',
            }),
          environment: Joi.object().pattern(Joi.string(), Joi.string()).optional().messages({
            'object.base': 'environment must be an object',
          }),
        })
      )
      .required()
      .messages({
        'alternatives.match': 'platformSpecific must be a valid Alpine or Ubuntu configuration',
        'any.required': 'platformSpecific is required',
      }),
  })
);
