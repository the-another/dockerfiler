import type { Command } from './index.js';
import { PHPVersion, Platform } from '@/types';
import { PHPVersionTypeUtil, PlatformTypeUtil } from '@/utils';

export interface DeployManifestArgs {
  phpVersion: PHPVersion;
  platform: Platform;
  tag: string;
  username?: string;
  password?: string;
  registry: string;
}

export class DeployManifestCommand implements Command<DeployManifestArgs, void> {
  async execute(args: DeployManifestArgs): Promise<void> {
    try {
      // Validate arguments
      this.validateArgs(args);

      // TODO: Implement manifest creation and deployment logic
      console.log(
        `🚀 Creating multi-architecture manifest for PHP ${args.phpVersion} on ${args.platform} with tag: ${args.tag}`
      );
      console.log('⚠️  Manifest deployment not yet implemented');
    } catch (error) {
      console.error('❌ Error deploying manifest:', error);
      throw error;
    }
  }

  validateArgs(args: DeployManifestArgs): void {
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

    // Validate tag
    if (!args.tag || args.tag.trim() === '') {
      throw new Error('Image tag is required');
    }

    // Validate registry
    if (!args.registry || args.registry.trim() === '') {
      throw new Error('Registry URL is required');
    }
  }

  getHelp(): string {
    return `
Deploy Manifest Command

Creates and deploys a multi-architecture manifest.

Usage:
  dockerfile-generator deploy:manifest --php <version> --platform <platform> --tag <tag> [options]

Required Options:
  --php <version>        ${PHPVersionTypeUtil.getPHPVersionHelpText()}
  --platform <platform>  ${PlatformTypeUtil.getPlatformHelpText()}
  --tag <tag>            Image tag

Optional Options:
  --username <username>  Docker Hub username
  --password <password>  Docker Hub password/token
  --registry <registry>  Docker registry URL [default: docker.io]

Examples:
  dockerfile-generator deploy:manifest --php 8.3 --platform alpine --tag latest
  dockerfile-generator deploy:manifest --php 8.2 --platform ubuntu --tag v1.0.0 --username myuser
    `;
  }
}
