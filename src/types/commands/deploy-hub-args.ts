/**
 * Deploy Hub Command Arguments Interface
 *
 * This module contains the DeployHubArgs interface for the Dockerfile Generator CLI.
 */

import type { BaseCommandArgs } from '@/types';

/**
 * Deploy Hub command arguments *  for the deploy:hub command
 */
export interface DeployHubArgs extends BaseCommandArgs {
  /** Docker image tag */
  readonly tag: string;
  /** Docker Hub username */
  readonly username?: string;
  /** Docker Hub password or token */
  readonly password?: string;
  /** Docker registry URL */
  readonly registry?: string;
  /** Docker namespace/repository */
  readonly namespace?: string;
  /** Whether to create multi-architecture manifest */
  readonly manifest?: boolean;
}
