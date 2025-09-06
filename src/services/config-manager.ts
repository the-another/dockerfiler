/**
 * Configuration Manager Service
 *
 * This service manages configuration loading and inheritance for different
 * PHP versions and platforms.
 */

import type { BuildConfig } from '@/services';
import { ErrorHandlerService } from './error-handler';
import { logger } from './logger';
import { ConfigLoaderError, ErrorType, ErrorSeverity } from '@/types';

export class ConfigManager {
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

  async loadConfig(phpVersion: string, platform: 'alpine' | 'ubuntu'): Promise<BuildConfig> {
    try {
      // Validate input parameters
      this.validateInputs(phpVersion, platform);

      logger.info('Loading configuration', {
        service: 'config-manager',
        operation: 'loadConfig',
        metadata: { phpVersion, platform },
      });

      // Placeholder configuration - will be replaced with actual config loading
      return this.getPlaceholderConfig(phpVersion, platform);
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        operation: 'loadConfig',
        phpVersion,
        platform,
      });
      throw error; // Re-throw to ensure function exits
    }
  }

  private getPlaceholderConfig(phpVersion: string, platform: 'alpine' | 'ubuntu'): BuildConfig {
    const baseConfig: BuildConfig = {
      phpVersion,
      platform,
      architecture: 'amd64', // Will be overridden based on architecture parameter
      packages: ['nginx', 'php', 'php-fpm', 'php-mbstring', 'php-xml', 'php-curl', 's6-overlay'],
      security: {
        user: 'www-data',
        group: 'www-data',
        nonRoot: true,
        readOnlyRoot: true,
        capabilities: ['CHOWN', 'SETGID', 'SETUID'],
      },
    };

    if (platform === 'alpine') {
      baseConfig.alpine = {
        cleanupCommands: ['apk cache clean', 'rm -rf /var/cache/apk/*'],
      };
    } else if (platform === 'ubuntu') {
      baseConfig.ubuntu = {
        cleanupCommands: ['apt-get clean', 'rm -rf /var/lib/apt/lists/*'],
      };
    }

    return baseConfig;
  }

  /**
   * Validates input parameters for configuration loading
   * @param phpVersion PHP version string
   * @param platform Platform string
   */
  private validateInputs(phpVersion: string, platform: 'alpine' | 'ubuntu'): void {
    if (!phpVersion || typeof phpVersion !== 'string') {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'PHP version is required and must be a string',
        ErrorSeverity.HIGH,
        { phpVersion, type: typeof phpVersion },
        ['Provide a valid PHP version string (e.g., "8.3", "8.4")']
      );
    }

    if (!platform || !['alpine', 'ubuntu'].includes(platform)) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        'Platform must be either "alpine" or "ubuntu"',
        ErrorSeverity.HIGH,
        { platform, type: typeof platform },
        ['Use "alpine" for Alpine Linux or "ubuntu" for Ubuntu']
      );
    }

    // Validate PHP version format
    const phpVersionPattern = /^[78]\.[0-4]$/;
    if (!phpVersionPattern.test(phpVersion)) {
      throw new ConfigLoaderError(
        ErrorType.VALIDATION_ERROR,
        `Invalid PHP version format: ${phpVersion}`,
        ErrorSeverity.HIGH,
        { phpVersion, pattern: phpVersionPattern.source },
        [
          'PHP version must be in format X.Y where X is 7 or 8 and Y is 0-4',
          'Examples: "7.4", "8.0", "8.1", "8.2", "8.3", "8.4"',
        ]
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
