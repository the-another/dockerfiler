import type { Command } from './index.js';
import { PHPVersion, Platform, EnumUtils } from '@/types';

export interface ValidateConfigArgs {
  phpVersion: PHPVersion;
  platform: Platform;
  outputPath: string;
}

export class ValidateConfigCommand implements Command<ValidateConfigArgs, void> {
  async execute(args: ValidateConfigArgs): Promise<void> {
    try {
      // Validate arguments
      this.validateArgs(args);

      // TODO: Implement configuration validation logic
      console.log(`✅ Validating configuration for PHP ${args.phpVersion} on ${args.platform}`);
      console.log('⚠️  Configuration validation not yet implemented');
    } catch (error) {
      console.error('❌ Error validating config:', error);
      throw error;
    }
  }

  validateArgs(args: ValidateConfigArgs): void {
    // Validate PHP version using enum validation
    if (!EnumUtils.isValidPHPVersion(args.phpVersion)) {
      throw new Error(
        `Invalid PHP version: ${args.phpVersion}. Supported versions: ${EnumUtils.getAllPHPVersions().join(', ')}`
      );
    }

    // Validate platform using enum validation
    if (!EnumUtils.isValidPlatform(args.platform)) {
      throw new Error(
        `Invalid platform: ${args.platform}. Supported platforms: ${EnumUtils.getAllPlatforms().join(', ')}`
      );
    }

    // Validate output path
    if (!args.outputPath || args.outputPath.trim() === '') {
      throw new Error('Output path is required');
    }
  }

  getHelp(): string {
    return `
Validate Config Command

Validates the configuration for the specified setup.

Usage:
  dockerfile-generator validate:config --php <version> --platform <platform> [options]

Required Options:
  --php <version>        ${EnumUtils.getPHPVersionHelpText()}
  --platform <platform>  ${EnumUtils.getPlatformHelpText()}

Optional Options:
  --output <path>        Output directory path [default: ./output]

Examples:
  dockerfile-generator validate:config --php 8.3 --platform alpine
  dockerfile-generator validate:config --php 8.2 --platform ubuntu
  dockerfile-generator validate:config --php 8.4 --platform alpine --output ./custom-output
    `;
  }
}
