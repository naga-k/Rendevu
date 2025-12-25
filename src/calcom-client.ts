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
}
