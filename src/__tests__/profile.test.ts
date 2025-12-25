/**
 * Tests for Profile tool handlers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileToolHandlers } from '../tools/profile.js';
import type { CalcomClient } from '../calcom-client.js';

describe('ProfileToolHandlers', () => {
  let mockClient: Partial<CalcomClient>;
  let handlers: ProfileToolHandlers;

  beforeEach(() => {
    mockClient = {
      getMe: vi.fn(),
      updateMe: vi.fn(),
    };
    handlers = new ProfileToolHandlers(mockClient as CalcomClient);
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const profile = {
        id: 1,
        username: 'johndoe',
        name: 'John Doe',
        email: 'john@example.com',
        timeZone: 'America/New_York',
        weekStart: 'Monday',
        timeFormat: 12,
      };
      vi.mocked(mockClient.getMe!).mockResolvedValue({
        status: 'success',
        data: profile,
      });

      const result = await handlers.getProfile({});

      expect(result.content[0].text).toContain('johndoe');
      expect(result.content[0].text).toContain('John Doe');
      expect(result.isError).toBeUndefined();
    });

    it('should return error on API failure', async () => {
      vi.mocked(mockClient.getMe!).mockResolvedValue({
        status: 'error',
        error: { message: 'Unauthorized', code: '401' },
      });

      const result = await handlers.getProfile({});

      expect(result.content[0].text).toContain('Error: Unauthorized');
      expect(result.isError).toBe(true);
    });
  });

  describe('updateProfile', () => {
    it('should update profile name', async () => {
      vi.mocked(mockClient.updateMe!).mockResolvedValue({
        status: 'success',
        data: {
          id: 1,
          username: 'johndoe',
          name: 'John Updated',
          email: 'john@example.com',
        },
      });

      const result = await handlers.updateProfile({ name: 'John Updated' });

      expect(result.content[0].text).toContain('John Updated');
      expect(mockClient.updateMe).toHaveBeenCalledWith({ name: 'John Updated' });
    });

    it('should update timezone', async () => {
      vi.mocked(mockClient.updateMe!).mockResolvedValue({
        status: 'success',
        data: {
          id: 1,
          timeZone: 'Europe/London',
        },
      });

      await handlers.updateProfile({ timeZone: 'Europe/London' });

      expect(mockClient.updateMe).toHaveBeenCalledWith({ timeZone: 'Europe/London' });
    });

    it('should update multiple fields', async () => {
      vi.mocked(mockClient.updateMe!).mockResolvedValue({
        status: 'success',
        data: {
          id: 1,
          name: 'New Name',
          bio: 'New bio text',
          timeZone: 'Asia/Tokyo',
          weekStart: 'Sunday',
          timeFormat: 24,
          defaultScheduleId: 2,
        },
      });

      await handlers.updateProfile({
        name: 'New Name',
        bio: 'New bio text',
        timeZone: 'Asia/Tokyo',
        weekStart: 'Sunday',
        timeFormat: 24,
        defaultScheduleId: 2,
      });

      expect(mockClient.updateMe).toHaveBeenCalledWith({
        name: 'New Name',
        bio: 'New bio text',
        timeZone: 'Asia/Tokyo',
        weekStart: 'Sunday',
        timeFormat: 24,
        defaultScheduleId: 2,
      });
    });

    it('should allow empty update (no changes)', async () => {
      vi.mocked(mockClient.updateMe!).mockResolvedValue({
        status: 'success',
        data: { id: 1, name: 'John' },
      });

      const result = await handlers.updateProfile({});

      expect(result.isError).toBeUndefined();
    });

    it('should return error on update failure', async () => {
      vi.mocked(mockClient.updateMe!).mockResolvedValue({
        status: 'error',
        error: { message: 'Invalid timezone', code: '400' },
      });

      const result = await handlers.updateProfile({ timeZone: 'Invalid/Zone' });

      expect(result.content[0].text).toContain('Error:');
      expect(result.isError).toBe(true);
    });

    it('should validate defaultScheduleId is positive', async () => {
      await expect(handlers.updateProfile({ defaultScheduleId: -1 })).rejects.toThrow();
    });
  });
});
