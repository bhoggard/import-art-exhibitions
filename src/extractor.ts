/**
 * Functions for extracting exhibition data using Claude AI
 */

import Anthropic from '@anthropic-ai/sdk';
import { Exhibition } from './types';

/**
 * Initialize Anthropic client
 */
export function initAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  return new Anthropic({ apiKey });
}

/**
 * Extract exhibition data from a URL using Claude
 * @param client - Anthropic client instance
 * @param url - The URL to extract data from
 */
export async function extractExhibitionData(
  client: Anthropic,
  url: string
): Promise<Exhibition> {
  // TODO: Implement Claude extraction logic
  // This will be implemented in the next step
  throw new Error('Not implemented yet');
}
