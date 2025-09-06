import type { Command } from '@/commands';
import { DockerBuildService } from '@/services';
import { ConfigManager } from '@/services';
import { ValidationEngine } from '@/services';
import { logger } from '@/services';
import { PHPVersion, Platform, Architecture } from '@/types';
import { PHPVersionTypeUtil, PlatformTypeUtil, ArchitectureTypeUtil } from '@/utils';

export interface BuildImageArgs {
  phpVersion: PHPVersion;
  platform: Platform;
  architecture: Architecture;
  tag: string;
  outputPath: string;
  push: boolean;
}

export class BuildImageCommand implements Command<BuildImageArgs, void> {
  private static readonly SERVICE_NAME = 'build-image' as const;
  private static readonly OPERATION_EXECUTE = 'execute' as const;
  private static readonly OPERATION_PUSH = 'push' as const;

  private dockerBuildService: DockerBuildService;
  private configManager: ConfigManager;
  private validationEngine: ValidationEngine;

  constructor() {
    this.dockerBuildService = new DockerBuildService();
    this.configManager = new ConfigManager();
    this.validationEngine = new ValidationEngine();
  }

  async execute(args: BuildImageArgs): Promise<void> {
    try {
      // Validate arguments
      this.validateArgs(args);

      // Load configuration
      const config = await this.configManager.loadConfig(args.phpVersion, args.platform);

      // Validate configuration
      await this.validationEngine.validateConfig(config);

      // Build Docker image
      const imageId = await this.dockerBuildService.buildImage({
        config,
        architecture: args.architecture,
        tag: args.tag,
        outputPath: args.outputPath,
      });

      logger.info('Docker image built successfully', {
        service: BuildImageCommand.SERVICE_NAME,
        operation: BuildImageCommand.OPERATION_EXECUTE,
        metadata: {
          phpVersion: args.phpVersion,
          platform: args.platform,
          architecture: args.architecture,
          imageId,
          tag: args.tag,
        },
      });

      // Push image if requested
      if (args.push) {
        await this.dockerBuildService.pushImage(imageId, args.tag);
        logger.info('Image pushed successfully', {
          service: BuildImageCommand.SERVICE_NAME,
          operation: BuildImageCommand.OPERATION_PUSH,
          metadata: {
            imageId,
            tag: args.tag,
          },
        });
      }
    } catch (error) {
      logger.error(
        'Error building Docker image',
        {
          service: BuildImageCommand.SERVICE_NAME,
          operation: BuildImageCommand.OPERATION_EXECUTE,
          metadata: { args },
        },
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  validateArgs(args: BuildImageArgs): void {
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

    // Validate tag
    if (!args.tag || args.tag.trim() === '') {
      throw new Error('Image tag is required');
    }

    // Validate output path
    if (!args.outputPath || args.outputPath.trim() === '') {
      throw new Error('Output path is required');
    }
  }

  getHelp(): string {
    return `
Build Image Command

Builds a Docker image for the specified PHP version and platform.

Usage:
  dockerfile-generator build:image --php <version> --platform <platform> [options]

Required Options:
  --php <version>        ${PHPVersionTypeUtil.getPHPVersionHelpText()}
  --platform <platform>  ${PlatformTypeUtil.getPlatformHelpText()}

Optional Options:
  --arch <architecture>  ${ArchitectureTypeUtil.getArchitectureHelpText()} [default: all]
  --tag <tag>            Image tag [default: latest]
  --output <path>        Output directory path [default: ./output]
  --push                 Push image to registry after build [default: false]

Examples:
  dockerfile-generator build:image --php 8.3 --platform alpine
  dockerfile-generator build:image --php 8.2 --platform ubuntu --arch arm64 --tag v1.0.0
  dockerfile-generator build:image --php 8.4 --platform alpine --push
    `;
  }
}
