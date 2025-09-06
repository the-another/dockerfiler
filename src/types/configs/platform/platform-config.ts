/**
 * Platform Configuration Interface
 *
 * This module contains the PlatformConfig interface for the Dockerfile Generator CLI.
 */

import type { PlatformValue, BaseConfig, AlpineConfig, UbuntuConfig } from '@/types';

/**
 * Platform-specific configuration interface
 * Extends base configuration with platform-specific settings
 */
export interface PlatformConfig extends BaseConfig {
  /** Platform type (alpine or ubuntu) */
  readonly platform: PlatformValue;
  /** Platform-specific configuration */
  readonly platformSpecific: AlpineConfig | UbuntuConfig;
}
