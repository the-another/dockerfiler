/**
 * Nginx Configuration Validator
 *
 * This module contains Joi validation schemas for Nginx configuration.
 */

import Joi from 'joi';

/**
 * Nginx configuration validation schema
 * Validates Nginx server and worker settings
 */
export const nginxConfigSchema = Joi.object({
  workerProcesses: Joi.string()
    .pattern(/^(auto|\d+)$/)
    .required()
    .messages({
      'string.pattern.base': 'workerProcesses must be "auto" or a number',
      'any.required': 'workerProcesses is required',
    }),
  workerConnections: Joi.number().integer().min(1).max(65535).required().messages({
    'number.base': 'workerConnections must be a number',
    'number.integer': 'workerConnections must be an integer',
    'number.min': 'workerConnections must be at least 1',
    'number.max': 'workerConnections must not exceed 65535',
    'any.required': 'workerConnections is required',
  }),
  gzip: Joi.boolean().required().messages({
    'boolean.base': 'gzip must be a boolean',
    'any.required': 'gzip is required',
  }),
  ssl: Joi.boolean().required().messages({
    'boolean.base': 'ssl must be a boolean',
    'any.required': 'ssl is required',
  }),
  options: Joi.object({
    clientMaxBodySize: Joi.string()
      .pattern(/^\d+[KMG]?$/)
      .optional()
      .messages({
        'string.pattern.base': 'clientMaxBodySize must be a valid size (e.g., 1M, 10M)',
      }),
    proxyTimeout: Joi.object({
      connect: Joi.string()
        .pattern(/^\d+[smh]?$/)
        .optional()
        .messages({
          'string.pattern.base': 'connect timeout must be a valid duration (e.g., 30s, 1m)',
        }),
      send: Joi.string()
        .pattern(/^\d+[smh]?$/)
        .optional()
        .messages({
          'string.pattern.base': 'send timeout must be a valid duration (e.g., 30s, 1m)',
        }),
      read: Joi.string()
        .pattern(/^\d+[smh]?$/)
        .optional()
        .messages({
          'string.pattern.base': 'read timeout must be a valid duration (e.g., 30s, 1m)',
        }),
    }).optional(),
    rateLimit: Joi.object({
      enabled: Joi.boolean().required().messages({
        'boolean.base': 'rateLimit.enabled must be a boolean',
        'any.required': 'rateLimit.enabled is required',
      }),
      requests: Joi.number().integer().min(1).max(10000).required().messages({
        'number.base': 'rateLimit.requests must be a number',
        'number.integer': 'rateLimit.requests must be an integer',
        'number.min': 'rateLimit.requests must be at least 1',
        'number.max': 'rateLimit.requests must not exceed 10000',
        'any.required': 'rateLimit.requests is required',
      }),
      window: Joi.string()
        .pattern(/^\d+[smh]?$/)
        .required()
        .messages({
          'string.pattern.base': 'rateLimit.window must be a valid duration (e.g., 1m, 1h)',
          'any.required': 'rateLimit.window is required',
        }),
    }).optional(),
  }).optional(),
}).required();
