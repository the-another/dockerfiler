/**
 * Dockerfile Template Data Interface
 *
 * This module contains the DockerfileTemplateData interface for the Dockerfile Generator CLI.
 */

import type { TemplateData } from '@/types';

/**
 * Dockerfile template data interface
 * Specific data structure for Dockerfile generation
 */
export interface DockerfileTemplateData extends TemplateData {
  /** Dockerfile-specific data */
  readonly dockerfile: {
    /** Base image information */
    readonly baseImage: {
      readonly name: string;
      readonly tag: string;
      readonly architecture: string;
    };
    /** Package installation commands */
    readonly packages: {
      readonly install: readonly string[];
      readonly cleanup: readonly string[];
    };
    /** File copy operations */
    readonly copies: readonly {
      readonly source: string;
      readonly destination: string;
      readonly permissions?: string;
    }[];
    /** Environment variables */
    readonly environment: Record<string, string>;
    /** Exposed ports */
    readonly ports: readonly number[];
    /** Health check configuration */
    readonly healthCheck?: {
      readonly command: readonly string[];
      readonly interval?: string;
      readonly timeout?: string;
      readonly retries?: number;
    };
  };
}
