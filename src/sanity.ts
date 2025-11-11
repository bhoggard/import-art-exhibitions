/**
 * Functions for interacting with Sanity CMS
 */

import { createClient, SanityClient } from '@sanity/client';
import { Exhibition } from './types';

const SANITY_PROJECT_ID = 'ng5yto4p';
const SANITY_DATASET = 'production';
const DEFAULT_VENUE_ID = 'drafts.17590e65-dbeb-4226-b106-588036c0c944';

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
 * Event document for Sanity
 */
export interface SanityEvent {
  _id: string;
  _type: 'event';
  name: string;
  venue: {
    _type: 'reference';
    _ref: string;
  };
  startDate: string;
  endDate: string;
  website?: string;
}

/**
 * Initialize Sanity client
 */
export function initSanityClient(): SanityClient {
  const token = process.env.SANITY_API_TOKEN;

  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    useCdn: false, // Don't use CDN for writes
    apiVersion: '2024-01-01',
    token, // Optional: only needed for writes
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

/**
 * Create a draft event in Sanity
 * @param client - Sanity client instance
 * @param exhibition - Exhibition data extracted from webpage
 * @param venue - The venue found in Sanity, or null
 * @returns The created event document
 */
export async function createDraftEvent(
  client: SanityClient,
  exhibition: Exhibition,
  venue: SanityVenue | null
): Promise<SanityEvent> {
  // Use found venue ID or default venue ID
  const venueId = venue ? venue._id : DEFAULT_VENUE_ID;

  // Generate a unique draft ID
  const draftId = `drafts.${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Create the event document
  const eventDoc: SanityEvent = {
    _id: draftId,
    _type: 'event',
    name: exhibition.title || 'Untitled Exhibition',
    venue: {
      _type: 'reference',
      _ref: venueId,
    },
    startDate: exhibition.start_date || new Date().toISOString().split('T')[0],
    endDate: exhibition.end_date || new Date().toISOString().split('T')[0],
    website: exhibition.website || undefined,
  };

  try {
    const result = await client.create(eventDoc);
    return result as SanityEvent;
  } catch (error) {
    console.error(`Error creating draft event:`, error);
    throw error;
  }
}
