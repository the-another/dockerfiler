import type { Command } from '@/commands';
import { logger } from '@/services';
import { PHPVersion, Platform } from '@/types';
import { PHPVersionTypeUtil, PlatformTypeUtil } from '@/utils';

export interface ValidateConfigArgs {
  phpVersion: PHPVersion;
  platform: Platform;
  outputPath: string;
}

export class ValidateConfigCommand implements Command<ValidateConfigArgs, void> {
  private static readonly SERVICE_NAME = 'validate-config' as const;
  private static readonly OPERATION_EXECUTE = 'execute' as const;
  async execute(args: ValidateConfigArgs): Promise<void> {
    try {
      // Validate arguments
      this.validateArgs(args);

      // TODO: Implement configuration validation logic
      logger.info('Starting configuration validation', {
        service: ValidateConfigCommand.SERVICE_NAME,
        operation: ValidateConfigCommand.OPERATION_EXECUTE,
        metadata: {
          phpVersion: args.phpVersion,
          platform: args.platform,
          outputPath: args.outputPath,
        },
      });
      logger.warn('Configuration validation not yet implemented', {
        service: ValidateConfigCommand.SERVICE_NAME,
        operation: ValidateConfigCommand.OPERATION_EXECUTE,
      });
    } catch (error) {
      logger.error(
        'Error validating config',
        {
          service: ValidateConfigCommand.SERVICE_NAME,
          operation: ValidateConfigCommand.OPERATION_EXECUTE,
          metadata: { args },
        },
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  validateArgs(args: ValidateConfigArgs): void {
    // Validate PHP version using enum validation
    if (!PHPVersionTypeUtil.isValidPHPVersion(args.phpVersion)) {
      throw new Error(
        `Invalid PHP version: ${args.phpVersion}. Supported versions: ${PHPVersionTypeUtil.getAllPHPVersions().join(', ')}`
      );
    }

    // Validate platform using enum validation
    if (!PlatformTypeUtil.isValidPlatform(args.platform)) {
      throw new Error(
        `Invalid platform: ${args.platform}. Supported platforms: ${PlatformTypeUtil.getAllPlatforms().join(', ')}`
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
  --php <version>        ${PHPVersionTypeUtil.getPHPVersionHelpText()}
  --platform <platform>  ${PlatformTypeUtil.getPlatformHelpText()}

Optional Options:
  --output <path>        Output directory path [default: ./output]

Examples:
  dockerfile-generator validate:config --php 8.3 --platform alpine
  dockerfile-generator validate:config --php 8.2 --platform ubuntu
  dockerfile-generator validate:config --php 8.4 --platform alpine --output ./custom-output
    `;
  }
}
