/**
 * Commands Module
 *
 * This module contains all command implementations using Commander.js
 * for CLI command parsing and routing.
 */

export interface Command<TArgs = unknown, TResult = void> {
  execute(args: TArgs): Promise<TResult>;
  validateArgs(args: TArgs): void;
  getHelp(): string;
}

// Export all command implementations
export { BuildDockerfileCommand } from './build-dockerfile';
export { BuildImageCommand } from './build-image';
export { DeployHubCommand } from './deploy-hub';
export { DeployManifestCommand } from './deploy-manifest';
export { TestLocalCommand } from './test-local';
export { ValidateConfigCommand } from './validate-config';
