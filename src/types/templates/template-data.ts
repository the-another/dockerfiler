/**
 * Template Data Interface
 *
 * This module contains the TemplateData interface for the Dockerfile Generator CLI.
 */

import type { FinalConfig } from '@/types';

/**
 * Type for custom template variables
 * Supports common template variable types used in Handlebars
 */
export type CustomVariableValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Record<string, string | number | boolean>;

/**
 * Template data interface for Handlebars template rendering
 * Provides all necessary data for template generation
 */
export interface TemplateData {
  /** Configuration data for template rendering */
  readonly config: FinalConfig;
  /** Template metadata */
  readonly metadata: {
    /** Template name */
    readonly name: string;
    /** Template version */
    readonly version: string;
    /** Template description */
    readonly description?: string;
    /** Generation timestamp */
    readonly generatedAt: string;
    /** Generator version */
    readonly generatorVersion: string;
  };
  /** Template variables */
  readonly variables: {
    /** PHP version string */
    readonly phpVersion: string;
    /** Platform name */
    readonly platform: string;
    /** Architecture name */
    readonly architecture: string;
    /** Base image name */
    readonly baseImage: string;
    /** User and group names */
    readonly user: string;
    readonly group: string;
    /** Additional custom variables */
    readonly custom?: Record<string, CustomVariableValue>;
  };
  /** Template helpers */
  readonly helpers?: {
    /** Whether to include comments */
    readonly includeComments: boolean;
    /** Whether to include debug information */
    readonly includeDebug: boolean;
    /** Whether to include security features */
    readonly includeSecurity: boolean;
  };
}
