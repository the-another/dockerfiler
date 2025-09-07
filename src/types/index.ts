/**
 * Types Module
 *
 * This module exports all TypeScript type definitions and interfaces for the Dockerfile Generator CLI.
 * Provides a centralized export point for all type definitions organized by category.
 */

// Export all enums and utility functions
export * from './enums';

// Export all configuration interfaces
export * from './configs';

// Export all command argument interfaces
export * from './commands';

// Export all error types and custom error classes
export * from './errors';

// Export all template data interfaces
export * from './templates';

// Export all Docker integration interfaces
export * from './docker';

// Export all service-related type definitions
export * from './services';

// Export dockerfile-generator type definitions
// Note: Commented out due to module resolution issues in tests
// The types are still available through direct import from './dockerfile-generator'
// export * from './dockerfile-generator';
