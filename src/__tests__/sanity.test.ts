/**
 * Tests for sanity.ts
 */

import { initSanityClient, findVenueByName } from '../sanity';

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
});
