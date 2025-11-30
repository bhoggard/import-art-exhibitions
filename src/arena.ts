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

/**
 * Move a block from one channel to another (archive it)
 * @param arena - Arena client instance
 * @param blockId - The ID of the block to move
 * @param sourceUrl - The source URL of the block
 * @param sourceChannel - The channel to remove the block from
 * @param targetChannel - The channel to add the block to
 */
export async function archiveBlock(
  arena: Arena,
  blockId: number,
  sourceUrl: string,
  sourceChannel: string,
  targetChannel: string
): Promise<void> {
  try {
    // Add the block to the archive channel using its source URL
    await arena.channel(targetChannel).createBlock({ source: sourceUrl });
    console.error(`  ✓ Added block to ${targetChannel}`);

    // Remove the block from the source channel
    await arena.channel(sourceChannel).deleteBlock(blockId.toString());
    console.error(`  ✓ Removed block from ${sourceChannel}`);
  } catch (error) {
    throw new Error(`Failed to archive block: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
