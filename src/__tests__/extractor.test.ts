/**
 * Tests for extractor.ts
 */

import { initAnthropicClient, extractExhibitionData } from '../extractor';

describe('extractor', () => {
  describe('initAnthropicClient', () => {
    const originalEnv = process.env.ANTHROPIC_API_KEY;

    afterEach(() => {
      process.env.ANTHROPIC_API_KEY = originalEnv;
    });

    it('should throw error if ANTHROPIC_API_KEY is not set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => initAnthropicClient()).toThrow(
        'ANTHROPIC_API_KEY environment variable is not set'
      );
    });

    it('should return Anthropic client when ANTHROPIC_API_KEY is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const client = initAnthropicClient();
      expect(client).toBeDefined();
    });
  });

  describe('extractExhibitionData', () => {
    // Mock global fetch
    global.fetch = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should extract exhibition data from HTML', async () => {
      const mockHtml = `
        <html>
          <body>
            <h1>Gallery Exhibition</h1>
            <p>At Test Gallery</p>
            <p>January 1 - February 1, 2024</p>
          </body>
        </html>
      `;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      const mockClient = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  venue_name: 'Test Gallery',
                  title: 'Gallery Exhibition',
                  start_date: '2024-01-01',
                  end_date: '2024-02-01',
                  website: 'https://example.com',
                }),
              },
            ],
          }),
        },
      } as any;

      const result = await extractExhibitionData(mockClient, 'https://example.com');

      expect(global.fetch).toHaveBeenCalledWith('https://example.com');
      expect(mockClient.messages.create).toHaveBeenCalled();
      expect(result.venue_name).toBe('Test Gallery');
      expect(result.title).toBe('Gallery Exhibition');
      expect(result.start_date).toBe('2024-01-01');
      expect(result.end_date).toBe('2024-02-01');
    });

    it('should throw error if fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      const mockClient = {} as any;

      await expect(
        extractExhibitionData(mockClient, 'https://example.com')
      ).rejects.toThrow('Failed to fetch https://example.com: Not Found');
    });

    it('should handle Claude response without JSON', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('<html></html>'),
      });

      const mockClient = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: 'No JSON here',
              },
            ],
          }),
        },
      } as any;

      await expect(
        extractExhibitionData(mockClient, 'https://example.com')
      ).rejects.toThrow('Could not extract JSON from Claude response');
    });
  });
});
