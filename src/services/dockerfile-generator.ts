/**
 * Dockerfile Generator Service
 *
 * This service uses dockerfile-generator to programmatically create Dockerfiles
 * instead of using Handlebars templates.
 */

import { ErrorHandlerService } from './error-handler';
import { logger } from './logger';
import { ConfigLoaderError, ErrorType, ErrorSeverity } from '@/types';

export interface BuildConfig {
  phpVersion: string;
  platform: 'alpine' | 'ubuntu';
  architecture: 'arm64' | 'amd64';
  packages: string[];
  security: {
    user: string;
    group: string;
    nonRoot: boolean;
    readOnlyRoot: boolean;
    capabilities: string[];
  };
  alpine?: {
    cleanupCommands: string[];
  };
  ubuntu?: {
    cleanupCommands: string[];
  };
}

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

  async generateDockerfile(
    config: BuildConfig,
    architecture: 'arm64' | 'amd64' | 'all'
  ): Promise<string> {
    try {
      // Validate input parameters
      this.validateBuildConfig(config);
      this.validateArchitecture(architecture);

      logger.info('Generating Dockerfile', {
        service: DockerfileGeneratorService.SERVICE_NAME,
        operation: DockerfileGeneratorService.OPERATION_GENERATE_DOCKERFILE,
        metadata: {
          phpVersion: config.phpVersion,
          platform: config.platform,
          architecture,
        },
      });

      // Placeholder implementation - will be replaced with actual dockerfile-generator usage
      return this.generatePlaceholderDockerfile(config, architecture);
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        operation: 'generateDockerfile',
        phpVersion: config.phpVersion,
        platform: config.platform,
        architecture,
      });
      throw error; // Re-throw to ensure function exits
    }
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
      logger.warn('File writing not yet implemented', {
        service: DockerfileGeneratorService.SERVICE_NAME,
        operation: DockerfileGeneratorService.OPERATION_WRITE_OUTPUT,
      });
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        operation: 'writeOutput',
        outputPath,
        dockerfileLength: dockerfile.length,
      });
    }
  }

  private generatePlaceholderDockerfile(
    config: BuildConfig,
    architecture: 'arm64' | 'amd64' | 'all'
  ): string {
    const baseImage = this.getBaseImage(config.platform, architecture);

    let dockerfile = `# Generated Dockerfile for PHP ${config.phpVersion} on ${config.platform}\n`;
    dockerfile += `# Architecture: ${architecture}\n\n`;
    dockerfile += `FROM ${baseImage}\n\n`;

    // Platform-specific package installation
    if (config.platform === 'alpine') {
      dockerfile += `# Install packages for Alpine\n`;
      dockerfile += `RUN apk add --no-cache ${config.packages.join(' ')}\n\n`;
    } else if (config.platform === 'ubuntu') {
      dockerfile += `# Install packages for Ubuntu\n`;
      dockerfile += `RUN apt-get update && apt-get install -y ${config.packages.join(' ')}\n\n`;
    }

    // Security setup
    dockerfile += `# Security setup\n`;
    dockerfile += `RUN groupadd -r ${config.security.group} && useradd -r -g ${config.security.group} ${config.security.user}\n\n`;

    // PHP configuration
    dockerfile += `# PHP configuration\n`;
    dockerfile += `COPY php-fpm.conf /etc/php/${config.phpVersion}/fpm/php-fpm.conf\n`;
    dockerfile += `COPY nginx.conf /etc/nginx/nginx.conf\n\n`;

    // s6-overlay setup
    dockerfile += `# s6-overlay setup\n`;
    dockerfile += `COPY s6-overlay/ /etc/s6-overlay/\n\n`;

    // Platform-specific cleanup
    if (config.platform === 'alpine' && config.alpine) {
      dockerfile += `# Alpine cleanup\n`;
      config.alpine.cleanupCommands.forEach(cmd => {
        dockerfile += `RUN ${cmd}\n`;
      });
      dockerfile += '\n';
    } else if (config.platform === 'ubuntu' && config.ubuntu) {
      dockerfile += `# Ubuntu cleanup\n`;
      config.ubuntu.cleanupCommands.forEach(cmd => {
        dockerfile += `RUN ${cmd}\n`;
      });
      dockerfile += '\n';
    }

    dockerfile += `EXPOSE 80\n`;
    dockerfile += `CMD ["/init"]\n`;

    return dockerfile;
  }

  private getBaseImage(platform: string, architecture: string): string {
    if (platform === 'alpine') {
      return architecture === 'arm64' ? 'arm64v8/alpine:3.19' : 'amd64/alpine:3.19';
    } else if (platform === 'ubuntu') {
      return architecture === 'arm64' ? 'arm64v8/ubuntu:22.04' : 'amd64/ubuntu:22.04';
    }
    throw new ConfigLoaderError(
      ErrorType.VALIDATION_ERROR,
      `Unsupported platform: ${platform}`,
      ErrorSeverity.HIGH,
      { platform, architecture },
      ['Use "alpine" or "ubuntu" as the platform']
    );
  }

  /**
   * Validates build configuration
   * @param config Build configuration to validate
   */
  private validateBuildConfig(config: BuildConfig): void {
    if (!config) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Build configuration is required',
        ErrorSeverity.HIGH,
        { config },
        ['Provide a valid BuildConfig object']
      );
    }

    if (!config.phpVersion || typeof config.phpVersion !== 'string') {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'PHP version is required and must be a string',
        ErrorSeverity.HIGH,
        { phpVersion: config.phpVersion, type: typeof config.phpVersion },
        ['Provide a valid PHP version string (e.g., "8.3", "8.4")']
      );
    }

    if (!config.platform || !['alpine', 'ubuntu'].includes(config.platform)) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Platform must be either "alpine" or "ubuntu"',
        ErrorSeverity.HIGH,
        { platform: config.platform, type: typeof config.platform },
        ['Use "alpine" for Alpine Linux or "ubuntu" for Ubuntu']
      );
    }

    if (!config.packages || !Array.isArray(config.packages) || config.packages.length === 0) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Packages array is required and must contain at least one package',
        ErrorSeverity.HIGH,
        { packages: config.packages, type: typeof config.packages },
        ['Provide an array of package names to install']
      );
    }

    if (!config.security) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Security configuration is required',
        ErrorSeverity.HIGH,
        { security: config.security },
        ['Provide a valid security configuration object']
      );
    }
  }

  /**
   * Validates architecture parameter
   * @param architecture Architecture to validate
   */
  private validateArchitecture(architecture: string): void {
    if (!architecture || !['arm64', 'amd64', 'all'].includes(architecture)) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Architecture must be "arm64", "amd64", or "all"',
        ErrorSeverity.HIGH,
        { architecture, type: typeof architecture },
        ['Use "arm64" for ARM64, "amd64" for AMD64, or "all" for both']
      );
    }
  }

  /**
   * Validates Dockerfile content
   * @param dockerfile Dockerfile content to validate
   */
  private validateDockerfile(dockerfile: string): void {
    if (!dockerfile || typeof dockerfile !== 'string') {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Dockerfile content is required and must be a string',
        ErrorSeverity.HIGH,
        { dockerfile: dockerfile, type: typeof dockerfile },
        ['Provide valid Dockerfile content as a string']
      );
    }

    if (dockerfile.trim().length === 0) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Dockerfile content cannot be empty',
        ErrorSeverity.HIGH,
        { dockerfileLength: dockerfile.length },
        ['Provide non-empty Dockerfile content']
      );
    }
  }

  /**
   * Validates output path
   * @param outputPath Output path to validate
   */
  private validateOutputPath(outputPath: string): void {
    if (!outputPath || typeof outputPath !== 'string') {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Output path is required and must be a string',
        ErrorSeverity.HIGH,
        { outputPath, type: typeof outputPath },
        ['Provide a valid file path for the output']
      );
    }

    if (outputPath.trim().length === 0) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Output path cannot be empty',
        ErrorSeverity.HIGH,
        { outputPath },
        ['Provide a non-empty output path']
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
