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
 * @param channelSlug - The slug or ID of the channel
 * @param limit - Maximum number of items to fetch
 */
export async function fetchChannelItems(
  arena: Arena,
  channelSlug: string,
  limit?: number
): Promise<any[]> {
  // TODO: Implement fetching items from are.na channel
  // This will be implemented in the next step
  throw new Error('Not implemented yet');
}
