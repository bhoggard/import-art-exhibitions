/**
 * Type definitions for the application
 */

/**
 * Exhibition data structure
 */
export interface Exhibition {
  venue_name: string;
  title: string;
  start_date: string;
  end_date: string;
  website: string;
}

/**
 * CLI options
 */
export interface CLIOptions {
  limit?: number;
}
