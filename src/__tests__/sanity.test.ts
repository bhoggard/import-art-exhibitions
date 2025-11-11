/**
 * Tests for sanity.ts
 */

import { initSanityClient, findVenueByName, createDraftEvent } from '../sanity';
import { Exhibition } from '../types';

describe('sanity', () => {
  describe('initSanityClient', () => {
    it('should return Sanity client', () => {
      const client = initSanityClient();
      expect(client).toBeDefined();
      expect(client.config().projectId).toBe('ng5yto4p');
    });
  });

  describe('findVenueByName', () => {
    it('should return null for empty venue name', async () => {
      const mockClient = {
        fetch: jest.fn(),
      } as any;

      const result = await findVenueByName(mockClient, '');

      expect(result).toBeNull();
      expect(mockClient.fetch).not.toHaveBeenCalled();
    });

    it('should search for venue by name', async () => {
      const mockVenue = {
        _id: 'venue-123',
        _type: 'venue',
        name: 'Test Gallery',
        address: '123 Main St',
        website: 'https://testgallery.com',
      };

      const mockClient = {
        fetch: jest.fn().mockResolvedValue(mockVenue),
      } as any;

      const result = await findVenueByName(mockClient, 'Test Gallery');

      expect(mockClient.fetch).toHaveBeenCalledWith(
        expect.stringContaining('*[_type == "venue" && name match $name][0]'),
        { name: 'Test Gallery' }
      );
      expect(result).toEqual(mockVenue);
    });

    it('should return null when venue not found', async () => {
      const mockClient = {
        fetch: jest.fn().mockResolvedValue(null),
      } as any;

      const result = await findVenueByName(mockClient, 'Nonexistent Gallery');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockClient = {
        fetch: jest.fn().mockRejectedValue(new Error('API Error')),
      } as any;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await findVenueByName(mockClient, 'Test Gallery');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createDraftEvent', () => {
    const mockExhibition: Exhibition = {
      venue_name: 'Test Gallery',
      title: 'Test Exhibition',
      start_date: '2024-01-01',
      end_date: '2024-02-01',
      website: 'https://example.com',
    };

    it('should create draft event with found venue', async () => {
      const mockVenue = {
        _id: 'venue-123',
        _type: 'venue' as const,
        name: 'Test Gallery',
      };

      const mockEvent = {
        _id: 'drafts.123-abc',
        _type: 'event',
        name: 'Test Exhibition',
        venue: { _type: 'reference', _ref: 'venue-123' },
        startDate: '2024-01-01',
        endDate: '2024-02-01',
        website: 'https://example.com',
      };

      const mockClient = {
        create: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      const result = await createDraftEvent(mockClient, mockExhibition, mockVenue);

      expect(mockClient.create).toHaveBeenCalled();
      expect(result._id).toMatch(/^drafts\./);
      expect(result.name).toBe('Test Exhibition');
      expect(result.venue._ref).toBe('venue-123');
    });

    it('should create draft event with default venue when venue not found', async () => {
      const mockEvent = {
        _id: 'drafts.123-abc',
        _type: 'event',
        name: 'Test Exhibition',
        venue: { _type: 'reference', _ref: 'drafts.17590e65-dbeb-4226-b106-588036c0c944' },
        startDate: '2024-01-01',
        endDate: '2024-02-01',
        website: 'https://example.com',
      };

      const mockClient = {
        create: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      const result = await createDraftEvent(mockClient, mockExhibition, null);

      expect(mockClient.create).toHaveBeenCalled();
      const createCall = mockClient.create.mock.calls[0][0];
      expect(createCall.venue._ref).toBe('drafts.17590e65-dbeb-4226-b106-588036c0c944');
    });

    it('should handle missing exhibition fields with defaults', async () => {
      const incompleteExhibition: Exhibition = {
        venue_name: '',
        title: '',
        start_date: '',
        end_date: '',
        website: '',
      };

      const mockEvent = {
        _id: 'drafts.123-abc',
        _type: 'event',
        name: 'Untitled Exhibition',
        venue: { _type: 'reference', _ref: 'drafts.17590e65-dbeb-4226-b106-588036c0c944' },
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      };

      const mockClient = {
        create: jest.fn().mockResolvedValue(mockEvent),
      } as any;

      const result = await createDraftEvent(mockClient, incompleteExhibition, null);

      expect(mockClient.create).toHaveBeenCalled();
      const createCall = mockClient.create.mock.calls[0][0];
      expect(createCall.name).toBe('Untitled Exhibition');
    });

    it('should throw error when create fails', async () => {
      const mockClient = {
        create: jest.fn().mockRejectedValue(new Error('API Error')),
      } as any;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        createDraftEvent(mockClient, mockExhibition, null)
      ).rejects.toThrow('API Error');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
