/**
 * Final Configuration Interface
 *
 * This module contains the FinalConfig interface for the Dockerfile Generator CLI.
 */

import type { ArchitectureValue, PlatformConfig } from '@/types';

/**
 * Final configuration interface
 * Represents the complete configuration after inheritance and merging
 */
export interface FinalConfig extends PlatformConfig {
  /** Target architecture for this configuration */
  readonly architecture: ArchitectureValue;
  /** Build-specific options */
  readonly build: {
    /** Base image for the target architecture */
    readonly baseImage: string;
    /** Build arguments */
    readonly buildArgs?: Record<string, string>;
    /** Build context path */
    readonly context?: string;
    /** Whether to use build cache */
    readonly useCache?: boolean;
  };
}
