/**
 * Tests for arena.ts
 */

import { initArenaClient, fetchChannelItems } from '../arena';

describe('arena', () => {
  describe('initArenaClient', () => {
    const originalEnv = process.env.ARENA_FILTERIZER_KEY;

    afterEach(() => {
      process.env.ARENA_FILTERIZER_KEY = originalEnv;
    });

    it('should throw error if ARENA_FILTERIZER_KEY is not set', () => {
      delete process.env.ARENA_FILTERIZER_KEY;
      expect(() => initArenaClient()).toThrow(
        'ARENA_FILTERIZER_KEY environment variable is not set'
      );
    });

    it('should return Arena client when ARENA_FILTERIZER_KEY is set', () => {
      process.env.ARENA_FILTERIZER_KEY = 'test-token';
      const client = initArenaClient();
      expect(client).toBeDefined();
    });
  });

  describe('fetchChannelItems', () => {
    it('should fetch items from a channel', async () => {
      const mockArena = {
        channel: jest.fn().mockReturnValue({
          contents: jest.fn().mockResolvedValue([
            { id: 1, source: { url: 'https://example.com/1' } },
            { id: 2, source: { url: 'https://example.com/2' } },
          ]),
        }),
      } as any;

      const items = await fetchChannelItems(mockArena, 'test-channel');

      expect(mockArena.channel).toHaveBeenCalledWith('test-channel');
      expect(items).toHaveLength(2);
      expect(items[0].source.url).toBe('https://example.com/1');
    });

    it('should respect limit parameter', async () => {
      const mockArena = {
        channel: jest.fn().mockReturnValue({
          contents: jest.fn().mockResolvedValue([
            { id: 1, source: { url: 'https://example.com/1' } },
          ]),
        }),
      } as any;

      const items = await fetchChannelItems(mockArena, 'test-channel', 1);

      expect(mockArena.channel().contents).toHaveBeenCalledWith({ page: 1, per: 1 });
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(1);
    });

    it('should filter out items without URLs', async () => {
      const mockArena = {
        channel: jest.fn().mockReturnValue({
          contents: jest.fn().mockResolvedValue([
            { id: 1, source: { url: 'https://example.com/1' } },
            { id: 2, source: {} },
            { id: 3, image: { original: { url: 'https://example.com/3' } } },
            { id: 4 },
          ]),
        }),
      } as any;

      const items = await fetchChannelItems(mockArena, 'test-channel');

      expect(items).toHaveLength(2);
      expect(items[0].id).toBe(1);
      expect(items[1].id).toBe(3);
    });
  });
});
