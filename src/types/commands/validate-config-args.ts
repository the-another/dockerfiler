/**
 * Validate Config Command Arguments Interface
 *
 * This module contains the ValidateConfigArgs interface for the Dockerfile Generator CLI.
 */

import type { BaseCommandArgs } from '@/types';

/**
 * Validate Config command arguments *  for the validate:config command
 */
export interface ValidateConfigArgs extends BaseCommandArgs {
  /** Configuration file path to validate */
  readonly config?: string;
  /** Whether to validate security settings */
  readonly security?: boolean;
  /** Whether to validate Dockerfile syntax */
  readonly dockerfile?: boolean;
  /** Whether to validate template syntax */
  readonly templates?: boolean;
  /** Output format for validation results */
  readonly format?: 'json' | 'text' | 'table';
}
