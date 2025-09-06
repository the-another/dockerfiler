/**
 * Deploy Manifest Command Arguments Interface
 *
 * This module contains the DeployManifestArgs interface for the Dockerfile Generator CLI.
 */

import type { ArchitectureValue, BaseCommandArgs } from '@/types';

/**
 * Deploy Manifest command arguments *  for the deploy:manifest command
 */
export interface DeployManifestArgs extends BaseCommandArgs {
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
  /** Architectures to include in manifest */
  readonly architectures?: readonly ArchitectureValue[];
}
