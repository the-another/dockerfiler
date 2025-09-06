#!/usr/bin/env node

import { Command } from 'commander';
import { BuildDockerfileCommand } from '@/commands';
import { BuildImageCommand } from '@/commands';
import { DeployHubCommand } from '@/commands';
import { DeployManifestCommand } from '@/commands';
import { TestLocalCommand } from '@/commands';
import { ValidateConfigCommand } from '@/commands';
import { PHPVersionTypeUtil, PlatformTypeUtil, ArchitectureTypeUtil } from '@/utils';

/**
 * CLI Entry Point
 *
 * This is the main entry point for the Dockerfile Generator CLI.
 * Uses Commander.js for robust command-line argument parsing and routing.
 */

// Constants for repeated string literals
const PHP_VERSION_HELP = PHPVersionTypeUtil.getPHPVersionHelpText();
const PLATFORM_HELP = PlatformTypeUtil.getPlatformHelpText();
const ARCHITECTURE_HELP = ArchitectureTypeUtil.getArchitectureHelpText();
const DEFAULT_OUTPUT_PATH = './output';
const DEFAULT_ARCHITECTURE = 'all';
const DEFAULT_TAG = 'latest';
const DEFAULT_REGISTRY = 'docker.io';

// Constants for option descriptions
const OUTPUT_PATH_DESCRIPTION = 'Output directory path';
const IMAGE_TAG_DESCRIPTION = 'Image tag';
const DOCKER_HUB_USERNAME_DESCRIPTION = 'Docker Hub username';
const DOCKER_HUB_PASSWORD_DESCRIPTION = 'Docker Hub password/token';
const DOCKER_REGISTRY_DESCRIPTION = 'Docker registry URL';

// Constants for option names
const PHP_OPTION = '--php <version>';
const PLATFORM_OPTION = '--platform <platform>';
const ARCH_OPTION = '--arch <architecture>';
const OUTPUT_OPTION = '--output <path>';
const TAG_OPTION = '--tag <tag>';
const USERNAME_OPTION = '--username <username>';
const PASSWORD_OPTION = '--password <password>';
const REGISTRY_OPTION = '--registry <registry>';

const program = new Command();

program
  .name('dockerfile-generator')
  .description(
    'Generate hardened, multi-architecture Docker images for web server setups with Nginx and PHP'
  )
  .version('0.1.0');

// Build commands
program
  .command('build:dockerfile')
  .description('Generate Dockerfile for specified configuration')
  .requiredOption(PHP_OPTION, PHP_VERSION_HELP)
  .requiredOption(PLATFORM_OPTION, PLATFORM_HELP)
  .option(ARCH_OPTION, ARCHITECTURE_HELP, DEFAULT_ARCHITECTURE)
  .option(OUTPUT_OPTION, OUTPUT_PATH_DESCRIPTION, DEFAULT_OUTPUT_PATH)
  .action(async options => {
    try {
      const command = new BuildDockerfileCommand();
      await command.execute({
        phpVersion: PHPVersionTypeUtil.toPHPVersion(options.php),
        platform: PlatformTypeUtil.toPlatform(options.platform),
        architecture: ArchitectureTypeUtil.toArchitecture(options.arch),
        outputPath: options.output,
      });
    } catch (error) {
      console.error('Error generating Dockerfile:', error);
      process.exit(1);
    }
  });

program
  .command('build:image')
  .description('Build Docker image for specified configuration')
  .requiredOption(PHP_OPTION, PHP_VERSION_HELP)
  .requiredOption(PLATFORM_OPTION, PLATFORM_HELP)
  .option(ARCH_OPTION, ARCHITECTURE_HELP, DEFAULT_ARCHITECTURE)
  .option(TAG_OPTION, IMAGE_TAG_DESCRIPTION, DEFAULT_TAG)
  .option(OUTPUT_OPTION, OUTPUT_PATH_DESCRIPTION, DEFAULT_OUTPUT_PATH)
  .option('--push', 'Push image to registry after build', false)
  .action(async options => {
    try {
      const command = new BuildImageCommand();
      await command.execute({
        phpVersion: PHPVersionTypeUtil.toPHPVersion(options.php),
        platform: PlatformTypeUtil.toPlatform(options.platform),
        architecture: ArchitectureTypeUtil.toArchitecture(options.arch),
        tag: options.tag,
        outputPath: options.output,
        push: options.push,
      });
    } catch (error) {
      console.error('Error building image:', error);
      process.exit(1);
    }
  });

// Deploy commands
program
  .command('deploy:hub')
  .description('Deploy image to Docker Hub')
  .requiredOption(PHP_OPTION, PHP_VERSION_HELP)
  .requiredOption(PLATFORM_OPTION, PLATFORM_HELP)
  .requiredOption(TAG_OPTION, IMAGE_TAG_DESCRIPTION)
  .option(USERNAME_OPTION, DOCKER_HUB_USERNAME_DESCRIPTION)
  .option(PASSWORD_OPTION, DOCKER_HUB_PASSWORD_DESCRIPTION)
  .option(REGISTRY_OPTION, DOCKER_REGISTRY_DESCRIPTION, DEFAULT_REGISTRY)
  .action(async options => {
    try {
      const command = new DeployHubCommand();
      await command.execute({
        phpVersion: PHPVersionTypeUtil.toPHPVersion(options.php),
        platform: PlatformTypeUtil.toPlatform(options.platform),
        tag: options.tag,
        username: options.username,
        password: options.password,
        registry: options.registry,
      });
    } catch (error) {
      console.error('Error deploying to hub:', error);
      process.exit(1);
    }
  });

program
  .command('deploy:manifest')
  .description('Create and deploy multi-architecture manifest')
  .requiredOption(PHP_OPTION, PHP_VERSION_HELP)
  .requiredOption(PLATFORM_OPTION, PLATFORM_HELP)
  .requiredOption(TAG_OPTION, IMAGE_TAG_DESCRIPTION)
  .option(USERNAME_OPTION, DOCKER_HUB_USERNAME_DESCRIPTION)
  .option(PASSWORD_OPTION, DOCKER_HUB_PASSWORD_DESCRIPTION)
  .option(REGISTRY_OPTION, DOCKER_REGISTRY_DESCRIPTION, DEFAULT_REGISTRY)
  .action(async options => {
    try {
      const command = new DeployManifestCommand();
      await command.execute({
        phpVersion: PHPVersionTypeUtil.toPHPVersion(options.php),
        platform: PlatformTypeUtil.toPlatform(options.platform),
        tag: options.tag,
        username: options.username,
        password: options.password,
        registry: options.registry,
      });
    } catch (error) {
      console.error('Error deploying manifest:', error);
      process.exit(1);
    }
  });

// Test commands
program
  .command('test:local')
  .description('Test generated configuration locally')
  .requiredOption(PHP_OPTION, PHP_VERSION_HELP)
  .requiredOption(PLATFORM_OPTION, PLATFORM_HELP)
  .option(ARCH_OPTION, ARCHITECTURE_HELP, DEFAULT_ARCHITECTURE)
  .option(OUTPUT_OPTION, OUTPUT_PATH_DESCRIPTION, DEFAULT_OUTPUT_PATH)
  .action(async options => {
    try {
      const command = new TestLocalCommand();
      await command.execute({
        phpVersion: PHPVersionTypeUtil.toPHPVersion(options.php),
        platform: PlatformTypeUtil.toPlatform(options.platform),
        architecture: ArchitectureTypeUtil.toArchitecture(options.arch),
        outputPath: options.output,
      });
    } catch (error) {
      console.error('Error testing locally:', error);
      process.exit(1);
    }
  });

// Validate commands
program
  .command('validate:config')
  .description('Validate configuration for specified setup')
  .requiredOption(PHP_OPTION, PHP_VERSION_HELP)
  .requiredOption(PLATFORM_OPTION, PLATFORM_HELP)
  .option(OUTPUT_OPTION, OUTPUT_PATH_DESCRIPTION, DEFAULT_OUTPUT_PATH)
  .action(async options => {
    try {
      const command = new ValidateConfigCommand();
      await command.execute({
        phpVersion: PHPVersionTypeUtil.toPHPVersion(options.php),
        platform: PlatformTypeUtil.toPlatform(options.platform),
        outputPath: options.output,
      });
    } catch (error) {
      console.error('Error validating config:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
