/**
 * Build Dockerfile Command Arguments Interface
 *
 * This module contains the BuildDockerfileArgs interface for the Dockerfile Generator CLI.
 */

import type { BaseCommandArgs } from '@/types';

/**
 * Build Dockerfile command arguments
 * Arguments for the build:dockerfile command
 */
export interface BuildDockerfileArgs extends BaseCommandArgs {
  /** Whether to validate the generated Dockerfile */
  readonly validate?: boolean;
  /** Whether to include comments in the generated Dockerfile */
  readonly comments?: boolean;
  /** Custom configuration file path */
  readonly config?: string;
}
