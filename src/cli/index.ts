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
  .requiredOption('--php <version>', PHPVersionTypeUtil.getPHPVersionHelpText())
  .requiredOption('--platform <platform>', PlatformTypeUtil.getPlatformHelpText())
  .option('--arch <architecture>', ArchitectureTypeUtil.getArchitectureHelpText(), 'all')
  .option('--output <path>', 'Output directory path', './output')
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
  .requiredOption('--php <version>', PHPVersionTypeUtil.getPHPVersionHelpText())
  .requiredOption('--platform <platform>', PlatformTypeUtil.getPlatformHelpText())
  .option('--arch <architecture>', ArchitectureTypeUtil.getArchitectureHelpText(), 'all')
  .option('--tag <tag>', 'Image tag', 'latest')
  .option('--output <path>', 'Output directory path', './output')
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
  .requiredOption('--php <version>', PHPVersionTypeUtil.getPHPVersionHelpText())
  .requiredOption('--platform <platform>', PlatformTypeUtil.getPlatformHelpText())
  .requiredOption('--tag <tag>', 'Image tag')
  .option('--username <username>', 'Docker Hub username')
  .option('--password <password>', 'Docker Hub password/token')
  .option('--registry <registry>', 'Docker registry URL', 'docker.io')
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
  .requiredOption('--php <version>', PHPVersionTypeUtil.getPHPVersionHelpText())
  .requiredOption('--platform <platform>', PlatformTypeUtil.getPlatformHelpText())
  .requiredOption('--tag <tag>', 'Image tag')
  .option('--username <username>', 'Docker Hub username')
  .option('--password <password>', 'Docker Hub password/token')
  .option('--registry <registry>', 'Docker registry URL', 'docker.io')
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
  .requiredOption('--php <version>', PHPVersionTypeUtil.getPHPVersionHelpText())
  .requiredOption('--platform <platform>', PlatformTypeUtil.getPlatformHelpText())
  .option('--arch <architecture>', ArchitectureTypeUtil.getArchitectureHelpText(), 'all')
  .option('--output <path>', 'Output directory path', './output')
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
  .requiredOption('--php <version>', PHPVersionTypeUtil.getPHPVersionHelpText())
  .requiredOption('--platform <platform>', PlatformTypeUtil.getPlatformHelpText())
  .option('--output <path>', 'Output directory path', './output')
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
