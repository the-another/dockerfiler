/**
 * Unit Tests for PHP Version Type Utility
 *
 * This test suite validates the PHPVersionTypeUtil class functionality
 * for PHP version validation, conversion, and help text generation.
 */

import { describe, it, expect } from 'vitest';
import { PHPVersion, type PHPVersionValue } from '@/types';
import { PHPVersionTypeUtil } from '@/utils';

describe('PHPVersionTypeUtil - PHP Version Validation', () => {
  it('should validate valid PHP versions', () => {
    // Test that all valid PHP versions are correctly identified
    expect(PHPVersionTypeUtil.isValidPHPVersion('7.4')).toBe(true);
    expect(PHPVersionTypeUtil.isValidPHPVersion('8.0')).toBe(true);
    expect(PHPVersionTypeUtil.isValidPHPVersion('8.1')).toBe(true);
    expect(PHPVersionTypeUtil.isValidPHPVersion('8.2')).toBe(true);
    expect(PHPVersionTypeUtil.isValidPHPVersion('8.3')).toBe(true);
    expect(PHPVersionTypeUtil.isValidPHPVersion('8.4')).toBe(true);
  });

  it('should reject invalid PHP versions', () => {
    // Test that invalid PHP versions are correctly rejected
    expect(PHPVersionTypeUtil.isValidPHPVersion('7.3')).toBe(false);
    expect(PHPVersionTypeUtil.isValidPHPVersion('8.5')).toBe(false);
    expect(PHPVersionTypeUtil.isValidPHPVersion('9.0')).toBe(false);
    expect(PHPVersionTypeUtil.isValidPHPVersion('invalid')).toBe(false);
    expect(PHPVersionTypeUtil.isValidPHPVersion('')).toBe(false);
    expect(PHPVersionTypeUtil.isValidPHPVersion('8')).toBe(false);
    expect(PHPVersionTypeUtil.isValidPHPVersion('8.')).toBe(false);
  });

  it('should convert valid PHP version strings to enums', () => {
    // Test that valid PHP version strings are correctly converted to enum values
    expect(PHPVersionTypeUtil.toPHPVersion('7.4')).toBe(PHPVersion.PHP_7_4);
    expect(PHPVersionTypeUtil.toPHPVersion('8.0')).toBe(PHPVersion.PHP_8_0);
    expect(PHPVersionTypeUtil.toPHPVersion('8.1')).toBe(PHPVersion.PHP_8_1);
    expect(PHPVersionTypeUtil.toPHPVersion('8.2')).toBe(PHPVersion.PHP_8_2);
    expect(PHPVersionTypeUtil.toPHPVersion('8.3')).toBe(PHPVersion.PHP_8_3);
    expect(PHPVersionTypeUtil.toPHPVersion('8.4')).toBe(PHPVersion.PHP_8_4);
  });

  it('should throw error for invalid PHP version conversion', () => {
    // Test that invalid PHP version strings throw appropriate errors
    expect(() => PHPVersionTypeUtil.toPHPVersion('7.3')).toThrow('Invalid PHP version: 7.3');
    expect(() => PHPVersionTypeUtil.toPHPVersion('8.5')).toThrow('Invalid PHP version: 8.5');
    expect(() => PHPVersionTypeUtil.toPHPVersion('invalid')).toThrow(
      'Invalid PHP version: invalid'
    );
    expect(() => PHPVersionTypeUtil.toPHPVersion('')).toThrow('Invalid PHP version: ');
  });

  it('should return all PHP versions as array', () => {
    // Test that getAllPHPVersions returns all supported versions
    const versions = PHPVersionTypeUtil.getAllPHPVersions();
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
    const helpText = PHPVersionTypeUtil.getPHPVersionHelpText();
    expect(helpText).toContain('7.4');
    expect(helpText).toContain('8.0');
    expect(helpText).toContain('8.1');
    expect(helpText).toContain('8.2');
    expect(helpText).toContain('8.3');
    expect(helpText).toContain('8.4');
    expect(helpText).toMatch(/^PHP version \(.*\)$/);
  });
});

describe('PHPVersionTypeUtil - Type Safety', () => {
  it('should provide type-safe PHP version values', () => {
    // Test that PHPVersionValue type works correctly
    const version: PHPVersionValue = '8.3';
    expect(PHPVersionTypeUtil.isValidPHPVersion(version)).toBe(true);
  });
});

describe('PHPVersionTypeUtil - Error Messages', () => {
  it('should provide helpful error messages for PHP versions', () => {
    // Test that error messages include all supported versions
    try {
      PHPVersionTypeUtil.toPHPVersion('invalid');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const errorMessage = (error as Error).message;
      expect(errorMessage).toContain('Invalid PHP version: invalid');
      expect(errorMessage).toContain('Supported versions:');
      expect(errorMessage).toContain('7.4');
      expect(errorMessage).toContain('8.4');
    }
  });
});

describe('PHPVersionTypeUtil - Edge Cases', () => {
  it('should handle null and undefined values gracefully', () => {
    // Test that null and undefined values are handled correctly
    expect(PHPVersionTypeUtil.isValidPHPVersion(null as never)).toBe(false);
    expect(PHPVersionTypeUtil.isValidPHPVersion(undefined as never)).toBe(false);
  });

  it('should handle whitespace correctly', () => {
    // Test that whitespace is handled correctly
    expect(PHPVersionTypeUtil.isValidPHPVersion(' 8.3 ')).toBe(false);
  });
});
