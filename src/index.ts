#!/usr/bin/env node

/**
 * Main entry point for the CLI application
 */

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { CLIOptions } from './types';
import { initArenaClient } from './arena';
import { initAnthropicClient } from './extractor';

// Load environment variables
dotenv.config();

/**
 * Main function to run the application
 */
async function main() {
  const program = new Command();

  program
    .name('import-art-exhibitions')
    .description('Import art exhibition data from are.na using Claude AI')
    .version('1.0.0')
    .option('-l, --limit <number>', 'Limit the number of items to process', parseInt)
    .action(async (options: CLIOptions) => {
      try {
        // Hardcoded channel slug
        const channel = 'art-exhibitions-for-filterizer';

        // Initialize clients
        const arenaClient = initArenaClient();
        const anthropicClient = initAnthropicClient();

        console.error(`Processing channel: ${channel}`);
        if (options.limit) {
          console.error(`Limit: ${options.limit} items`);
        }

        // TODO: Implement the main processing logic
        // 1. Fetch items from are.na channel
        // 2. For each item, extract exhibition data using Claude
        // 3. Output JSON to stdout

        console.error('Implementation coming soon...');
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

// Run the application
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
