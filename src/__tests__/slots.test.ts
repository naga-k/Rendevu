/**
 * Tests for Slot tool handlers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SlotToolHandlers } from '../tools/slots.js';
import type { CalcomClient } from '../calcom-client.js';

describe('SlotToolHandlers', () => {
  let mockClient: Partial<CalcomClient>;
  let handlers: SlotToolHandlers;

  beforeEach(() => {
    mockClient = {
      getAvailableSlots: vi.fn(),
    };
    handlers = new SlotToolHandlers(mockClient as CalcomClient);
  });

  describe('getAvailableSlots', () => {
    it('should return available slots grouped by date', async () => {
      const slotsResponse = {
        slots: {
          '2025-01-15': [
            { time: '2025-01-15T09:00:00Z' },
            { time: '2025-01-15T10:00:00Z' },
          ],
          '2025-01-16': [
            { time: '2025-01-16T09:00:00Z' },
          ],
        },
      };
      vi.mocked(mockClient.getAvailableSlots!).mockResolvedValue({
        status: 'success',
        data: slotsResponse,
      });

      const result = await handlers.getAvailableSlots({
        startTime: '2025-01-15T00:00:00Z',
        endTime: '2025-01-17T00:00:00Z',
      });

      expect(result.content[0].text).toContain('2025-01-15');
      expect(result.isError).toBeUndefined();
    });

    it('should pass optional filters', async () => {
      vi.mocked(mockClient.getAvailableSlots!).mockResolvedValue({
        status: 'success',
        data: { slots: {} },
      });

      await handlers.getAvailableSlots({
        startTime: '2025-01-15T00:00:00Z',
        endTime: '2025-01-17T00:00:00Z',
        eventTypeId: 1,
        timeZone: 'America/New_York',
      });

      expect(mockClient.getAvailableSlots).toHaveBeenCalledWith({
        startTime: '2025-01-15T00:00:00Z',
        endTime: '2025-01-17T00:00:00Z',
        eventTypeId: 1,
        timeZone: 'America/New_York',
      });
    });

    it('should pass slug and username', async () => {
      vi.mocked(mockClient.getAvailableSlots!).mockResolvedValue({
        status: 'success',
        data: { slots: {} },
      });

      await handlers.getAvailableSlots({
        startTime: '2025-01-15T00:00:00Z',
        endTime: '2025-01-17T00:00:00Z',
        eventTypeSlug: '30min',
        username: 'johndoe',
      });

      expect(mockClient.getAvailableSlots).toHaveBeenCalledWith(
        expect.objectContaining({
          eventTypeSlug: '30min',
          username: 'johndoe',
        })
      );
    });

    it('should validate required fields', async () => {
      await expect(handlers.getAvailableSlots({})).rejects.toThrow();
      await expect(
        handlers.getAvailableSlots({ startTime: '2025-01-15T00:00:00Z' })
      ).rejects.toThrow();
    });

    it('should return error on API failure', async () => {
      vi.mocked(mockClient.getAvailableSlots!).mockResolvedValue({
        status: 'error',
        error: { message: 'Event type not found', code: '404' },
      });

      const result = await handlers.getAvailableSlots({
        startTime: '2025-01-15T00:00:00Z',
        endTime: '2025-01-17T00:00:00Z',
        eventTypeId: 999,
      });

      expect(result.content[0].text).toContain('Error:');
      expect(result.isError).toBe(true);
    });
  });
});
