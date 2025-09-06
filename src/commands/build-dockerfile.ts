import type { Command } from '@/commands';
import { DockerfileGeneratorService } from '@/services';
import { ConfigManager } from '@/services';
import { ValidationEngine } from '@/services';
import { logger } from '@/services';
import { PHPVersion, Platform, Architecture } from '@/types';
import { PHPVersionTypeUtil, PlatformTypeUtil, ArchitectureTypeUtil } from '@/utils';

export interface BuildDockerfileArgs {
  phpVersion: PHPVersion;
  platform: Platform;
  architecture: Architecture;
  outputPath: string;
}

export class BuildDockerfileCommand implements Command<BuildDockerfileArgs, void> {
  private dockerfileGenerator: DockerfileGeneratorService;
  private configManager: ConfigManager;
  private validationEngine: ValidationEngine;

  constructor() {
    this.dockerfileGenerator = new DockerfileGeneratorService();
    this.configManager = new ConfigManager();
    this.validationEngine = new ValidationEngine();
  }

  async execute(args: BuildDockerfileArgs): Promise<void> {
    try {
      // Validate arguments
      this.validateArgs(args);

      // Load configuration
      const config = await this.configManager.loadConfig(args.phpVersion, args.platform);

      // Validate configuration
      await this.validationEngine.validateConfig(config);

      // Generate Dockerfile
      const dockerfile = await this.dockerfileGenerator.generateDockerfile(
        config,
        args.architecture
      );

      // Write output
      await this.dockerfileGenerator.writeOutput(dockerfile, args.outputPath);

      logger.info('Dockerfile generated successfully', {
        service: 'build-dockerfile',
        operation: 'execute',
        metadata: {
          phpVersion: args.phpVersion,
          platform: args.platform,
          architecture: args.architecture,
          outputPath: args.outputPath,
        },
      });
    } catch (error) {
      logger.error(
        'Error generating Dockerfile',
        {
          service: 'build-dockerfile',
          operation: 'execute',
          metadata: { args },
        },
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  validateArgs(args: BuildDockerfileArgs): void {
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
Build Dockerfile Command

Generates a hardened Dockerfile for the specified PHP version and platform.

Usage:
  dockerfile-generator build:dockerfile --php <version> --platform <platform> [options]

Required Options:
  --php <version>        ${PHPVersionTypeUtil.getPHPVersionHelpText()}
  --platform <platform>  ${PlatformTypeUtil.getPlatformHelpText()}

Optional Options:
  --arch <architecture>  ${ArchitectureTypeUtil.getArchitectureHelpText()} [default: all]
  --output <path>        Output directory path [default: ./output]

Examples:
  dockerfile-generator build:dockerfile --php 8.3 --platform alpine
  dockerfile-generator build:dockerfile --php 8.2 --platform ubuntu --arch arm64
  dockerfile-generator build:dockerfile --php 8.4 --platform alpine --output ./custom-output
    `;
  }
}
