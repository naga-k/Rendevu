/**
 * Tests for Booking tool handlers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingToolHandlers } from '../tools/bookings.js';
import type { CalcomClient } from '../calcom-client.js';

describe('BookingToolHandlers', () => {
  let mockClient: Partial<CalcomClient>;
  let handlers: BookingToolHandlers;

  beforeEach(() => {
    mockClient = {
      listBookings: vi.fn(),
      getBooking: vi.fn(),
      cancelBooking: vi.fn(),
      rescheduleBooking: vi.fn(),
    };
    handlers = new BookingToolHandlers(mockClient as CalcomClient);
  });

  describe('listBookings', () => {
    it('should return bookings without filters', async () => {
      const bookings = [
        { uid: 'abc123', title: 'Meeting 1', status: 'ACCEPTED' },
        { uid: 'def456', title: 'Meeting 2', status: 'PENDING' },
      ];
      vi.mocked(mockClient.listBookings!).mockResolvedValue({
        status: 'success',
        data: bookings,
      });

      const result = await handlers.listBookings({});

      expect(result.content[0].text).toContain('Meeting 1');
      expect(result.isError).toBeUndefined();
      expect(mockClient.listBookings).toHaveBeenCalledWith({});
    });

    it('should pass filters to client', async () => {
      vi.mocked(mockClient.listBookings!).mockResolvedValue({
        status: 'success',
        data: [],
      });

      await handlers.listBookings({
        status: 'upcoming',
        eventTypeId: 5,
        attendeeEmail: 'test@example.com',
      });

      expect(mockClient.listBookings).toHaveBeenCalledWith({
        status: 'upcoming',
        eventTypeId: 5,
        attendeeEmail: 'test@example.com',
      });
    });

    it('should return error on API failure', async () => {
      vi.mocked(mockClient.listBookings!).mockResolvedValue({
        status: 'error',
        error: { message: 'Unauthorized', code: '401' },
      });

      const result = await handlers.listBookings({});

      expect(result.content[0].text).toContain('Error: Unauthorized');
      expect(result.isError).toBe(true);
    });
  });

  describe('getBooking', () => {
    it('should return booking details', async () => {
      const booking = {
        uid: 'abc123',
        title: '30 Min Meeting',
        status: 'ACCEPTED',
        startTime: '2025-01-15T10:00:00Z',
        endTime: '2025-01-15T10:30:00Z',
      };
      vi.mocked(mockClient.getBooking!).mockResolvedValue({
        status: 'success',
        data: booking,
      });

      const result = await handlers.getBooking({ bookingUid: 'abc123' });

      expect(result.content[0].text).toContain('30 Min Meeting');
      expect(mockClient.getBooking).toHaveBeenCalledWith('abc123');
    });

    it('should validate bookingUid is required', async () => {
      await expect(handlers.getBooking({})).rejects.toThrow();
    });

    it('should validate bookingUid is not empty', async () => {
      await expect(handlers.getBooking({ bookingUid: '' })).rejects.toThrow();
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking without reason', async () => {
      vi.mocked(mockClient.cancelBooking!).mockResolvedValue({
        status: 'success',
        data: { uid: 'abc123', status: 'CANCELLED' },
      });

      const result = await handlers.cancelBooking({ bookingUid: 'abc123' });

      expect(result.content[0].text).toContain('cancelled successfully');
      expect(mockClient.cancelBooking).toHaveBeenCalledWith('abc123', {
        cancellationReason: undefined,
      });
    });

    it('should cancel booking with reason', async () => {
      vi.mocked(mockClient.cancelBooking!).mockResolvedValue({
        status: 'success',
        data: { uid: 'abc123', status: 'CANCELLED' },
      });

      await handlers.cancelBooking({
        bookingUid: 'abc123',
        cancellationReason: 'Schedule conflict',
      });

      expect(mockClient.cancelBooking).toHaveBeenCalledWith('abc123', {
        cancellationReason: 'Schedule conflict',
      });
    });

    it('should return error on cancellation failure', async () => {
      vi.mocked(mockClient.cancelBooking!).mockResolvedValue({
        status: 'error',
        error: { message: 'Booking not found', code: '404' },
      });

      const result = await handlers.cancelBooking({ bookingUid: 'invalid' });

      expect(result.content[0].text).toContain('Error:');
      expect(result.isError).toBe(true);
    });
  });

  describe('rescheduleBooking', () => {
    it('should reschedule booking to new time', async () => {
      vi.mocked(mockClient.rescheduleBooking!).mockResolvedValue({
        status: 'success',
        data: {
          uid: 'abc123-new',
          startTime: '2025-01-20T14:00:00Z',
          status: 'PENDING',
        },
      });

      const result = await handlers.rescheduleBooking({
        bookingUid: 'abc123',
        start: '2025-01-20T14:00:00Z',
      });

      expect(result.content[0].text).toContain('2025-01-20');
      expect(mockClient.rescheduleBooking).toHaveBeenCalledWith('abc123', {
        start: '2025-01-20T14:00:00Z',
        reschedulingReason: undefined,
      });
    });

    it('should include rescheduling reason', async () => {
      vi.mocked(mockClient.rescheduleBooking!).mockResolvedValue({
        status: 'success',
        data: { uid: 'abc123-new', status: 'PENDING' },
      });

      await handlers.rescheduleBooking({
        bookingUid: 'abc123',
        start: '2025-01-20T14:00:00Z',
        reschedulingReason: 'Attendee requested change',
      });

      expect(mockClient.rescheduleBooking).toHaveBeenCalledWith('abc123', {
        start: '2025-01-20T14:00:00Z',
        reschedulingReason: 'Attendee requested change',
      });
    });

    it('should validate required fields', async () => {
      await expect(handlers.rescheduleBooking({ bookingUid: 'abc' })).rejects.toThrow();
      await expect(handlers.rescheduleBooking({ start: '2025-01-20T14:00:00Z' })).rejects.toThrow();
    });
  });
});
