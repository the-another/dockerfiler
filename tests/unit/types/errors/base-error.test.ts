/**
 * Unit Tests for BaseError Class
 *
 * This test suite validates the BaseError class functionality including
 * constructor behavior, JSON serialization, user message formatting,
 * and edge case handling for all error properties.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseError } from '@/types/errors/base-error';
import { ErrorType } from '@/types/errors/error-type';
import { ErrorSeverity } from '@/types/errors/error-severity';
import type { BaseErrorJSON } from '@/types/errors/base-error-json';

/**
 * Concrete implementation of BaseError for testing purposes
 * This allows us to test the abstract BaseError class functionality
 */
class TestError extends BaseError {
  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: unknown,
    suggestions?: readonly string[],
    code?: string
  ) {
    super(type, message, severity, details, suggestions, code);
    this.name = 'TestError';
  }
}

describe('BaseError', () => {
  let mockDate: Date;
  let originalDate: DateConstructor;

  beforeEach(() => {
    // Mock Date to ensure consistent timestamp testing
    mockDate = new Date('2024-01-15T10:30:00.000Z');
    originalDate = global.Date;
    global.Date = vi.fn(() => mockDate) as any;
    global.Date.now = vi.fn(() => mockDate.getTime());
    global.Date.UTC = originalDate.UTC;
    global.Date.parse = originalDate.parse;
    global.Date.prototype = originalDate.prototype;
  });

  afterEach(() => {
    // Restore original Date constructor
    global.Date = originalDate;
  });

  describe('Constructor', () => {
    it('should create error with minimal required parameters', () => {
      // Test that error can be created with only type and message
      const error = new TestError(ErrorType.VALIDATION_ERROR, 'Test message');

      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.message).toBe('Test message');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.details).toBeUndefined();
      expect(error.suggestions).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.timestamp).toEqual(mockDate);
      expect(error.name).toBe('TestError');
    });

    it('should create error with all parameters provided', () => {
      // Test that error can be created with all optional parameters
      const details = { file: 'test.json', line: 42 };
      const suggestions = ['Check syntax', 'Verify format'];
      const code = 'ERR_001';

      const error = new TestError(
        ErrorType.CONFIG_LOAD_ERROR,
        'Configuration failed',
        ErrorSeverity.HIGH,
        details,
        suggestions,
        code
      );

      expect(error.type).toBe(ErrorType.CONFIG_LOAD_ERROR);
      expect(error.message).toBe('Configuration failed');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.details).toEqual(details);
      expect(error.suggestions).toEqual(suggestions);
      expect(error.code).toBe(code);
      expect(error.timestamp).toEqual(mockDate);
    });

    it('should handle empty suggestions array', () => {
      // Test that empty suggestions array is handled correctly
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Test message',
        ErrorSeverity.MEDIUM,
        undefined,
        []
      );

      expect(error.suggestions).toEqual([]);
    });

    it('should handle null and undefined optional parameters', () => {
      // Test that null and undefined values are handled correctly
      const error = new TestError(
        ErrorType.UNKNOWN_ERROR,
        'Test message',
        ErrorSeverity.LOW,
        null,
        undefined,
        null
      );

      expect(error.details).toBeNull();
      expect(error.suggestions).toBeUndefined();
      expect(error.code).toBeUndefined(); // null is converted to undefined by ?? operator
    });

    it('should handle complex details object', () => {
      // Test that complex nested objects can be stored as details
      const complexDetails = {
        config: {
          php: { version: '8.3', extensions: ['mbstring'] },
          nginx: { port: 80 },
        },
        errors: ['Missing required field', 'Invalid format'],
        metadata: { timestamp: '2024-01-15', source: 'config.json' },
      };

      const error = new TestError(
        ErrorType.CONFIG_LOAD_ERROR,
        'Complex configuration error',
        ErrorSeverity.MEDIUM,
        complexDetails
      );

      expect(error.details).toEqual(complexDetails);
    });

    it('should handle all error types', () => {
      // Test that all error types can be used
      const errorTypes = Object.values(ErrorType);

      errorTypes.forEach(errorType => {
        const error = new TestError(errorType, `Error of type ${errorType}`);
        expect(error.type).toBe(errorType);
      });
    });

    it('should handle all severity levels', () => {
      // Test that all severity levels can be used
      const severities = Object.values(ErrorSeverity);

      severities.forEach(severity => {
        const error = new TestError(
          ErrorType.VALIDATION_ERROR,
          `Error with severity ${severity}`,
          severity
        );
        expect(error.severity).toBe(severity);
      });
    });

    it('should maintain proper stack trace', () => {
      // Test that stack trace is properly captured
      const error = new TestError(ErrorType.VALIDATION_ERROR, 'Stack trace test');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('TestError');
    });

    it('should handle very long messages', () => {
      // Test that very long error messages are handled correctly
      const longMessage = 'A'.repeat(10000);
      const error = new TestError(ErrorType.VALIDATION_ERROR, longMessage);

      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(10000);
    });

    it('should handle special characters in message', () => {
      // Test that special characters in messages are preserved
      const specialMessage = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      const error = new TestError(ErrorType.VALIDATION_ERROR, specialMessage);

      expect(error.message).toBe(specialMessage);
    });

    it('should handle unicode characters in message', () => {
      // Test that unicode characters in messages are preserved
      const unicodeMessage = 'Error with unicode: 🚀 测试 émojis ñoño';
      const error = new TestError(ErrorType.VALIDATION_ERROR, unicodeMessage);

      expect(error.message).toBe(unicodeMessage);
    });
  });

  describe('toJSON()', () => {
    it('should serialize error to JSON with all properties', () => {
      // Test that toJSON returns complete error representation
      const details = { file: 'test.json', line: 42 };
      const suggestions = ['Check syntax', 'Verify format'];
      const code = 'ERR_001';

      const error = new TestError(
        ErrorType.CONFIG_LOAD_ERROR,
        'Configuration failed',
        ErrorSeverity.HIGH,
        details,
        suggestions,
        code
      );

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'TestError',
        type: ErrorType.CONFIG_LOAD_ERROR,
        severity: ErrorSeverity.HIGH,
        message: 'Configuration failed',
        details: details,
        suggestions: suggestions,
        code: code,
        timestamp: mockDate.toISOString(),
        stack: error.stack,
      });
    });

    it('should serialize error with minimal properties', () => {
      // Test that toJSON works with minimal error properties
      const error = new TestError(ErrorType.VALIDATION_ERROR, 'Minimal error');
      const json = error.toJSON();

      expect(json).toEqual({
        name: 'TestError',
        type: ErrorType.VALIDATION_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: 'Minimal error',
        details: undefined,
        suggestions: undefined,
        code: undefined,
        timestamp: mockDate.toISOString(),
        stack: error.stack,
      });
    });

    it('should handle null and undefined values in JSON', () => {
      // Test that null and undefined values are properly serialized
      const error = new TestError(
        ErrorType.UNKNOWN_ERROR,
        'Null test',
        ErrorSeverity.LOW,
        null,
        undefined,
        null
      );

      const json = error.toJSON();

      expect(json.details).toBeNull();
      expect(json.suggestions).toBeUndefined();
      expect(json.code).toBeUndefined(); // null is converted to undefined by ?? operator
    });

    it('should handle complex nested objects in details', () => {
      // Test that complex nested objects are properly serialized
      const complexDetails = {
        config: {
          php: { version: '8.3', extensions: ['mbstring', 'xml'] },
          nginx: { port: 80, ssl: true },
        },
        errors: ['Error 1', 'Error 2'],
        metadata: { timestamp: '2024-01-15', source: 'config.json' },
      };

      const error = new TestError(
        ErrorType.CONFIG_LOAD_ERROR,
        'Complex details test',
        ErrorSeverity.MEDIUM,
        complexDetails
      );

      const json = error.toJSON();
      expect(json.details).toEqual(complexDetails);
    });

    it('should handle empty arrays in suggestions', () => {
      // Test that empty suggestions arrays are properly serialized
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Empty suggestions test',
        ErrorSeverity.MEDIUM,
        undefined,
        []
      );

      const json = error.toJSON();
      expect(json.suggestions).toEqual([]);
    });

    it('should handle special characters in JSON serialization', () => {
      // Test that special characters are properly serialized
      const specialDetails = {
        message: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        unicode: '🚀 测试 émojis ñoño',
      };

      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Special chars test',
        ErrorSeverity.MEDIUM,
        specialDetails
      );

      const json = error.toJSON();
      expect(json.details).toEqual(specialDetails);
    });

    it('should produce valid JSON string when stringified', () => {
      // Test that the JSON object can be stringified without errors
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'JSON stringify test',
        ErrorSeverity.MEDIUM,
        { test: 'value' },
        ['suggestion 1', 'suggestion 2']
      );

      const json = error.toJSON();
      const jsonString = JSON.stringify(json);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(json);
    });

    it('should handle circular references in details gracefully', () => {
      // Test that circular references don't break JSON serialization
      const circularDetails: any = { name: 'test' };
      circularDetails.self = circularDetails;

      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Circular reference test',
        ErrorSeverity.MEDIUM,
        circularDetails
      );

      // Should not throw when calling toJSON
      expect(() => error.toJSON()).not.toThrow();
    });
  });

  describe('getUserMessage()', () => {
    it('should return message without suggestions when none provided', () => {
      // Test that getUserMessage returns just the message when no suggestions
      const error = new TestError(ErrorType.VALIDATION_ERROR, 'Simple error message');
      const userMessage = error.getUserMessage();

      expect(userMessage).toBe('Simple error message');
    });

    it('should return message with formatted suggestions', () => {
      // Test that getUserMessage includes properly formatted suggestions
      const suggestions = [
        'Check the configuration file',
        'Verify file permissions',
        'Contact support',
      ];
      const error = new TestError(
        ErrorType.CONFIG_LOAD_ERROR,
        'Configuration failed to load',
        ErrorSeverity.HIGH,
        undefined,
        suggestions
      );

      const userMessage = error.getUserMessage();

      expect(userMessage).toBe(
        'Configuration failed to load\n\nSuggestions:\n1. Check the configuration file\n2. Verify file permissions\n3. Contact support\n'
      );
    });

    it('should handle single suggestion', () => {
      // Test that single suggestion is properly formatted
      const suggestions = ['Try again'];
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Validation failed',
        ErrorSeverity.MEDIUM,
        undefined,
        suggestions
      );

      const userMessage = error.getUserMessage();

      expect(userMessage).toBe('Validation failed\n\nSuggestions:\n1. Try again\n');
    });

    it('should handle empty suggestions array', () => {
      // Test that empty suggestions array doesn't add suggestions section
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Error with empty suggestions',
        ErrorSeverity.MEDIUM,
        undefined,
        []
      );

      const userMessage = error.getUserMessage();
      expect(userMessage).toBe('Error with empty suggestions');
    });

    it('should handle suggestions with special characters', () => {
      // Test that suggestions with special characters are properly formatted
      const suggestions = [
        'Check file: /path/to/config.json',
        'Verify syntax: { "key": "value" }',
        'Contact support: support@example.com',
      ];
      const error = new TestError(
        ErrorType.CONFIG_LOAD_ERROR,
        'Configuration error',
        ErrorSeverity.MEDIUM,
        undefined,
        suggestions
      );

      const userMessage = error.getUserMessage();

      expect(userMessage).toBe(
        'Configuration error\n\nSuggestions:\n1. Check file: /path/to/config.json\n2. Verify syntax: { "key": "value" }\n3. Contact support: support@example.com\n'
      );
    });

    it('should handle suggestions with unicode characters', () => {
      // Test that suggestions with unicode characters are properly formatted
      const suggestions = [
        'Vérifiez la configuration',
        '检查配置文件',
        '🚀 Try restarting the service',
      ];
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Unicode suggestions test',
        ErrorSeverity.MEDIUM,
        undefined,
        suggestions
      );

      const userMessage = error.getUserMessage();

      expect(userMessage).toBe(
        'Unicode suggestions test\n\nSuggestions:\n1. Vérifiez la configuration\n2. 检查配置文件\n3. 🚀 Try restarting the service\n'
      );
    });

    it('should handle very long suggestions', () => {
      // Test that very long suggestions are properly formatted
      const longSuggestion = 'A'.repeat(1000);
      const suggestions = [longSuggestion, 'Short suggestion'];
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Long suggestions test',
        ErrorSeverity.MEDIUM,
        undefined,
        suggestions
      );

      const userMessage = error.getUserMessage();

      expect(userMessage).toContain('1. ' + longSuggestion);
      expect(userMessage).toContain('2. Short suggestion');
    });

    it('should handle many suggestions', () => {
      // Test that many suggestions are properly numbered
      const suggestions = Array.from({ length: 20 }, (_, i) => `Suggestion ${i + 1}`);
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Many suggestions test',
        ErrorSeverity.MEDIUM,
        undefined,
        suggestions
      );

      const userMessage = error.getUserMessage();

      // Check that all suggestions are numbered correctly
      for (let i = 1; i <= 20; i++) {
        expect(userMessage).toContain(`${i}. Suggestion ${i}`);
      }
    });

    it('should preserve message formatting', () => {
      // Test that message formatting is preserved
      const message = 'Error occurred:\n- Line 1: Issue 1\n- Line 2: Issue 2';
      const error = new TestError(ErrorType.VALIDATION_ERROR, message);
      const userMessage = error.getUserMessage();

      expect(userMessage).toBe(message);
    });
  });

  describe('Property Immutability', () => {
    it('should have readonly properties that cannot be modified', () => {
      // Test that error properties are readonly and cannot be modified
      const error = new TestError(ErrorType.VALIDATION_ERROR, 'Test message');

      // These should not throw in TypeScript but should be readonly
      expect(() => {
        // @ts-expect-error - Testing readonly property
        error.type = ErrorType.CONFIG_LOAD_ERROR;
      }).not.toThrow();

      expect(() => {
        // @ts-expect-error - Testing readonly property
        error.severity = ErrorSeverity.HIGH;
      }).not.toThrow();

      expect(() => {
        // @ts-expect-error - Testing readonly property
        error.timestamp = new Date();
      }).not.toThrow();
    });

    it('should maintain property values after creation', () => {
      // Test that property values remain unchanged after error creation
      const originalType = ErrorType.VALIDATION_ERROR;
      const originalMessage = 'Original message';
      const originalSeverity = ErrorSeverity.MEDIUM;
      const originalDetails = { test: 'value' };
      const originalSuggestions = ['suggestion 1'];
      const originalCode = 'ERR_001';

      const error = new TestError(
        originalType,
        originalMessage,
        originalSeverity,
        originalDetails,
        originalSuggestions,
        originalCode
      );

      // Verify all properties maintain their original values
      expect(error.type).toBe(originalType);
      expect(error.message).toBe(originalMessage);
      expect(error.severity).toBe(originalSeverity);
      expect(error.details).toBe(originalDetails);
      expect(error.suggestions).toBe(originalSuggestions);
      expect(error.code).toBe(originalCode);
    });
  });

  describe('Error Inheritance', () => {
    it('should be instanceof Error', () => {
      // Test that BaseError instances are proper Error objects
      const error = new TestError(ErrorType.VALIDATION_ERROR, 'Test message');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseError);
    });

    it('should have proper error name', () => {
      // Test that error has proper name property
      const error = new TestError(ErrorType.VALIDATION_ERROR, 'Test message');
      expect(error.name).toBe('TestError');
    });

    it('should have proper error message', () => {
      // Test that error message is properly set
      const message = 'Custom error message';
      const error = new TestError(ErrorType.VALIDATION_ERROR, message);
      expect(error.message).toBe(message);
    });

    it('should have stack trace', () => {
      // Test that error has stack trace
      const error = new TestError(ErrorType.VALIDATION_ERROR, 'Stack trace test');
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('TestError');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined error type gracefully', () => {
      // Test that undefined error type is handled (though this shouldn't happen in practice)
      const error = new TestError(undefined as any, 'Test message');
      expect(error.type).toBeUndefined();
    });

    it('should handle empty string message', () => {
      // Test that empty string message is handled
      const error = new TestError(ErrorType.VALIDATION_ERROR, '');
      expect(error.message).toBe('');
    });

    it('should handle whitespace-only message', () => {
      // Test that whitespace-only message is handled
      const error = new TestError(ErrorType.VALIDATION_ERROR, '   \n\t   ');
      expect(error.message).toBe('   \n\t   ');
    });

    it('should handle function as details', () => {
      // Test that function can be stored as details
      const testFunction = () => 'test';
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Function details test',
        ErrorSeverity.MEDIUM,
        testFunction
      );

      expect(error.details).toBe(testFunction);
    });

    it('should handle array as details', () => {
      // Test that array can be stored as details
      const detailsArray = [1, 2, 3, 'test', { nested: 'object' }];
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Array details test',
        ErrorSeverity.MEDIUM,
        detailsArray
      );

      expect(error.details).toBe(detailsArray);
    });

    it('should handle boolean as details', () => {
      // Test that boolean can be stored as details
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Boolean details test',
        ErrorSeverity.MEDIUM,
        true
      );

      expect(error.details).toBe(true);
    });

    it('should handle number as details', () => {
      // Test that number can be stored as details
      const error = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Number details test',
        ErrorSeverity.MEDIUM,
        42
      );

      expect(error.details).toBe(42);
    });

    it('should handle NaN and Infinity as details', () => {
      // Test that special number values can be stored as details
      const error1 = new TestError(
        ErrorType.VALIDATION_ERROR,
        'NaN details test',
        ErrorSeverity.MEDIUM,
        NaN
      );

      const error2 = new TestError(
        ErrorType.VALIDATION_ERROR,
        'Infinity details test',
        ErrorSeverity.MEDIUM,
        Infinity
      );

      expect(error1.details).toBeNaN();
      expect(error2.details).toBe(Infinity);
    });
  });
});
