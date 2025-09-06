import type { Command } from '@/commands';
import { logger } from '@/services';
import { PHPVersion, Platform, Architecture } from '@/types';
import { PHPVersionTypeUtil, PlatformTypeUtil, ArchitectureTypeUtil } from '@/utils';

export interface TestLocalArgs {
  phpVersion: PHPVersion;
  platform: Platform;
  architecture: Architecture;
  outputPath: string;
}

export class TestLocalCommand implements Command<TestLocalArgs, void> {
  private static readonly SERVICE_NAME = 'test-local' as const;
  private static readonly OPERATION_EXECUTE = 'execute' as const;
  async execute(args: TestLocalArgs): Promise<void> {
    try {
      // Validate arguments
      this.validateArgs(args);

      // TODO: Implement local testing logic
      logger.info('Starting local testing', {
        service: TestLocalCommand.SERVICE_NAME,
        operation: TestLocalCommand.OPERATION_EXECUTE,
        metadata: {
          phpVersion: args.phpVersion,
          platform: args.platform,
          architecture: args.architecture,
          outputPath: args.outputPath,
        },
      });
      logger.warn('Local testing not yet implemented', {
        service: TestLocalCommand.SERVICE_NAME,
        operation: TestLocalCommand.OPERATION_EXECUTE,
      });
    } catch (error) {
      logger.error(
        'Error testing locally',
        {
          service: TestLocalCommand.SERVICE_NAME,
          operation: TestLocalCommand.OPERATION_EXECUTE,
          metadata: { args },
        },
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  validateArgs(args: TestLocalArgs): void {
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

    // Validate architecture using enum validation
    if (!ArchitectureTypeUtil.isValidArchitecture(args.architecture)) {
      throw new Error(
        `Invalid architecture: ${args.architecture}. Supported architectures: ${ArchitectureTypeUtil.getAllArchitectures().join(', ')}`
      );
    }

    // Validate output path
    if (!args.outputPath || args.outputPath.trim() === '') {
      throw new Error('Output path is required');
    }
  }

  getHelp(): string {
    return `
Test Local Command

Tests the generated configuration locally.

Usage:
  dockerfile-generator test:local --php <version> --platform <platform> [options]

Required Options:
  --php <version>        ${PHPVersionTypeUtil.getPHPVersionHelpText()}
  --platform <platform>  ${PlatformTypeUtil.getPlatformHelpText()}

Optional Options:
  --arch <architecture>  ${ArchitectureTypeUtil.getArchitectureHelpText()} [default: all]
  --output <path>        Output directory path [default: ./output]

Examples:
  dockerfile-generator test:local --php 8.3 --platform alpine
  dockerfile-generator test:local --php 8.2 --platform ubuntu --arch arm64
  dockerfile-generator test:local --php 8.4 --platform alpine --output ./custom-output
    `;
  }
}
