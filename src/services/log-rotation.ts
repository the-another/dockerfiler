/**
 * Log Rotation Service
 *
 * This module implements log rotation functionality for the structured logging system.
 * It handles log file rotation, cleanup, and management to prevent disk space issues.
 */

import { promises as fs } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { logger } from './logger';

/**
 * Log rotation configuration
 */
export interface LogRotationConfig {
  /** Maximum file size in bytes before rotation */
  readonly maxFileSize: number;
  /** Maximum number of rotated files to keep */
  readonly maxFiles: number;
  /** Whether to compress rotated files */
  readonly compress: boolean;
  /** Whether to enable automatic rotation */
  readonly enableRotation: boolean;
  /** Rotation check interval in milliseconds */
  readonly checkInterval: number;
}

/**
 * Default log rotation configuration
 */
export const DEFAULT_LOG_ROTATION_CONFIG: LogRotationConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  compress: true,
  enableRotation: true,
  checkInterval: 60000, // 1 minute
} as const;

/**
 * Log rotation service
 * Handles log file rotation, cleanup, and management
 */
export class LogRotationService {
  private static readonly SERVICE_NAME = 'log-rotation' as const;

  private readonly config: LogRotationConfig;
  private readonly logFilePath: string;
  private rotationTimer?: NodeJS.Timeout | undefined;
  private isRotating = false;

  constructor(logFilePath: string, config: Partial<LogRotationConfig> = {}) {
    this.logFilePath = resolve(logFilePath);
    this.config = { ...DEFAULT_LOG_ROTATION_CONFIG, ...config };
  }

  /**
   * Start automatic log rotation
   */
  start(): void {
    if (!this.config.enableRotation) {
      logger.debug('Log rotation is disabled', {
        service: LogRotationService.SERVICE_NAME,
        operation: 'start',
      });
      return;
    }

    logger.info('Starting log rotation service', {
      service: LogRotationService.SERVICE_NAME,
      operation: 'start',
      metadata: {
        logFilePath: this.logFilePath,
        maxFileSize: this.config.maxFileSize,
        maxFiles: this.config.maxFiles,
        checkInterval: this.config.checkInterval,
      },
    });

    // Check for rotation immediately
    this.checkAndRotate();

    // Set up periodic rotation check
    this.rotationTimer = setInterval(() => {
      this.checkAndRotate();
    }, this.config.checkInterval);
  }

  /**
   * Stop automatic log rotation
   */
  stop(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = undefined;
    }

    logger.info('Stopped log rotation service', {
      service: LogRotationService.SERVICE_NAME,
      operation: 'stop',
    });
  }

  /**
   * Check if log file needs rotation and perform rotation if necessary
   */
  async checkAndRotate(): Promise<void> {
    if (this.isRotating) {
      return; // Prevent concurrent rotations
    }

    try {
      const stats = await fs.stat(this.logFilePath);

      if (stats.size >= this.config.maxFileSize) {
        await this.rotateLogFile();
      }
    } catch (error) {
      // Log file doesn't exist or can't be accessed
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error(
          'Error checking log file for rotation',
          {
            service: LogRotationService.SERVICE_NAME,
            operation: 'checkAndRotate',
            metadata: { logFilePath: this.logFilePath },
          },
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * Perform log file rotation
   */
  private async rotateLogFile(): Promise<void> {
    this.isRotating = true;

    try {
      logger.info('Starting log file rotation', {
        service: LogRotationService.SERVICE_NAME,
        operation: 'rotateLogFile',
        metadata: { logFilePath: this.logFilePath },
      });

      // Get directory and filename components
      const logDir = dirname(this.logFilePath);
      const logFileName = basename(this.logFilePath, extname(this.logFilePath));
      const logFileExt = extname(this.logFilePath);

      // Rotate existing files
      await this.rotateExistingFiles(logDir, logFileName, logFileExt);

      // Move current log file to .1
      const rotatedFilePath = `${this.logFilePath}.1`;
      await fs.rename(this.logFilePath, rotatedFilePath);

      // Compress if enabled
      if (this.config.compress) {
        await this.compressLogFile(rotatedFilePath);
      }

      logger.info('Log file rotation completed', {
        service: LogRotationService.SERVICE_NAME,
        operation: 'rotateLogFile',
        metadata: {
          logFilePath: this.logFilePath,
          rotatedFilePath,
          compressed: this.config.compress,
        },
      });
    } catch (error) {
      logger.error(
        'Error during log file rotation',
        {
          service: LogRotationService.SERVICE_NAME,
          operation: 'rotateLogFile',
          metadata: { logFilePath: this.logFilePath },
        },
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      this.isRotating = false;
    }
  }

  /**
   * Rotate existing log files (move .1 to .2, .2 to .3, etc.)
   */
  private async rotateExistingFiles(
    logDir: string,
    logFileName: string,
    logFileExt: string
  ): Promise<void> {
    // Start from the highest number and work backwards
    for (let i = this.config.maxFiles - 1; i >= 1; i--) {
      const currentFile = `${logDir}/${logFileName}${logFileExt}.${i}`;
      const nextFile = `${logDir}/${logFileName}${logFileExt}.${i + 1}`;

      try {
        await fs.access(currentFile);

        // If we're at the max files limit, delete the oldest
        if (i === this.config.maxFiles - 1) {
          await fs.unlink(currentFile);
          logger.debug('Deleted oldest log file', {
            service: LogRotationService.SERVICE_NAME,
            operation: 'rotateExistingFiles',
            metadata: { deletedFile: currentFile },
          });
        } else {
          // Move to next number
          await fs.rename(currentFile, nextFile);
          logger.debug('Rotated log file', {
            service: LogRotationService.SERVICE_NAME,
            operation: 'rotateExistingFiles',
            metadata: {
              from: currentFile,
              to: nextFile,
            },
          });
        }
      } catch (error) {
        // File doesn't exist, continue
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          logger.warn('Error rotating log file', {
            service: LogRotationService.SERVICE_NAME,
            operation: 'rotateExistingFiles',
            metadata: { currentFile },
          });
        }
      }
    }
  }

  /**
   * Compress a log file using gzip
   */
  private async compressLogFile(filePath: string): Promise<void> {
    try {
      const { gzip } = await import('zlib');
      const { promisify } = await import('util');
      const gzipAsync = promisify(gzip);

      const fileContent = await fs.readFile(filePath);
      const compressedContent = await gzipAsync(fileContent);

      const compressedFilePath = `${filePath}.gz`;
      await fs.writeFile(compressedFilePath, compressedContent);
      await fs.unlink(filePath); // Remove original file

      logger.debug('Compressed log file', {
        service: LogRotationService.SERVICE_NAME,
        operation: 'compressLogFile',
        metadata: {
          originalFile: filePath,
          compressedFile: compressedFilePath,
          originalSize: fileContent.length,
          compressedSize: compressedContent.length,
        },
      });
    } catch {
      logger.warn('Error compressing log file', {
        service: LogRotationService.SERVICE_NAME,
        operation: 'compressLogFile',
        metadata: { filePath },
      });
    }
  }

  /**
   * Get current log file statistics
   */
  async getLogFileStats(): Promise<{
    exists: boolean;
    size: number;
    lastModified: Date | null;
    needsRotation: boolean;
  }> {
    try {
      const stats = await fs.stat(this.logFilePath);
      return {
        exists: true,
        size: stats.size,
        lastModified: stats.mtime,
        needsRotation: stats.size >= this.config.maxFileSize,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {
          exists: false,
          size: 0,
          lastModified: null,
          needsRotation: false,
        };
      }
      throw error;
    }
  }

  /**
   * Clean up old log files beyond the retention limit
   */
  async cleanupOldLogs(): Promise<void> {
    try {
      const logDir = dirname(this.logFilePath);
      const logFileName = basename(this.logFilePath, extname(this.logFilePath));
      const logFileExt = extname(this.logFilePath);

      logger.info('Starting log cleanup', {
        service: LogRotationService.SERVICE_NAME,
        operation: 'cleanupOldLogs',
        metadata: { logDir, maxFiles: this.config.maxFiles },
      });

      const files = await fs.readdir(logDir);
      const logFiles = files.filter(
        file =>
          file.startsWith(logFileName) &&
          (file.endsWith(logFileExt) || file.endsWith(`${logFileExt}.gz`))
      );

      // Sort files by modification time (oldest first)
      const fileStats = await Promise.all(
        logFiles.map(async file => {
          const filePath = resolve(logDir, file);
          const stats = await fs.stat(filePath);
          return { file, filePath, mtime: stats.mtime };
        })
      );

      fileStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

      // Remove files beyond the retention limit
      const filesToRemove = fileStats.slice(0, -this.config.maxFiles);

      for (const { file, filePath } of filesToRemove) {
        await fs.unlink(filePath);
        logger.debug('Removed old log file', {
          service: LogRotationService.SERVICE_NAME,
          operation: 'cleanupOldLogs',
          metadata: { removedFile: file },
        });
      }

      logger.info('Log cleanup completed', {
        service: LogRotationService.SERVICE_NAME,
        operation: 'cleanupOldLogs',
        metadata: {
          totalFiles: logFiles.length,
          removedFiles: filesToRemove.length,
          remainingFiles: logFiles.length - filesToRemove.length,
        },
      });
    } catch (error) {
      logger.error(
        'Error during log cleanup',
        {
          service: LogRotationService.SERVICE_NAME,
          operation: 'cleanupOldLogs',
        },
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): LogRotationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LogRotationConfig>): void {
    Object.assign(this.config, newConfig);

    logger.info('Updated log rotation configuration', {
      service: LogRotationService.SERVICE_NAME,
      operation: 'updateConfig',
      metadata: { newConfig },
    });
  }
}
