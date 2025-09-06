/**
 * Build Image Command Arguments Interface
 *
 * This module contains the BuildImageArgs interface for the Dockerfile Generator CLI.
 */

import type { BaseCommandArgs } from '@/types';

/**
 * Build Image command arguments *  for the build:image command
 */
export interface BuildImageArgs extends BaseCommandArgs {
  /** Docker image tag */
  readonly tag?: string;
  /** Whether to push the image after building */
  readonly push?: boolean;
  /** Whether to use build cache */
  readonly cache?: boolean;
  /** Build context path */
  readonly context?: string;
  /** Custom Dockerfile path */
  readonly dockerfile?: string;
  /** Build arguments to pass to Docker */
  readonly buildArgs?: Record<string, string>;
}
