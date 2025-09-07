/**
 * Dockerfile Generator Service
 *
 * This service uses dockerfile-generator to programmatically create Dockerfiles
 * instead of using Handlebars templates.
 */

import { ErrorHandlerService } from './error-handler';
import { logger } from './logger';
import type { FinalConfig, ArchitectureValue } from '@/types';
import { ConfigLoaderError, ErrorSeverity, ErrorType } from '@/types';
import * as fs from 'fs-extra';
import * as path from 'path';
import Joi from 'joi';

// Import existing validators
import { finalConfigSchema } from '@/validators';

// Import architecture utility
import { ArchitectureTypeUtil } from '@/utils';

// Import dockerfile-generator package
import { generateDockerFile } from 'dockerfile-generator';

/**
 * Interface for dockerfile-generator JSON input format
 */
export interface DockerfileGeneratorInput {
  from: string;
  run?: string[];
  volumes?: string[];
  user?: string;
  working_dir?: string;
  labels?: Record<string, string>;
  env?: Record<string, string>;
  add?: Record<string, string>;
  copy?: Record<string, string>;
  entrypoint?: string | string[];
  cmd?: string | string[];
  expose?: string[];
  args?: string[];
  stopsignal?: string;
  shell?: string[];
  comment?: string;
}

// Use existing FinalConfig type instead of custom BuildConfig

// Use existing finalConfigSchema from validators instead of custom schema

export class DockerfileGeneratorService {
  private static readonly SERVICE_NAME = 'dockerfile-generator' as const;
  private static readonly OPERATION_GENERATE_DOCKERFILE = 'generateDockerfile' as const;
  private static readonly OPERATION_WRITE_OUTPUT = 'writeOutput' as const;

  private readonly errorHandler: ErrorHandlerService;

  constructor(errorHandler?: ErrorHandlerService) {
    this.errorHandler =
      errorHandler ||
      new ErrorHandlerService({
        maxRetries: 2,
        retryDelay: 1000,
        enableRecovery: true,
        enableClassification: true,
        enableUserFriendlyMessages: true,
      });
  }

  async generateDockerfile(config: FinalConfig, architecture: ArchitectureValue): Promise<string> {
    try {
      // Validate input parameters
      this.validateBuildConfig(config);
      this.validateArchitecture(architecture);

      logger.info('Generating Dockerfile', {
        service: DockerfileGeneratorService.SERVICE_NAME,
        operation: DockerfileGeneratorService.OPERATION_GENERATE_DOCKERFILE,
        metadata: {
          phpVersion: config.php.version,
          platform: config.platform,
          architecture,
        },
      });

      // Convert FinalConfig to dockerfile-generator JSON format
      const dockerfileInput = this.convertToDockerfileGeneratorInput(config, architecture);

      // Generate Dockerfile using dockerfile-generator
      return await generateDockerFile(dockerfileInput);
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        operation: 'generateDockerfile',
        phpVersion: config.php.version,
        platform: config.platform,
        architecture,
      });
      throw error; // Re-throw to ensure function exits
    }
  }

  /**
   * Generates Dockerfiles for multiple architectures
   * @param config Build configuration
   * @param architectures Array of target architectures
   * @returns Map of architecture to generated Dockerfile content
   */
  async generateMultiArchDockerfiles(
    config: FinalConfig,
    architectures: ArchitectureValue[]
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    logger.info('Generating multi-architecture Dockerfiles', {
      service: DockerfileGeneratorService.SERVICE_NAME,
      operation: 'generateMultiArchDockerfiles',
      metadata: {
        phpVersion: config.php.version,
        platform: config.platform,
        architectures,
      },
    });

    // Generate Dockerfiles for each architecture in parallel
    const promises = architectures.map(async arch => {
      try {
        const dockerfile = await this.generateDockerfile(config, arch);
        results.set(arch, dockerfile);

        logger.info('Generated Dockerfile for architecture', {
          service: DockerfileGeneratorService.SERVICE_NAME,
          operation: 'generateMultiArchDockerfiles',
          metadata: { architecture: arch, dockerfileLength: dockerfile.length },
        });
      } catch (error) {
        logger.error('Failed to generate Dockerfile for architecture', {
          service: DockerfileGeneratorService.SERVICE_NAME,
          operation: 'generateMultiArchDockerfiles',
          metadata: { architecture: arch, error: (error as Error).message },
        });
        throw error;
      }
    });

    await Promise.all(promises);
    return results;
  }

  async writeOutput(dockerfile: string, outputPath: string): Promise<void> {
    try {
      // Validate input parameters
      this.validateDockerfile(dockerfile);
      this.validateOutputPath(outputPath);

      logger.info('Writing Dockerfile to output', {
        service: DockerfileGeneratorService.SERVICE_NAME,
        operation: DockerfileGeneratorService.OPERATION_WRITE_OUTPUT,
        metadata: { outputPath },
      });

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.ensureDir(outputDir);

      // Write Dockerfile to file
      await fs.writeFile(outputPath, dockerfile, 'utf8');

      logger.info('Dockerfile written successfully', {
        service: DockerfileGeneratorService.SERVICE_NAME,
        operation: DockerfileGeneratorService.OPERATION_WRITE_OUTPUT,
        metadata: { outputPath, fileSize: dockerfile.length },
      });
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        operation: 'writeOutput',
        outputPath,
        dockerfileLength: dockerfile.length,
      });
    }
  }

  /**
   * Writes multiple Dockerfiles to organized output directories
   * @param dockerfiles Map of architecture to Dockerfile content
   * @param baseOutputPath Base output directory path
   * @param config Build configuration for naming
   */
  async writeMultiArchOutput(
    dockerfiles: Map<string, string>,
    baseOutputPath: string,
    config: FinalConfig
  ): Promise<void> {
    try {
      logger.info('Writing multi-architecture Dockerfiles', {
        service: DockerfileGeneratorService.SERVICE_NAME,
        operation: 'writeMultiArchOutput',
        metadata: {
          baseOutputPath,
          architectures: Array.from(dockerfiles.keys()),
          phpVersion: config.php.version,
          platform: config.platform,
        },
      });

      const promises = Array.from(dockerfiles.entries()).map(async ([arch, dockerfile]) => {
        const outputPath = path.join(
          baseOutputPath,
          `nginx-php-fpm-${config.php.version}-${config.platform}`,
          arch,
          'Dockerfile'
        );

        await this.writeOutput(dockerfile, outputPath);
      });

      await Promise.all(promises);

      logger.info('Multi-architecture Dockerfiles written successfully', {
        service: DockerfileGeneratorService.SERVICE_NAME,
        operation: 'writeMultiArchOutput',
        metadata: {
          baseOutputPath,
          architectures: Array.from(dockerfiles.keys()),
          totalFiles: dockerfiles.size,
        },
      });
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        operation: 'writeMultiArchOutput',
        baseOutputPath,
        architectures: Array.from(dockerfiles.keys()),
      });
    }
  }

  /**
   * Converts FinalConfig to dockerfile-generator JSON input format
   * @param config Final configuration
   * @param architecture Target architecture
   * @returns DockerfileGeneratorInput object
   */
  private convertToDockerfileGeneratorInput(
    config: FinalConfig,
    architecture: ArchitectureValue
  ): DockerfileGeneratorInput {
    const baseImage = config.build.baseImage;
    const runCommands: string[] = [];
    const labels: Record<string, string> = {
      'org.opencontainers.image.description': `PHP ${config.php.version} on ${config.platform}`,
      'org.opencontainers.image.version': config.php.version,
      'org.opencontainers.image.platform': config.platform,
      'org.opencontainers.image.architecture': architecture,
    };

    // Platform-specific package installation
    if (config.platform === 'alpine') {
      runCommands.push(`apk add --no-cache ${config.php.extensions.join(' ')}`);
    } else if (config.platform === 'ubuntu') {
      runCommands.push(`apt-get update && apt-get install -y ${config.php.extensions.join(' ')}`);
    }

    // Security setup
    runCommands.push(
      `groupadd -r ${config.security.group} && useradd -r -g ${config.security.group} ${config.security.user}`
    );

    // Platform-specific cleanup
    if (config.platformSpecific) {
      config.platformSpecific.cleanupCommands.forEach(cmd => {
        runCommands.push(cmd);
      });
    }

    return {
      from: baseImage,
      run: runCommands,
      user: config.security.user,
      working_dir: '/var/www/html',
      labels,
      env: {
        PHP_VERSION: config.php.version,
        PLATFORM: config.platform,
        ARCHITECTURE: architecture,
      },
      copy: {
        'php-fpm.conf': `/etc/php/${config.php.version}/fpm/php-fpm.conf`,
        'nginx.conf': '/etc/nginx/nginx.conf',
        's6-overlay/': '/etc/s6-overlay/',
      },
      expose: ['80'],
      cmd: ['/init'],
      comment: `Generated Dockerfile for PHP ${config.php.version} on ${config.platform} (${architecture})`,
    };
  }

  /**
   * Validates final configuration using existing Joi schema
   * @param config Final configuration to validate
   */
  private validateBuildConfig(config: FinalConfig): void {
    const { error } = finalConfigSchema.validate(config, {
      abortEarly: false, // Collect all validation errors
      stripUnknown: false, // Don't strip unknown properties
      allowUnknown: false, // Reject unknown properties
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      const suggestions = this.generateValidationSuggestions(error.details);

      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        `Configuration validation failed: ${errorMessages.join(', ')}`,
        ErrorSeverity.HIGH,
        {
          config: config,
          validationErrors: error.details,
          errorCount: error.details.length,
        },
        suggestions
      );
    }
  }

  /**
   * Generates helpful suggestions based on validation errors
   * @param details Validation error details
   * @returns Array of suggestion strings
   */
  private generateValidationSuggestions(details: Joi.ValidationErrorItem[]): string[] {
    const suggestions: string[] = [];

    details.forEach(detail => {
      const path = detail.path || detail.context?.key || 'unknown';
      const firstPathElement = Array.isArray(path) ? path[0] : path;
      switch (firstPathElement) {
        case 'php':
          suggestions.push('Check PHP configuration including version and extensions');
          break;
        case 'platform':
          suggestions.push('Use "alpine" for Alpine Linux or "ubuntu" for Ubuntu');
          break;
        case 'architecture':
          suggestions.push('Use "arm64" for ARM64 or "amd64" for AMD64');
          break;
        case 'build':
          suggestions.push('Check build configuration including baseImage');
          break;
        case 'security':
          suggestions.push('Check security configuration including user, group, and capabilities');
          break;
        default:
          suggestions.push(
            `Check the ${Array.isArray(path) ? path.join('.') : path} field configuration`
          );
      }
    });

    return suggestions;
  }

  /**
   * Validates architecture parameter using project validators
   * @param architecture Architecture to validate
   */
  private validateArchitecture(architecture: string): void {
    if (!ArchitectureTypeUtil.isValidArchitecture(architecture)) {
      const supportedArchitectures = ArchitectureTypeUtil.getAllArchitectures();
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        `Invalid architecture: ${architecture}`,
        ErrorSeverity.HIGH,
        { architecture, type: typeof architecture, supportedArchitectures },
        [`Supported architectures: ${supportedArchitectures.join(', ')}`]
      );
    }
  }

  /**
   * Validates Dockerfile content
   * @param dockerfile Dockerfile content to validate
   */
  private validateDockerfile(dockerfile: string): void {
    if (!dockerfile || dockerfile.trim().length === 0) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Dockerfile content is required and cannot be empty',
        ErrorSeverity.HIGH,
        { dockerfile: dockerfile, type: typeof dockerfile },
        ['Provide valid non-empty Dockerfile content as a string']
      );
    }
  }

  /**
   * Validates output path
   * @param outputPath Output path to validate
   */
  private validateOutputPath(outputPath: string): void {
    if (!outputPath || outputPath.trim().length === 0) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Output path is required and cannot be empty',
        ErrorSeverity.HIGH,
        { outputPath, type: typeof outputPath },
        ['Provide a valid non-empty file path for the output']
      );
    }
  }

  /**
   * Gets the error handler instance
   * @returns ErrorHandlerService instance
   */
  getErrorHandler(): ErrorHandlerService {
    return this.errorHandler;
  }
}
