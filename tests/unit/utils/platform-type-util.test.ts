/**
 * Unit Tests for Platform Type Utility
 *
 * This test suite validates the PlatformTypeUtil class functionality
 * for platform validation, conversion, and help text generation.
 */

import { describe, it, expect } from 'vitest';
import { Platform, type PlatformValue } from '@/types';
import { PlatformTypeUtil } from '@/utils';

describe('PlatformTypeUtil - Platform Validation', () => {
  it('should validate valid platforms', () => {
    // Test that all valid platforms are correctly identified
    expect(PlatformTypeUtil.isValidPlatform('alpine')).toBe(true);
    expect(PlatformTypeUtil.isValidPlatform('ubuntu')).toBe(true);
  });

  it('should reject invalid platforms', () => {
    // Test that invalid platforms are correctly rejected
    expect(PlatformTypeUtil.isValidPlatform('debian')).toBe(false);
    expect(PlatformTypeUtil.isValidPlatform('centos')).toBe(false);
    expect(PlatformTypeUtil.isValidPlatform('windows')).toBe(false);
    expect(PlatformTypeUtil.isValidPlatform('invalid')).toBe(false);
    expect(PlatformTypeUtil.isValidPlatform('')).toBe(false);
  });

  it('should convert valid platform strings to enums', () => {
    // Test that valid platform strings are correctly converted to enum values
    expect(PlatformTypeUtil.toPlatform('alpine')).toBe(Platform.ALPINE);
    expect(PlatformTypeUtil.toPlatform('ubuntu')).toBe(Platform.UBUNTU);
  });

  it('should throw error for invalid platform conversion', () => {
    // Test that invalid platform strings throw appropriate errors
    expect(() => PlatformTypeUtil.toPlatform('debian')).toThrow('Invalid platform: debian');
    expect(() => PlatformTypeUtil.toPlatform('invalid')).toThrow('Invalid platform: invalid');
    expect(() => PlatformTypeUtil.toPlatform('')).toThrow('Invalid platform: ');
  });

  it('should return all platforms as array', () => {
    // Test that getAllPlatforms returns all supported platforms
    const platforms = PlatformTypeUtil.getAllPlatforms();
    expect(platforms).toHaveLength(2);
    expect(platforms).toContain('alpine');
    expect(platforms).toContain('ubuntu');
  });

  it('should generate correct platform help text', () => {
    // Test that help text includes all supported platforms
    const helpText = PlatformTypeUtil.getPlatformHelpText();
    expect(helpText).toContain('alpine');
    expect(helpText).toContain('ubuntu');
    expect(helpText).toMatch(/^Platform \(.*\)$/);
  });
});

describe('PlatformTypeUtil - Type Safety', () => {
  it('should provide type-safe platform values', () => {
    // Test that PlatformValue type works correctly
    const platform: PlatformValue = 'alpine';
    expect(PlatformTypeUtil.isValidPlatform(platform)).toBe(true);
  });
});

describe('PlatformTypeUtil - Error Messages', () => {
  it('should provide helpful error messages for platforms', () => {
    // Test that error messages include all supported platforms
    try {
      PlatformTypeUtil.toPlatform('invalid');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const errorMessage = (error as Error).message;
      expect(errorMessage).toContain('Invalid platform: invalid');
      expect(errorMessage).toContain('Supported platforms:');
      expect(errorMessage).toContain('alpine');
      expect(errorMessage).toContain('ubuntu');
    }
  });
});

describe('PlatformTypeUtil - Edge Cases', () => {
  it('should handle null and undefined values gracefully', () => {
    // Test that null and undefined values are handled correctly
    expect(PlatformTypeUtil.isValidPlatform(null as never)).toBe(false);
    expect(PlatformTypeUtil.isValidPlatform(undefined as never)).toBe(false);
  });

  it('should handle case sensitivity correctly', () => {
    // Test that enum validation is case-sensitive
    expect(PlatformTypeUtil.isValidPlatform('Alpine')).toBe(false);
    expect(PlatformTypeUtil.isValidPlatform('ALPINE')).toBe(false);
    expect(PlatformTypeUtil.isValidPlatform('Ubuntu')).toBe(false);
    expect(PlatformTypeUtil.isValidPlatform('UBUNTU')).toBe(false);
  });

  it('should handle whitespace correctly', () => {
    // Test that whitespace is handled correctly
    expect(PlatformTypeUtil.isValidPlatform(' alpine ')).toBe(false);
  });
});
