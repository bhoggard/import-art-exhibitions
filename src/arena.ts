/**
 * Functions for interacting with are.na API
 */

import Arena from 'are.na';

/**
 * Initialize Arena client with access token from environment
 */
export function initArenaClient(): Arena {
  const accessToken = process.env.ARENA_FILTERIZER_KEY;

  if (!accessToken) {
    throw new Error('ARENA_FILTERIZER_KEY environment variable is not set');
  }

  return new Arena({ accessToken });
}

/**
 * Fetch items from an are.na channel
 * @param arena - Arena client instance
 * @param channelSlug - The slug or ID of the channel
 * @param limit - Maximum number of items to fetch
 * @returns Array of channel items with URLs
 */
export async function fetchChannelItems(
  arena: Arena,
  channelSlug: string,
  limit?: number
): Promise<any[]> {
  const params = {
    page: 1,
    per: limit || 100, // Default to 100 items if no limit specified
  };

  const contents = await arena.channel(channelSlug).contents(params);

  // Filter to only items that have a source URL (links)
  return contents.filter((item: any) => item.source?.url || item.image?.original?.url);
}
