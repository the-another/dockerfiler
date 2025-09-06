/**
 * Base Command Arguments Interface
 *
 * This module contains the BaseCommandArgs interface for the Dockerfile Generator CLI.
 */

import type { PHPVersionValue, PlatformValue, ArchitectureValue } from '@/types';

/**
 * Base command arguments interface
 * Common arguments shared across all commands
 */
export interface BaseCommandArgs {
  /** PHP version to use */
  readonly php: PHPVersionValue;
  /** Platform to use (alpine or ubuntu) */
  readonly platform: PlatformValue;
  /** Architecture to target */
  readonly arch?: ArchitectureValue;
  /** Output directory for generated files */
  readonly output?: string;
  /** Whether to run in verbose mode */
  readonly verbose?: boolean;
  /** Whether to run in quiet mode */
  readonly quiet?: boolean;
}
