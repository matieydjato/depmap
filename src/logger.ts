/**
 * Logger — Structured logging abstraction for DepMap.
 *
 * Provides leveled logging (debug, info, warn, error) with
 * a clean API that can be silenced for library usage or testing.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

interface LoggerOptions {
  /** Minimum log level to output (default: "info") */
  level?: LogLevel;
  /** Prefix for all messages (default: "depmap") */
  prefix?: string;
}

class Logger {
  private level: number;
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.level = LOG_LEVELS[options.level ?? "info"];
    this.prefix = options.prefix ?? "depmap";
  }

  /** Update the log level at runtime */
  setLevel(level: LogLevel): void {
    this.level = LOG_LEVELS[level];
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.debug) {
      console.debug(`  [${this.prefix}] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.info) {
      console.log(`  ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.warn) {
      console.warn(`  ⚠ ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.error) {
      console.error(`  ✗ ${message}`, ...args);
    }
  }

  /** Log a success line (at info level) */
  success(message: string): void {
    this.info(`✓ ${message}`);
  }
}

/** Default logger instance used across all modules */
export const logger = new Logger();

export { Logger };
