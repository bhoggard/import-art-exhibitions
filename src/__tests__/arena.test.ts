/**
 * Tests for arena.ts
 */

import { initArenaClient, fetchChannelItems, archiveBlock } from '../arena';

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

  describe('archiveBlock', () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    beforeAll(() => {
      console.error = jest.fn();
    });
    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('should successfully archive a block by adding to archive channel and removing from source', async () => {
      const mockCreateBlock = jest.fn().mockResolvedValue({ id: 123 });
      const mockDeleteBlock = jest.fn().mockResolvedValue(undefined);

      const mockArena = {
        channel: jest.fn((channelSlug: string) => {
          if (channelSlug === 'archive-channel') {
            return {
              createBlock: mockCreateBlock,
            };
          } else if (channelSlug === 'source-channel') {
            return {
              deleteBlock: mockDeleteBlock,
            };
          }
          return {};
        }),
      } as any;

      await archiveBlock(
        mockArena,
        456,
        'https://example.com/artwork',
        'source-channel',
        'archive-channel'
      );

      expect(mockArena.channel).toHaveBeenCalledWith('archive-channel');
      expect(mockCreateBlock).toHaveBeenCalledWith('https://example.com/artwork');
      expect(mockArena.channel).toHaveBeenCalledWith('source-channel');
      expect(mockDeleteBlock).toHaveBeenCalledWith('456');
      expect(console.error).toHaveBeenCalledWith('  ✓ Added block to archive-channel');
      expect(console.error).toHaveBeenCalledWith('  ✓ Removed block from source-channel');
    });

    it('should throw error if adding to archive channel fails', async () => {
      const mockCreateBlock = jest.fn().mockRejectedValue(new Error('Failed to create block'));

      const mockArena = {
        channel: jest.fn().mockReturnValue({
          createBlock: mockCreateBlock,
        }),
      } as any;

      await expect(
        archiveBlock(
          mockArena,
          456,
          'https://example.com/artwork',
          'source-channel',
          'archive-channel'
        )
      ).rejects.toThrow('Failed to archive block: Failed to create block');
    });

    it('should throw error if removing from source channel fails', async () => {
      const mockCreateBlock = jest.fn().mockResolvedValue({ id: 123 });
      const mockDeleteBlock = jest.fn().mockRejectedValue(new Error('Failed to delete block'));

      const mockArena = {
        channel: jest.fn((channelSlug: string) => {
          if (channelSlug === 'archive-channel') {
            return {
              createBlock: mockCreateBlock,
            };
          } else if (channelSlug === 'source-channel') {
            return {
              deleteBlock: mockDeleteBlock,
            };
          }
          return {};
        }),
      } as any;

      await expect(
        archiveBlock(
          mockArena,
          456,
          'https://example.com/artwork',
          'source-channel',
          'archive-channel'
        )
      ).rejects.toThrow('Failed to archive block: Failed to delete block');
    });

    it('should convert blockId to string when calling deleteBlock', async () => {
      const mockCreateBlock = jest.fn().mockResolvedValue({ id: 123 });
      const mockDeleteBlock = jest.fn().mockResolvedValue(undefined);

      const mockArena = {
        channel: jest.fn((channelSlug: string) => {
          if (channelSlug === 'archive-channel') {
            return {
              createBlock: mockCreateBlock,
            };
          } else if (channelSlug === 'source-channel') {
            return {
              deleteBlock: mockDeleteBlock,
            };
          }
          return {};
        }),
      } as any;

      await archiveBlock(
        mockArena,
        789,
        'https://example.com/artwork',
        'source-channel',
        'archive-channel'
      );

      expect(mockDeleteBlock).toHaveBeenCalledWith('789');
    });
  });
});
