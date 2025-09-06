/**
 * Unit Tests for Types Module
 *
 * This test suite validates the enum functionality and utility functions
 * for PHP versions, platforms, and architectures.
 */

import { describe, it, expect } from 'vitest';
import {
  PHPVersion,
  Platform,
  Architecture,
  EnumUtils,
  type PHPVersionValue,
  type PlatformValue,
  type ArchitectureValue,
} from '@/types';

describe('PHPVersion Enum', () => {
  it('should contain all supported PHP versions', () => {
    // Test that all expected PHP versions are present in the enum
    expect(PHPVersion.PHP_7_4).toBe('7.4');
    expect(PHPVersion.PHP_8_0).toBe('8.0');
    expect(PHPVersion.PHP_8_1).toBe('8.1');
    expect(PHPVersion.PHP_8_2).toBe('8.2');
    expect(PHPVersion.PHP_8_3).toBe('8.3');
    expect(PHPVersion.PHP_8_4).toBe('8.4');
  });

  it('should have exactly 6 PHP versions', () => {
    // Test that we have the correct number of PHP versions
    const versions = Object.values(PHPVersion);
    expect(versions).toHaveLength(6);
  });

  it('should have consistent enum values', () => {
    // Test that enum values match their string representations
    const expectedVersions = ['7.4', '8.0', '8.1', '8.2', '8.3', '8.4'];
    const actualVersions = Object.values(PHPVersion);
    expect(actualVersions).toEqual(expectedVersions);
  });
});

describe('Platform Enum', () => {
  it('should contain all supported platforms', () => {
    // Test that all expected platforms are present in the enum
    expect(Platform.ALPINE).toBe('alpine');
    expect(Platform.UBUNTU).toBe('ubuntu');
  });

  it('should have exactly 2 platforms', () => {
    // Test that we have the correct number of platforms
    const platforms = Object.values(Platform);
    expect(platforms).toHaveLength(2);
  });

  it('should have consistent enum values', () => {
    // Test that enum values match their string representations
    const expectedPlatforms = ['alpine', 'ubuntu'];
    const actualPlatforms = Object.values(Platform);
    expect(actualPlatforms).toEqual(expectedPlatforms);
  });
});

describe('Architecture Enum', () => {
  it('should contain all supported architectures', () => {
    // Test that all expected architectures are present in the enum
    expect(Architecture.ARM64).toBe('arm64');
    expect(Architecture.AMD64).toBe('amd64');
    expect(Architecture.ALL).toBe('all');
  });

  it('should have exactly 3 architectures', () => {
    // Test that we have the correct number of architectures
    const architectures = Object.values(Architecture);
    expect(architectures).toHaveLength(3);
  });

  it('should have consistent enum values', () => {
    // Test that enum values match their string representations
    const expectedArchitectures = ['arm64', 'amd64', 'all'];
    const actualArchitectures = Object.values(Architecture);
    expect(actualArchitectures).toEqual(expectedArchitectures);
  });
});

describe('EnumUtils - PHP Version Validation', () => {
  it('should validate valid PHP versions', () => {
    // Test that all valid PHP versions are correctly identified
    expect(EnumUtils.isValidPHPVersion('7.4')).toBe(true);
    expect(EnumUtils.isValidPHPVersion('8.0')).toBe(true);
    expect(EnumUtils.isValidPHPVersion('8.1')).toBe(true);
    expect(EnumUtils.isValidPHPVersion('8.2')).toBe(true);
    expect(EnumUtils.isValidPHPVersion('8.3')).toBe(true);
    expect(EnumUtils.isValidPHPVersion('8.4')).toBe(true);
  });

  it('should reject invalid PHP versions', () => {
    // Test that invalid PHP versions are correctly rejected
    expect(EnumUtils.isValidPHPVersion('7.3')).toBe(false);
    expect(EnumUtils.isValidPHPVersion('8.5')).toBe(false);
    expect(EnumUtils.isValidPHPVersion('9.0')).toBe(false);
    expect(EnumUtils.isValidPHPVersion('invalid')).toBe(false);
    expect(EnumUtils.isValidPHPVersion('')).toBe(false);
    expect(EnumUtils.isValidPHPVersion('8')).toBe(false);
    expect(EnumUtils.isValidPHPVersion('8.')).toBe(false);
  });

  it('should convert valid PHP version strings to enums', () => {
    // Test that valid PHP version strings are correctly converted to enum values
    expect(EnumUtils.toPHPVersion('7.4')).toBe(PHPVersion.PHP_7_4);
    expect(EnumUtils.toPHPVersion('8.0')).toBe(PHPVersion.PHP_8_0);
    expect(EnumUtils.toPHPVersion('8.1')).toBe(PHPVersion.PHP_8_1);
    expect(EnumUtils.toPHPVersion('8.2')).toBe(PHPVersion.PHP_8_2);
    expect(EnumUtils.toPHPVersion('8.3')).toBe(PHPVersion.PHP_8_3);
    expect(EnumUtils.toPHPVersion('8.4')).toBe(PHPVersion.PHP_8_4);
  });

  it('should throw error for invalid PHP version conversion', () => {
    // Test that invalid PHP version strings throw appropriate errors
    expect(() => EnumUtils.toPHPVersion('7.3')).toThrow('Invalid PHP version: 7.3');
    expect(() => EnumUtils.toPHPVersion('8.5')).toThrow('Invalid PHP version: 8.5');
    expect(() => EnumUtils.toPHPVersion('invalid')).toThrow('Invalid PHP version: invalid');
    expect(() => EnumUtils.toPHPVersion('')).toThrow('Invalid PHP version: ');
  });

  it('should return all PHP versions as array', () => {
    // Test that getAllPHPVersions returns all supported versions
    const versions = EnumUtils.getAllPHPVersions();
    expect(versions).toHaveLength(6);
    expect(versions).toContain('7.4');
    expect(versions).toContain('8.0');
    expect(versions).toContain('8.1');
    expect(versions).toContain('8.2');
    expect(versions).toContain('8.3');
    expect(versions).toContain('8.4');
  });

  it('should generate correct PHP version help text', () => {
    // Test that help text includes all supported PHP versions
    const helpText = EnumUtils.getPHPVersionHelpText();
    expect(helpText).toContain('7.4');
    expect(helpText).toContain('8.0');
    expect(helpText).toContain('8.1');
    expect(helpText).toContain('8.2');
    expect(helpText).toContain('8.3');
    expect(helpText).toContain('8.4');
    expect(helpText).toMatch(/^PHP version \(.*\)$/);
  });
});

describe('EnumUtils - Platform Validation', () => {
  it('should validate valid platforms', () => {
    // Test that all valid platforms are correctly identified
    expect(EnumUtils.isValidPlatform('alpine')).toBe(true);
    expect(EnumUtils.isValidPlatform('ubuntu')).toBe(true);
  });

  it('should reject invalid platforms', () => {
    // Test that invalid platforms are correctly rejected
    expect(EnumUtils.isValidPlatform('debian')).toBe(false);
    expect(EnumUtils.isValidPlatform('centos')).toBe(false);
    expect(EnumUtils.isValidPlatform('windows')).toBe(false);
    expect(EnumUtils.isValidPlatform('invalid')).toBe(false);
    expect(EnumUtils.isValidPlatform('')).toBe(false);
  });

  it('should convert valid platform strings to enums', () => {
    // Test that valid platform strings are correctly converted to enum values
    expect(EnumUtils.toPlatform('alpine')).toBe(Platform.ALPINE);
    expect(EnumUtils.toPlatform('ubuntu')).toBe(Platform.UBUNTU);
  });

  it('should throw error for invalid platform conversion', () => {
    // Test that invalid platform strings throw appropriate errors
    expect(() => EnumUtils.toPlatform('debian')).toThrow('Invalid platform: debian');
    expect(() => EnumUtils.toPlatform('invalid')).toThrow('Invalid platform: invalid');
    expect(() => EnumUtils.toPlatform('')).toThrow('Invalid platform: ');
  });

  it('should return all platforms as array', () => {
    // Test that getAllPlatforms returns all supported platforms
    const platforms = EnumUtils.getAllPlatforms();
    expect(platforms).toHaveLength(2);
    expect(platforms).toContain('alpine');
    expect(platforms).toContain('ubuntu');
  });

  it('should generate correct platform help text', () => {
    // Test that help text includes all supported platforms
    const helpText = EnumUtils.getPlatformHelpText();
    expect(helpText).toContain('alpine');
    expect(helpText).toContain('ubuntu');
    expect(helpText).toMatch(/^Platform \(.*\)$/);
  });
});

describe('EnumUtils - Architecture Validation', () => {
  it('should validate valid architectures', () => {
    // Test that all valid architectures are correctly identified
    expect(EnumUtils.isValidArchitecture('arm64')).toBe(true);
    expect(EnumUtils.isValidArchitecture('amd64')).toBe(true);
    expect(EnumUtils.isValidArchitecture('all')).toBe(true);
  });

  it('should reject invalid architectures', () => {
    // Test that invalid architectures are correctly rejected
    expect(EnumUtils.isValidArchitecture('arm32')).toBe(false);
    expect(EnumUtils.isValidArchitecture('x86')).toBe(false);
    expect(EnumUtils.isValidArchitecture('ppc64')).toBe(false);
    expect(EnumUtils.isValidArchitecture('invalid')).toBe(false);
    expect(EnumUtils.isValidArchitecture('')).toBe(false);
  });

  it('should convert valid architecture strings to enums', () => {
    // Test that valid architecture strings are correctly converted to enum values
    expect(EnumUtils.toArchitecture('arm64')).toBe(Architecture.ARM64);
    expect(EnumUtils.toArchitecture('amd64')).toBe(Architecture.AMD64);
    expect(EnumUtils.toArchitecture('all')).toBe(Architecture.ALL);
  });

  it('should throw error for invalid architecture conversion', () => {
    // Test that invalid architecture strings throw appropriate errors
    expect(() => EnumUtils.toArchitecture('arm32')).toThrow('Invalid architecture: arm32');
    expect(() => EnumUtils.toArchitecture('invalid')).toThrow('Invalid architecture: invalid');
    expect(() => EnumUtils.toArchitecture('')).toThrow('Invalid architecture: ');
  });

  it('should return all architectures as array', () => {
    // Test that getAllArchitectures returns all supported architectures
    const architectures = EnumUtils.getAllArchitectures();
    expect(architectures).toHaveLength(3);
    expect(architectures).toContain('arm64');
    expect(architectures).toContain('amd64');
    expect(architectures).toContain('all');
  });

  it('should generate correct architecture help text', () => {
    // Test that help text includes all supported architectures
    const helpText = EnumUtils.getArchitectureHelpText();
    expect(helpText).toContain('arm64');
    expect(helpText).toContain('amd64');
    expect(helpText).toContain('all');
    expect(helpText).toMatch(/^Architecture \(.*\)$/);
  });
});

describe('Type Safety', () => {
  it('should provide type-safe PHP version values', () => {
    // Test that PHPVersionValue type works correctly
    const version: PHPVersionValue = '8.3';
    expect(EnumUtils.isValidPHPVersion(version)).toBe(true);
  });

  it('should provide type-safe platform values', () => {
    // Test that PlatformValue type works correctly
    const platform: PlatformValue = 'alpine';
    expect(EnumUtils.isValidPlatform(platform)).toBe(true);
  });

  it('should provide type-safe architecture values', () => {
    // Test that ArchitectureValue type works correctly
    const architecture: ArchitectureValue = 'arm64';
    expect(EnumUtils.isValidArchitecture(architecture)).toBe(true);
  });
});

describe('Error Messages', () => {
  it('should provide helpful error messages for PHP versions', () => {
    // Test that error messages include all supported versions
    try {
      EnumUtils.toPHPVersion('invalid');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const errorMessage = (error as Error).message;
      expect(errorMessage).toContain('Invalid PHP version: invalid');
      expect(errorMessage).toContain('Supported versions:');
      expect(errorMessage).toContain('7.4');
      expect(errorMessage).toContain('8.4');
    }
  });

  it('should provide helpful error messages for platforms', () => {
    // Test that error messages include all supported platforms
    try {
      EnumUtils.toPlatform('invalid');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const errorMessage = (error as Error).message;
      expect(errorMessage).toContain('Invalid platform: invalid');
      expect(errorMessage).toContain('Supported platforms:');
      expect(errorMessage).toContain('alpine');
      expect(errorMessage).toContain('ubuntu');
    }
  });

  it('should provide helpful error messages for architectures', () => {
    // Test that error messages include all supported architectures
    try {
      EnumUtils.toArchitecture('invalid');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const errorMessage = (error as Error).message;
      expect(errorMessage).toContain('Invalid architecture: invalid');
      expect(errorMessage).toContain('Supported architectures:');
      expect(errorMessage).toContain('arm64');
      expect(errorMessage).toContain('amd64');
      expect(errorMessage).toContain('all');
    }
  });
});

describe('Edge Cases', () => {
  it('should handle null and undefined values gracefully', () => {
    // Test that null and undefined values are handled correctly
    expect(EnumUtils.isValidPHPVersion(null as never)).toBe(false);
    expect(EnumUtils.isValidPHPVersion(undefined as never)).toBe(false);
    expect(EnumUtils.isValidPlatform(null as never)).toBe(false);
    expect(EnumUtils.isValidPlatform(undefined as never)).toBe(false);
    expect(EnumUtils.isValidArchitecture(null as never)).toBe(false);
    expect(EnumUtils.isValidArchitecture(undefined as never)).toBe(false);
  });

  it('should handle case sensitivity correctly', () => {
    // Test that enum validation is case-sensitive
    expect(EnumUtils.isValidPlatform('Alpine')).toBe(false);
    expect(EnumUtils.isValidPlatform('ALPINE')).toBe(false);
    expect(EnumUtils.isValidPlatform('Ubuntu')).toBe(false);
    expect(EnumUtils.isValidPlatform('UBUNTU')).toBe(false);
  });

  it('should handle whitespace correctly', () => {
    // Test that whitespace is handled correctly
    expect(EnumUtils.isValidPHPVersion(' 8.3 ')).toBe(false);
    expect(EnumUtils.isValidPlatform(' alpine ')).toBe(false);
    expect(EnumUtils.isValidArchitecture(' arm64 ')).toBe(false);
  });
});
