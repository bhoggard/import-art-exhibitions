/**
 * Functions for interacting with Sanity CMS
 */

import { createClient, SanityClient } from '@sanity/client';

const SANITY_PROJECT_ID = 'ng5yto4p';
const SANITY_DATASET = 'production';

/**
 * Venue document from Sanity
 */
export interface SanityVenue {
  _id: string;
  _type: 'venue';
  name: string;
  address?: string;
  website?: string;
  neighborhood?: {
    _ref: string;
  };
}

/**
 * Initialize Sanity client
 */
export function initSanityClient(): SanityClient {
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    useCdn: true,
    apiVersion: '2024-01-01',
  });
}

/**
 * Search for a venue by name in Sanity
 * @param client - Sanity client instance
 * @param venueName - Name of the venue to search for
 * @returns The venue if found, null otherwise
 */
export async function findVenueByName(
  client: SanityClient,
  venueName: string
): Promise<SanityVenue | null> {
  if (!venueName || venueName.trim() === '') {
    return null;
  }

  // Query Sanity for venues with matching name (case-insensitive)
  const query = `*[_type == "venue" && name match $name][0]`;
  const params = { name: venueName };

  try {
    const venue = await client.fetch<SanityVenue | null>(query, params);
    return venue;
  } catch (error) {
    console.error(`Error searching for venue "${venueName}":`, error);
    return null;
  }
}
