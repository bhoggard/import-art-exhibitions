#!/usr/bin/env node

/**
 * Main entry point for the CLI application
 */

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { CLIOptions } from './types';
import { initArenaClient, fetchChannelItems } from './arena';
import { initAnthropicClient, extractExhibitionData } from './extractor';

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

        // 1. Fetch items from are.na channel
        console.error('Fetching items from are.na...');
        const items = await fetchChannelItems(arenaClient, channel, options.limit);
        console.error(`Found ${items.length} items`);

        // 2. For each item, extract exhibition data using Claude
        const results = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const url = item.source?.url || item.image?.original?.url;

          if (!url) {
            console.error(`Skipping item ${i + 1}: no URL found`);
            continue;
          }

          console.error(`Processing ${i + 1}/${items.length}: ${url}`);

          try {
            const exhibition = await extractExhibitionData(anthropicClient, url);
            results.push(exhibition);
          } catch (error) {
            console.error(`Error processing ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // 3. Output JSON to stdout
        console.log(JSON.stringify(results, null, 2));
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
