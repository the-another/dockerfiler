/**
 * Final Configuration Validator
 *
 * This module contains Joi validation schemas for final configuration.
 */

import Joi from 'joi';
import { platformConfigSchema } from '../platform/platform-config-validator';

/**
 * Final configuration validation schema
 * Validates the complete final configuration structure
 */
export const finalConfigSchema = platformConfigSchema.concat(
  Joi.object({
    architecture: Joi.string().valid('amd64', 'arm64', 'arm/v7', 'arm/v6').required().messages({
      'any.only': 'architecture must be one of: amd64, arm64, arm/v7, arm/v6',
      'any.required': 'architecture is required',
    }),
    build: Joi.object({
      baseImage: Joi.string().min(1).max(200).required().messages({
        'string.min': 'build.baseImage cannot be empty',
        'string.max': 'build.baseImage cannot exceed 200 characters',
        'any.required': 'build.baseImage is required',
      }),
      buildArgs: Joi.object()
        .pattern(Joi.string().min(1).max(50), Joi.string().min(1).max(200))
        .max(50)
        .optional()
        .messages({
          'object.base': 'build.buildArgs must be an object',
          'object.max': 'Maximum 50 build arguments allowed',
          'string.min': 'Build argument key/value cannot be empty',
          'string.max':
            'Build argument key cannot exceed 50 characters, value cannot exceed 200 characters',
        }),
      context: Joi.string().min(1).max(500).optional().messages({
        'string.min': 'build.context cannot be empty',
        'string.max': 'build.context cannot exceed 500 characters',
      }),
      useCache: Joi.boolean().optional().messages({
        'boolean.base': 'build.useCache must be a boolean',
      }),
    }).required(),
  })
);
