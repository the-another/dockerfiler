/**
 * Type definitions for dockerfile-generator package
 * 
 * This file provides TypeScript type definitions for the dockerfile-generator
 * npm package to ensure type safety when using the package.
 */

declare module 'dockerfile-generator' {
  /**
   * Input interface for dockerfile-generator
   */
  export interface DockerfileInput {
    from: string;
    run?: string[];
    volumes?: string[];
    user?: string;
    working_dir?: string;
    labels?: Record<string, string>;
    env?: Record<string, string>;
    add?: Record<string, string>;
    copy?: Record<string, string>;
    entrypoint?: string | string[];
    cmd?: string | string[];
    expose?: string[];
    args?: string[];
    stopsignal?: string;
    shell?: string[];
    comment?: string;
  }

  /**
   * Generates a Dockerfile from JSON input
   * @param input JSON input object
   * @returns Promise that resolves to the generated Dockerfile content
   */
  export function generateDockerFile(input: DockerfileInput): Promise<string>;

  /**
   * Generates a Dockerfile from an array of instructions
   * @param instructions Array of Dockerfile instructions
   * @returns Promise that resolves to the generated Dockerfile content
   */
  export function generateDockerFileFromArray(instructions: string[]): Promise<string>;

  /**
   * Converts a Dockerfile to JSON format
   * @param dockerfileContent Dockerfile content as string
   * @returns Promise that resolves to the JSON representation
   */
  export function convertToJSON(dockerfileContent: string): Promise<DockerfileInput>;
}
