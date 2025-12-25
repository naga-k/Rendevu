/**
 * Tests for Event Type tool handlers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventTypeToolHandlers } from '../tools/event-types.js';
import type { CalcomClient } from '../calcom-client.js';

describe('EventTypeToolHandlers', () => {
  let mockClient: Partial<CalcomClient>;
  let handlers: EventTypeToolHandlers;

  beforeEach(() => {
    mockClient = {
      listEventTypes: vi.fn(),
      getEventType: vi.fn(),
      createEventType: vi.fn(),
      updateEventType: vi.fn(),
      deleteEventType: vi.fn(),
    };
    handlers = new EventTypeToolHandlers(mockClient as CalcomClient);
  });

  describe('listEventTypes', () => {
    it('should return event types on success', async () => {
      const eventTypes = [
        { id: 1, title: '30 Min Meeting', slug: '30min', lengthInMinutes: 30 },
        { id: 2, title: '1 Hour Meeting', slug: '1hr', lengthInMinutes: 60 },
      ];
      vi.mocked(mockClient.listEventTypes!).mockResolvedValue({
        status: 'success',
        data: eventTypes,
      });

      const result = await handlers.listEventTypes({});

      expect(result.content[0].text).toContain('30 Min Meeting');
      expect(result.isError).toBeUndefined();
    });

    it('should return error on API failure', async () => {
      vi.mocked(mockClient.listEventTypes!).mockResolvedValue({
        status: 'error',
        error: { message: 'API error', code: '500' },
      });

      const result = await handlers.listEventTypes({});

      expect(result.content[0].text).toContain('Error: API error');
      expect(result.isError).toBe(true);
    });
  });

  describe('getEventType', () => {
    it('should return event type details on success', async () => {
      const eventType = {
        id: 1,
        title: '30 Min Meeting',
        slug: '30min',
        lengthInMinutes: 30,
        description: 'A quick meeting',
      };
      vi.mocked(mockClient.getEventType!).mockResolvedValue({
        status: 'success',
        data: eventType,
      });

      const result = await handlers.getEventType({ eventTypeId: 1 });

      expect(result.content[0].text).toContain('30 Min Meeting');
      expect(result.isError).toBeUndefined();
    });

    it('should validate eventTypeId is required', async () => {
      await expect(handlers.getEventType({})).rejects.toThrow();
    });

    it('should validate eventTypeId is a positive number', async () => {
      await expect(handlers.getEventType({ eventTypeId: -1 })).rejects.toThrow();
    });
  });

  describe('createEventType', () => {
    it('should create event type with required fields', async () => {
      const createdEventType = {
        id: 3,
        title: 'New Meeting',
        slug: 'new-meeting',
        lengthInMinutes: 45,
      };
      vi.mocked(mockClient.createEventType!).mockResolvedValue({
        status: 'success',
        data: createdEventType,
      });

      const result = await handlers.createEventType({
        title: 'New Meeting',
        slug: 'new-meeting',
        lengthInMinutes: 45,
      });

      expect(result.content[0].text).toContain('New Meeting');
      expect(result.isError).toBeUndefined();
      expect(mockClient.createEventType).toHaveBeenCalledWith({
        title: 'New Meeting',
        slug: 'new-meeting',
        lengthInMinutes: 45,
      });
    });

    it('should validate required fields', async () => {
      await expect(handlers.createEventType({ title: 'Test' })).rejects.toThrow();
    });

    it('should accept optional fields', async () => {
      vi.mocked(mockClient.createEventType!).mockResolvedValue({
        status: 'success',
        data: { id: 4, title: 'Full Meeting', slug: 'full', lengthInMinutes: 60 },
      });

      await handlers.createEventType({
        title: 'Full Meeting',
        slug: 'full',
        lengthInMinutes: 60,
        description: 'A complete meeting',
        hidden: true,
        requiresConfirmation: true,
        beforeEventBuffer: 10,
        afterEventBuffer: 5,
      });

      expect(mockClient.createEventType).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'A complete meeting',
          hidden: true,
          requiresConfirmation: true,
        })
      );
    });
  });

  describe('updateEventType', () => {
    it('should update event type', async () => {
      vi.mocked(mockClient.updateEventType!).mockResolvedValue({
        status: 'success',
        data: { id: 1, title: 'Updated Meeting', slug: '30min', lengthInMinutes: 30 },
      });

      const result = await handlers.updateEventType({
        eventTypeId: 1,
        title: 'Updated Meeting',
      });

      expect(result.content[0].text).toContain('Updated Meeting');
      expect(mockClient.updateEventType).toHaveBeenCalledWith(1, { title: 'Updated Meeting' });
    });

    it('should validate eventTypeId is required', async () => {
      await expect(handlers.updateEventType({ title: 'Test' })).rejects.toThrow();
    });
  });

  describe('deleteEventType', () => {
    it('should delete event type', async () => {
      vi.mocked(mockClient.deleteEventType!).mockResolvedValue({
        status: 'success',
        data: { message: 'Deleted' },
      });

      const result = await handlers.deleteEventType({ eventTypeId: 1 });

      expect(result.content[0].text).toContain('deleted successfully');
      expect(mockClient.deleteEventType).toHaveBeenCalledWith(1);
    });

    it('should return error on deletion failure', async () => {
      vi.mocked(mockClient.deleteEventType!).mockResolvedValue({
        status: 'error',
        error: { message: 'Event type not found', code: '404' },
      });

      const result = await handlers.deleteEventType({ eventTypeId: 999 });

      expect(result.content[0].text).toContain('Error:');
      expect(result.isError).toBe(true);
    });
  });
});
