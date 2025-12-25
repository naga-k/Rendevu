/**
 * Cal.com API Client
 * Handles all HTTP requests to the Cal.com API v2
 */

import type {
  CalcomAPIResponse,
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  OAuthClient,
  CreateOAuthClientRequest,
  CreateOAuthClientResponse,
  UpdateOAuthClientRequest,
  EventType,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  Booking,
  CreateBookingRequest,
  RescheduleBookingRequest,
  CancelBookingRequest,
  Slot,
  UserProfile,
  UpdateUserProfileRequest,
} from './types/calcom.js';

export class CalcomClient {
  private apiKey: string;
  private baseUrl: string;
  private apiVersion: string;

  constructor(apiKey: string, baseUrl: string, apiVersion: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.apiVersion = apiVersion;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<CalcomAPIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'cal-api-version': this.apiVersion,
      'Content-Type': 'application/json',
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        return {
          status: 'error',
          error: {
            message: 'Invalid JSON response from API',
            code: 'PARSE_ERROR',
          },
        };
      }

      if (!response.ok) {
        const errorData = typeof data === 'object' && data !== null ? data as Record<string, unknown> : {};
        return {
          status: 'error',
          error: {
            message: (errorData.message as string) || `HTTP ${response.status}: ${response.statusText}`,
            code: (errorData.code as string) || String(response.status),
          },
        };
      }

      // Validate response structure
      if (typeof data !== 'object' || data === null || !('status' in data)) {
        return {
          status: 'error',
          error: {
            message: 'Invalid response structure from API',
            code: 'INVALID_RESPONSE',
          },
        };
      }

      return data as CalcomAPIResponse<T>;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          status: 'error',
          error: {
            message: 'Request timeout',
            code: 'TIMEOUT',
          },
        };
      }
      return {
        status: 'error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  /**
   * Get all schedules for the authenticated user
   */
  async listSchedules(): Promise<CalcomAPIResponse<Schedule[]>> {
    return this.request<Schedule[]>('GET', '/schedules');
  }

  /**
   * Get a specific schedule by ID
   */
  async getSchedule(scheduleId: number): Promise<CalcomAPIResponse<Schedule>> {
    return this.request<Schedule>('GET', `/schedules/${scheduleId}`);
  }

  /**
   * Create a new schedule
   */
  async createSchedule(
    data: CreateScheduleRequest
  ): Promise<CalcomAPIResponse<Schedule>> {
    return this.request<Schedule>('POST', '/schedules', data);
  }

  /**
   * Update an existing schedule
   */
  async updateSchedule(
    scheduleId: number,
    data: UpdateScheduleRequest
  ): Promise<CalcomAPIResponse<Schedule>> {
    return this.request<Schedule>('PATCH', `/schedules/${scheduleId}`, data);
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId: number): Promise<CalcomAPIResponse<{ message: string }>> {
    return this.request<{ message: string }>('DELETE', `/schedules/${scheduleId}`);
  }

  // OAuth Client Methods

  /**
   * Get all OAuth clients
   */
  async listOAuthClients(): Promise<CalcomAPIResponse<OAuthClient[]>> {
    return this.request<OAuthClient[]>('GET', '/oauth-clients');
  }

  /**
   * Get a specific OAuth client by ID
   */
  async getOAuthClient(clientId: string): Promise<CalcomAPIResponse<OAuthClient>> {
    return this.request<OAuthClient>('GET', `/oauth-clients/${clientId}`);
  }

  /**
   * Create a new OAuth client
   */
  async createOAuthClient(
    data: CreateOAuthClientRequest
  ): Promise<CalcomAPIResponse<CreateOAuthClientResponse>> {
    return this.request<CreateOAuthClientResponse>('POST', '/oauth-clients', data);
  }

  /**
   * Update an existing OAuth client
   */
  async updateOAuthClient(
    clientId: string,
    data: UpdateOAuthClientRequest
  ): Promise<CalcomAPIResponse<OAuthClient>> {
    return this.request<OAuthClient>('PATCH', `/oauth-clients/${clientId}`, data);
  }

  /**
   * Delete an OAuth client
   */
  async deleteOAuthClient(clientId: string): Promise<CalcomAPIResponse<{ message: string }>> {
    return this.request<{ message: string }>('DELETE', `/oauth-clients/${clientId}`);
  }

  // Event Type Methods

  /**
   * Get all event types for the authenticated user
   */
  async listEventTypes(): Promise<CalcomAPIResponse<EventType[]>> {
    return this.request<EventType[]>('GET', '/event-types');
  }

  /**
   * Get a specific event type by ID
   */
  async getEventType(eventTypeId: number): Promise<CalcomAPIResponse<EventType>> {
    return this.request<EventType>('GET', `/event-types/${eventTypeId}`);
  }

  /**
   * Create a new event type
   */
  async createEventType(data: CreateEventTypeRequest): Promise<CalcomAPIResponse<EventType>> {
    return this.request<EventType>('POST', '/event-types', data);
  }

  /**
   * Update an existing event type
   */
  async updateEventType(
    eventTypeId: number,
    data: UpdateEventTypeRequest
  ): Promise<CalcomAPIResponse<EventType>> {
    return this.request<EventType>('PATCH', `/event-types/${eventTypeId}`, data);
  }

  /**
   * Delete an event type
   */
  async deleteEventType(eventTypeId: number): Promise<CalcomAPIResponse<{ message: string }>> {
    return this.request<{ message: string }>('DELETE', `/event-types/${eventTypeId}`);
  }

  // Booking Methods

  /**
   * Get all bookings with optional filters
   */
  async listBookings(filters?: {
    status?: string;
    eventTypeId?: number;
    attendeeEmail?: string;
  }): Promise<CalcomAPIResponse<Booking[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.eventTypeId) params.append('eventTypeId', String(filters.eventTypeId));
    if (filters?.attendeeEmail) params.append('attendeeEmail', filters.attendeeEmail);
    const query = params.toString();
    return this.request<Booking[]>('GET', `/bookings${query ? `?${query}` : ''}`);
  }

  /**
   * Get a specific booking by UID
   */
  async getBooking(bookingUid: string): Promise<CalcomAPIResponse<Booking>> {
    return this.request<Booking>('GET', `/bookings/${bookingUid}`);
  }

  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingRequest): Promise<CalcomAPIResponse<Booking>> {
    return this.request<Booking>('POST', '/bookings', data);
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    bookingUid: string,
    data: RescheduleBookingRequest
  ): Promise<CalcomAPIResponse<Booking>> {
    return this.request<Booking>('POST', `/bookings/${bookingUid}/reschedule`, data);
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingUid: string,
    data?: CancelBookingRequest
  ): Promise<CalcomAPIResponse<Booking>> {
    return this.request<Booking>('POST', `/bookings/${bookingUid}/cancel`, data);
  }

  // Slots / Availability Methods

  /**
   * Get available slots for an event type
   */
  async getAvailableSlots(params: {
    eventTypeId?: number;
    eventTypeSlug?: string;
    username?: string;
    start: string;
    end: string;
    timeZone?: string;
  }): Promise<CalcomAPIResponse<{ slots: Record<string, Slot[]> }>> {
    const searchParams = new URLSearchParams();
    if (params.eventTypeId) searchParams.append('eventTypeId', String(params.eventTypeId));
    if (params.eventTypeSlug) searchParams.append('eventTypeSlug', params.eventTypeSlug);
    if (params.username) searchParams.append('username', params.username);
    searchParams.append('start', params.start);
    searchParams.append('end', params.end);
    if (params.timeZone) searchParams.append('timeZone', params.timeZone);
    return this.request<{ slots: Record<string, Slot[]> }>('GET', `/slots?${searchParams.toString()}`);
  }

  // User Profile Methods

  /**
   * Get the authenticated user's profile
   */
  async getMe(): Promise<CalcomAPIResponse<UserProfile>> {
    return this.request<UserProfile>('GET', '/me');
  }

  /**
   * Update the authenticated user's profile
   */
  async updateMe(data: UpdateUserProfileRequest): Promise<CalcomAPIResponse<UserProfile>> {
    return this.request<UserProfile>('PATCH', '/me', data);
  }
}
