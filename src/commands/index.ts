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
export { BuildDockerfileCommand } from './build-dockerfile.js';
export { BuildImageCommand } from './build-image.js';
export { DeployHubCommand } from './deploy-hub.js';
export { DeployManifestCommand } from './deploy-manifest.js';
export { TestLocalCommand } from './test-local.js';
export { ValidateConfigCommand } from './validate-config.js';
