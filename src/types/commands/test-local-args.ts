/**
 * Test Local Command Arguments Interface
 *
 * This module contains the TestLocalArgs interface for the Dockerfile Generator CLI.
 */

import type { BaseCommandArgs } from '@/types';

/**
 * Test Local command arguments *  for the test:local command
 */
export interface TestLocalArgs extends BaseCommandArgs {
  /** Test configuration file path */
  readonly testConfig?: string;
  /** Whether to run security tests */
  readonly security?: boolean;
  /** Whether to run performance tests */
  readonly performance?: boolean;
  /** Test timeout in seconds */
  readonly timeout?: number;
  /** Whether to clean up test containers */
  readonly cleanup?: boolean;
}
