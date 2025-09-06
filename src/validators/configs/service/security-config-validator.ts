/**
 * Security Configuration Validator
 *
 * This module contains Joi validation schemas for security configuration.
 */

import Joi from 'joi';

/**
 * Security configuration validation schema
 * Validates security hardening settings
 */
export const securityConfigSchema = Joi.object({
  user: Joi.string().min(1).max(32).required().messages({
    'string.base': 'user must be a string',
    'string.min': 'user cannot be empty',
    'string.max': 'user cannot exceed 32 characters',
    'any.required': 'user is required',
  }),
  group: Joi.string().min(1).max(32).required().messages({
    'string.base': 'group must be a string',
    'string.min': 'group cannot be empty',
    'string.max': 'group cannot exceed 32 characters',
    'any.required': 'group is required',
  }),
  nonRoot: Joi.boolean().valid(true).required().messages({
    'boolean.base': 'nonRoot must be a boolean',
    'any.only': 'nonRoot must be true for security',
    'any.required': 'nonRoot is required',
  }),
  readOnlyRoot: Joi.boolean().required().messages({
    'boolean.base': 'readOnlyRoot must be a boolean',
    'any.required': 'readOnlyRoot is required',
  }),
  capabilities: Joi.array().items(Joi.string().min(1).max(20)).min(1).max(20).required().messages({
    'array.base': 'capabilities must be an array',
    'array.min': 'At least one capability is required',
    'array.max': 'Maximum 20 capabilities allowed',
    'string.min': 'Capability name cannot be empty',
    'string.max': 'Capability name cannot exceed 20 characters',
    'any.required': 'capabilities are required',
  }),
  seccomp: Joi.boolean().optional().messages({
    'boolean.base': 'seccomp must be a boolean',
  }),
  apparmor: Joi.boolean().optional().messages({
    'boolean.base': 'apparmor must be a boolean',
  }),
  options: Joi.object({
    dropAllCapabilities: Joi.boolean().optional().messages({
      'boolean.base': 'dropAllCapabilities must be a boolean',
    }),
    noNewPrivileges: Joi.boolean().optional().messages({
      'boolean.base': 'noNewPrivileges must be a boolean',
    }),
    userNamespace: Joi.boolean().optional().messages({
      'boolean.base': 'userNamespace must be a boolean',
    }),
  }).optional(),
}).required();
