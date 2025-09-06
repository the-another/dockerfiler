/**
 * Unit Tests for Architecture Type Utility
 *
 * This test suite validates the ArchitectureTypeUtil class functionality
 * for architecture validation, conversion, and help text generation.
 */

import { describe, it, expect } from 'vitest';
import { Architecture, type ArchitectureValue } from '@/types';
import { ArchitectureTypeUtil } from '@/utils';

describe('ArchitectureTypeUtil - Architecture Validation', () => {
  it('should validate valid architectures', () => {
    // Test that all valid architectures are correctly identified
    expect(ArchitectureTypeUtil.isValidArchitecture('arm64')).toBe(true);
    expect(ArchitectureTypeUtil.isValidArchitecture('amd64')).toBe(true);
    expect(ArchitectureTypeUtil.isValidArchitecture('all')).toBe(true);
  });

  it('should reject invalid architectures', () => {
    // Test that invalid architectures are correctly rejected
    expect(ArchitectureTypeUtil.isValidArchitecture('arm32')).toBe(false);
    expect(ArchitectureTypeUtil.isValidArchitecture('x86')).toBe(false);
    expect(ArchitectureTypeUtil.isValidArchitecture('ppc64')).toBe(false);
    expect(ArchitectureTypeUtil.isValidArchitecture('invalid')).toBe(false);
    expect(ArchitectureTypeUtil.isValidArchitecture('')).toBe(false);
  });

  it('should convert valid architecture strings to enums', () => {
    // Test that valid architecture strings are correctly converted to enum values
    expect(ArchitectureTypeUtil.toArchitecture('arm64')).toBe(Architecture.ARM64);
    expect(ArchitectureTypeUtil.toArchitecture('amd64')).toBe(Architecture.AMD64);
    expect(ArchitectureTypeUtil.toArchitecture('all')).toBe(Architecture.ALL);
  });

  it('should throw error for invalid architecture conversion', () => {
    // Test that invalid architecture strings throw appropriate errors
    expect(() => ArchitectureTypeUtil.toArchitecture('arm32')).toThrow(
      'Invalid architecture: arm32'
    );
    expect(() => ArchitectureTypeUtil.toArchitecture('invalid')).toThrow(
      'Invalid architecture: invalid'
    );
    expect(() => ArchitectureTypeUtil.toArchitecture('')).toThrow('Invalid architecture: ');
  });

  it('should return all architectures as array', () => {
    // Test that getAllArchitectures returns all supported architectures
    const architectures = ArchitectureTypeUtil.getAllArchitectures();
    expect(architectures).toHaveLength(3);
    expect(architectures).toContain('arm64');
    expect(architectures).toContain('amd64');
    expect(architectures).toContain('all');
  });

  it('should generate correct architecture help text', () => {
    // Test that help text includes all supported architectures
    const helpText = ArchitectureTypeUtil.getArchitectureHelpText();
    expect(helpText).toContain('arm64');
    expect(helpText).toContain('amd64');
    expect(helpText).toContain('all');
    expect(helpText).toMatch(/^Architecture \(.*\)$/);
  });
});

describe('ArchitectureTypeUtil - Type Safety', () => {
  it('should provide type-safe architecture values', () => {
    // Test that ArchitectureValue type works correctly
    const architecture: ArchitectureValue = 'arm64';
    expect(ArchitectureTypeUtil.isValidArchitecture(architecture)).toBe(true);
  });
});

describe('ArchitectureTypeUtil - Error Messages', () => {
  it('should provide helpful error messages for architectures', () => {
    // Test that error messages include all supported architectures
    try {
      ArchitectureTypeUtil.toArchitecture('invalid');
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

describe('ArchitectureTypeUtil - Edge Cases', () => {
  it('should handle null and undefined values gracefully', () => {
    // Test that null and undefined values are handled correctly
    expect(ArchitectureTypeUtil.isValidArchitecture(null as never)).toBe(false);
    expect(ArchitectureTypeUtil.isValidArchitecture(undefined as never)).toBe(false);
  });

  it('should handle whitespace correctly', () => {
    // Test that whitespace is handled correctly
    expect(ArchitectureTypeUtil.isValidArchitecture(' arm64 ')).toBe(false);
  });
});
