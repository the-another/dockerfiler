/**
 * Unit tests for DockerfileGeneratorService
 *
 * Tests the dockerfile-generator integration and Dockerfile generation functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DockerfileGeneratorService } from '@/services/dockerfile-generator';
import { ErrorHandlerService } from '@/services/error-handler';
import { ConfigLoaderError } from '@/types';
import * as fs from 'fs-extra';
import * as path from 'path';

// Mock the dockerfile-generator package
vi.mock('dockerfile-generator', () => ({
  generateDockerFile: vi.fn(),
}));

// Mock fs-extra
vi.mock('fs-extra', () => ({
  ensureDir: vi.fn(),
  writeFile: vi.fn(),
}));

// Mock path
vi.mock('path', () => ({
  dirname: vi.fn(),
  join: vi.fn(),
}));

describe('DockerfileGeneratorService', () => {
  let service: DockerfileGeneratorService;
  let mockErrorHandler: ErrorHandlerService;
  let mockGenerateDockerFile: any;
  let mockFs: any;
  let mockPath: any;

  const createTestConfig = (): FinalConfig => ({
    architecture: 'amd64',
    platform: 'alpine',
    build: {
      baseImage: 'amd64/alpine:3.19',
    },
    php: {
      version: '8.3',
      extensions: ['nginx', 'php-fpm', 'php-mbstring'],
      fpm: {
        maxChildren: 50,
        startServers: 5,
        minSpareServers: 5,
        maxSpareServers: 35,
      },
    },
    security: {
      user: 'www-data',
      group: 'www-data',
      nonRoot: true,
      readOnlyRoot: true,
      capabilities: ['CHOWN', 'SETGID', 'SETUID'],
    },
    nginx: {
      workerProcesses: 'auto',
      workerConnections: 1024,
      gzip: true,
      ssl: false,
      options: {
        clientMaxBodySize: '1M',
      },
    },
    s6Overlay: {
      services: ['nginx', 'php-fpm'],
      crontab: ['0 2 * * * /usr/bin/find /var/log -name "*.log" -mtime +7 -delete'],
    },
    platformSpecific: {
      packageManager: {
        useCache: true,
        cleanCache: true,
      },
      optimizations: {
        security: true,
        minimal: true,
        performance: true,
      },
      cleanupCommands: ['rm -rf /var/cache/apk/*'],
    },
  });

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mocks
    const dockerfileGeneratorModule = await import('dockerfile-generator');
    mockGenerateDockerFile = vi.mocked(dockerfileGeneratorModule.generateDockerFile);
    mockFs = vi.mocked(fs);
    mockPath = vi.mocked(path);

    // Setup default mock implementations
    mockGenerateDockerFile.mockResolvedValue('FROM alpine:3.19\nRUN apk add --no-cache nginx\n');
    mockFs.ensureDir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockPath.dirname.mockReturnValue('/test/output');
    mockPath.join.mockImplementation((...args: string[]) => args.join('/'));

    // Create service instance
    mockErrorHandler = new ErrorHandlerService({
      maxRetries: 1,
      retryDelay: 100,
      enableRecovery: false,
      enableClassification: true,
      enableUserFriendlyMessages: true,
    });
    service = new DockerfileGeneratorService(mockErrorHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateDockerfile', () => {
    it('should generate Dockerfile successfully for Alpine AMD64', async () => {
      // Test generates Dockerfile for Alpine Linux on AMD64 architecture
      // ensuring proper conversion from BuildConfig to dockerfile-generator format
      const config = createTestConfig();
      const expectedDockerfile = 'FROM alpine:3.19\nRUN apk add --no-cache nginx\n';

      mockGenerateDockerFile.mockResolvedValue(expectedDockerfile);

      const result = await service.generateDockerfile(config, 'amd64');

      expect(result).toBe(expectedDockerfile);
      expect(mockGenerateDockerFile).toHaveBeenCalledTimes(1);

      // Verify the input format passed to dockerfile-generator
      const callArgs = mockGenerateDockerFile.mock.calls[0][0];
      expect(callArgs.from).toBe('amd64/alpine:3.19');
      expect(callArgs.run).toContain('apk add --no-cache nginx php-fpm php-mbstring');
      expect(callArgs.user).toBe('www-data');
      expect(callArgs.working_dir).toBe('/var/www/html');
      expect(callArgs.expose).toEqual(['80']);
      expect(callArgs.cmd).toEqual(['/init']);
    });

    it('should generate Dockerfile successfully for Ubuntu ARM64', async () => {
      // Test generates Dockerfile for Ubuntu on ARM64 architecture
      // ensuring proper base image selection and package installation commands
      const config: FinalConfig = {
        ...createTestConfig(),
        platform: 'ubuntu',
        architecture: 'arm64',
        build: {
          baseImage: 'arm64v8/ubuntu:22.04',
        },
        platformSpecific: {
          packageManager: {
            updateLists: true,
            upgrade: false,
            cleanCache: true,
          },
          optimizations: {
            security: true,
            minimal: true,
            performance: true,
          },
          cleanupCommands: ['rm -rf /var/lib/apt/lists/*'],
        },
      };
      const expectedDockerfile =
        'FROM arm64v8/ubuntu:22.04\nRUN apt-get update && apt-get install -y nginx\n';

      mockGenerateDockerFile.mockResolvedValue(expectedDockerfile);

      const result = await service.generateDockerfile(config, 'arm64');

      expect(result).toBe(expectedDockerfile);
      expect(mockGenerateDockerFile).toHaveBeenCalledTimes(1);

      // Verify the input format passed to dockerfile-generator
      const callArgs = mockGenerateDockerFile.mock.calls[0][0];
      expect(callArgs.from).toBe('arm64v8/ubuntu:22.04');
      expect(callArgs.run).toContain(
        'apt-get update && apt-get install -y nginx php-fpm php-mbstring'
      );
    });

    it('should handle dockerfile-generator errors gracefully', async () => {
      // Test handles errors from dockerfile-generator package
      // ensuring proper error propagation and logging
      const config = createTestConfig();
      const error = new Error('Dockerfile generation failed');

      mockGenerateDockerFile.mockRejectedValue(error);

      await expect(service.generateDockerfile(config, 'amd64')).rejects.toThrow(
        'Dockerfile generation failed'
      );
      expect(mockGenerateDockerFile).toHaveBeenCalledTimes(1);
    });

    it('should validate BuildConfig before generation', async () => {
      // Test validates BuildConfig parameters before attempting generation
      // ensuring proper input validation and error handling
      const invalidConfig = {
        ...createTestConfig(),
        php: {
          ...createTestConfig().php,
          version: '', // Invalid empty version
        },
      };

      await expect(
        service.generateDockerfile(invalidConfig as FinalConfig, 'amd64')
      ).rejects.toThrow(ConfigLoaderError);

      expect(mockGenerateDockerFile).not.toHaveBeenCalled();
    });

    it('should validate baseImage before generation', async () => {
      // Test validates baseImage parameter before attempting generation
      // ensuring proper input validation and error handling
      const invalidConfig = {
        ...createTestConfig(),
        build: {
          ...createTestConfig().build,
          baseImage: '', // Invalid empty base image
        },
      };

      await expect(
        service.generateDockerfile(invalidConfig as FinalConfig, 'amd64')
      ).rejects.toThrow(ConfigLoaderError);

      expect(mockGenerateDockerFile).not.toHaveBeenCalled();
    });

    it('should validate architecture parameter', async () => {
      // Test validates architecture parameter
      // ensuring only supported architectures are accepted
      const config = createTestConfig();

      await expect(service.generateDockerfile(config, 'invalid' as any)).rejects.toThrow(
        ConfigLoaderError
      );

      expect(mockGenerateDockerFile).not.toHaveBeenCalled();
    });
  });

  describe('generateMultiArchDockerfiles', () => {
    it('should generate Dockerfiles for multiple architectures in parallel', async () => {
      // Test generates Dockerfiles for multiple architectures simultaneously
      // ensuring parallel processing and proper result mapping
      const config = createTestConfig();
      const architectures: ('arm64' | 'amd64')[] = ['arm64', 'amd64'];

      mockGenerateDockerFile
        .mockResolvedValueOnce('FROM arm64v8/alpine:3.19\nRUN apk add --no-cache nginx\n')
        .mockResolvedValueOnce('FROM amd64/alpine:3.19\nRUN apk add --no-cache nginx\n');

      const result = await service.generateMultiArchDockerfiles(config, architectures);

      expect(result.size).toBe(2);
      expect(result.has('arm64')).toBe(true);
      expect(result.has('amd64')).toBe(true);
      expect(mockGenerateDockerFile).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in multi-arch generation', async () => {
      // Test handles failures in multi-architecture generation
      // ensuring proper error propagation when any architecture fails
      const config = createTestConfig();
      const architectures: ('arm64' | 'amd64')[] = ['arm64', 'amd64'];

      mockGenerateDockerFile
        .mockResolvedValueOnce('FROM arm64v8/alpine:3.19\nRUN apk add --no-cache nginx\n')
        .mockRejectedValueOnce(new Error('ARM64 generation failed'));

      await expect(service.generateMultiArchDockerfiles(config, architectures)).rejects.toThrow(
        'ARM64 generation failed'
      );
    });
  });

  describe('writeOutput', () => {
    it('should write Dockerfile to specified path', async () => {
      // Test writes generated Dockerfile to specified output path
      // ensuring proper file system operations and directory creation
      const dockerfile = 'FROM alpine:3.19\nRUN apk add --no-cache nginx\n';
      const outputPath = '/test/output/Dockerfile';

      await service.writeOutput(dockerfile, outputPath);

      expect(mockPath.dirname).toHaveBeenCalledWith(outputPath);
      expect(mockFs.ensureDir).toHaveBeenCalledWith('/test/output');
      expect(mockFs.writeFile).toHaveBeenCalledWith(outputPath, dockerfile, 'utf8');
    });

    it('should validate Dockerfile content before writing', async () => {
      // Test validates Dockerfile content before writing to file
      // ensuring empty or invalid content is rejected
      const invalidDockerfile = '';
      const outputPath = '/test/output/Dockerfile';

      await expect(service.writeOutput(invalidDockerfile, outputPath)).rejects.toThrow(
        ConfigLoaderError
      );

      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it('should validate output path before writing', async () => {
      // Test validates output path before writing file
      // ensuring invalid paths are rejected
      const dockerfile = 'FROM alpine:3.19\nRUN apk add --no-cache nginx\n';
      const invalidPath = '';

      await expect(service.writeOutput(dockerfile, invalidPath)).rejects.toThrow(ConfigLoaderError);

      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('writeMultiArchOutput', () => {
    it('should write multiple Dockerfiles to organized directories', async () => {
      // Test writes multiple Dockerfiles to organized directory structure
      // ensuring proper path construction and parallel file writing
      const dockerfiles = new Map([
        ['arm64', 'FROM arm64v8/alpine:3.19\nRUN apk add --no-cache nginx\n'],
        ['amd64', 'FROM amd64/alpine:3.19\nRUN apk add --no-cache nginx\n'],
      ]);
      const baseOutputPath = '/test/output';
      const config = createTestConfig();

      await service.writeMultiArchOutput(dockerfiles, baseOutputPath, config);

      expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
      expect(mockPath.join).toHaveBeenCalledWith(
        baseOutputPath,
        'nginx-php-fpm-8.3-alpine',
        'arm64',
        'Dockerfile'
      );
      expect(mockPath.join).toHaveBeenCalledWith(
        baseOutputPath,
        'nginx-php-fpm-8.3-alpine',
        'amd64',
        'Dockerfile'
      );
    });

    it('should handle file system errors during multi-arch output', async () => {
      // Test handles file system errors during multi-architecture output writing
      // ensuring proper error handling and cleanup
      const dockerfiles = new Map([
        ['arm64', 'FROM arm64v8/alpine:3.19\nRUN apk add --no-cache nginx\n'],
      ]);
      const baseOutputPath = '/test/output';
      const config = createTestConfig();
      const error = new Error('File system error');

      mockFs.writeFile.mockRejectedValue(error);

      await expect(
        service.writeMultiArchOutput(dockerfiles, baseOutputPath, config)
      ).rejects.toThrow('File system error');
    });
  });

  describe('convertToDockerfileGeneratorInput', () => {
    it('should convert BuildConfig to proper dockerfile-generator format', async () => {
      // Test converts BuildConfig to dockerfile-generator JSON format
      // ensuring all required fields are properly mapped
      const config = createTestConfig();

      // Test the conversion by generating a Dockerfile and checking the input passed to dockerfile-generator
      await service.generateDockerfile(config, 'amd64');

      // Verify the input format passed to dockerfile-generator
      const callArgs = mockGenerateDockerFile.mock.calls[0][0];
      expect(callArgs.from).toBe('amd64/alpine:3.19');
      expect(callArgs.run).toContain('apk add --no-cache nginx php-fpm php-mbstring');
      expect(callArgs.run).toContain('groupadd -r www-data && useradd -r -g www-data www-data');
      expect(callArgs.run).toContain('rm -rf /var/cache/apk/*');
      expect(callArgs.user).toBe('www-data');
      expect(callArgs.working_dir).toBe('/var/www/html');
      expect(callArgs.labels).toHaveProperty('org.opencontainers.image.description');
      expect(callArgs.labels).toHaveProperty('org.opencontainers.image.version', '8.3');
      expect(callArgs.labels).toHaveProperty('org.opencontainers.image.platform', 'alpine');
      expect(callArgs.labels).toHaveProperty('org.opencontainers.image.architecture', 'amd64');
      expect(callArgs.env).toHaveProperty('PHP_VERSION', '8.3');
      expect(callArgs.env).toHaveProperty('PLATFORM', 'alpine');
      expect(callArgs.env).toHaveProperty('ARCHITECTURE', 'amd64');
      expect(callArgs.copy).toHaveProperty('php-fpm.conf');
      expect(callArgs.copy).toHaveProperty('nginx.conf');
      expect(callArgs.copy).toHaveProperty('s6-overlay/');
      expect(callArgs.expose).toEqual(['80']);
      expect(callArgs.cmd).toEqual(['/init']);
      expect(callArgs.comment).toContain('Generated Dockerfile for PHP 8.3 on alpine (amd64)');
    });

    it('should handle Ubuntu platform conversion correctly', async () => {
      // Test converts Ubuntu BuildConfig to proper dockerfile-generator format
      // ensuring Ubuntu-specific commands and base images are used
      const config: FinalConfig = {
        ...createTestConfig(),
        platform: 'ubuntu',
        architecture: 'arm64',
        build: {
          baseImage: 'arm64v8/ubuntu:22.04',
        },
        platformSpecific: {
          packageManager: {
            updateLists: true,
            upgrade: false,
            cleanCache: true,
          },
          optimizations: {
            security: true,
            minimal: true,
            performance: true,
          },
          cleanupCommands: ['rm -rf /var/lib/apt/lists/*'],
        },
      };

      // Clear previous mock calls to ensure clean test
      mockGenerateDockerFile.mockClear();

      // Test the conversion by generating a Dockerfile and checking the input passed to dockerfile-generator
      await service.generateDockerfile(config, 'arm64');

      // Verify the input format passed to dockerfile-generator
      const callArgs = mockGenerateDockerFile.mock.calls[0][0];
      expect(callArgs.from).toBe('arm64v8/ubuntu:22.04');
      expect(callArgs.run).toContain(
        'apt-get update && apt-get install -y nginx php-fpm php-mbstring'
      );
      expect(callArgs.run).toContain('rm -rf /var/lib/apt/lists/*');
    });
  });

  describe('getErrorHandler', () => {
    it('should return the error handler instance', () => {
      // Test returns the configured error handler instance
      // ensuring proper access to error handling functionality
      const errorHandler = service.getErrorHandler();

      expect(errorHandler).toBe(mockErrorHandler);
    });
  });
});
