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
 * @returns Exhibition data extracted from the page
 */
export async function extractExhibitionData(
  client: Anthropic,
  url: string
): Promise<Exhibition> {
  // Fetch the webpage content
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  const html = await response.text();

  // Use Claude Haiku to extract exhibition data
  const prompt = `Extract art exhibition information from this webpage. Return ONLY a JSON object with these exact fields:
- venue_name: The name of the gallery or venue
- title: The title of the exhibition
- start_date: The start date of the exhibition (format: YYYY-MM-DD)
- end_date: The end date of the exhibition (format: YYYY-MM-DD)
- website: The URL (${url})

If any field cannot be determined, use an empty string "".

HTML content:
${html.substring(0, 50000)}`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract the JSON from the response
  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Parse JSON from the response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from Claude response');
  }

  const exhibition: Exhibition = JSON.parse(jsonMatch[0]);
  return exhibition;
}
