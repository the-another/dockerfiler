import type { Command } from './index.js';
import { DockerBuildService } from '@/services';
import { ConfigManager } from '@/services';
import { ValidationEngine } from '@/services';
import { PHPVersion, Platform, Architecture, EnumUtils } from '@/types';

export interface BuildImageArgs {
  phpVersion: PHPVersion;
  platform: Platform;
  architecture: Architecture;
  tag: string;
  outputPath: string;
  push: boolean;
}

export class BuildImageCommand implements Command<BuildImageArgs, void> {
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

      console.log(
        `✅ Docker image built successfully for PHP ${args.phpVersion} on ${args.platform} (${args.architecture})`
      );
      console.log(`🐳 Image ID: ${imageId}`);

      // Push image if requested
      if (args.push) {
        await this.dockerBuildService.pushImage(imageId, args.tag);
        console.log(`📤 Image pushed successfully with tag: ${args.tag}`);
      }
    } catch (error) {
      console.error('❌ Error building Docker image:', error);
      throw error;
    }
  }

  validateArgs(args: BuildImageArgs): void {
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

    // Validate architecture using enum validation
    if (!EnumUtils.isValidArchitecture(args.architecture)) {
      throw new Error(
        `Invalid architecture: ${args.architecture}. Supported architectures: ${EnumUtils.getAllArchitectures().join(', ')}`
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
  --php <version>        ${EnumUtils.getPHPVersionHelpText()}
  --platform <platform>  ${EnumUtils.getPlatformHelpText()}

Optional Options:
  --arch <architecture>  ${EnumUtils.getArchitectureHelpText()} [default: all]
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
