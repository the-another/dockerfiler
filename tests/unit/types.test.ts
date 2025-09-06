/**
 * Unit Tests for Types Module
 *
 * This test suite validates the enum types for PHP versions, platforms, and architectures.
 */

import { describe, it, expect } from 'vitest';
import { PHPVersion, Platform, Architecture } from '@/types';

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
