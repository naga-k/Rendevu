/**
 * Cal.com API Types
 * Based on Cal.com API v2 documentation
 */

export interface CalcomAPIResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    message?: string;
    code?: string;
  };
}

export interface AvailabilityBlock {
  days: string[];
  startTime: string; // HH:MM format (24-hour)
  endTime: string;   // HH:MM format (24-hour)
}

export interface ScheduleOverride {
  date: string;      // YYYY-MM-DD format
  startTime: string; // HH:MM format (24-hour)
  endTime: string;   // HH:MM format (24-hour)
}

export interface Schedule {
  id: number;
  ownerId: number;
  name: string;
  timeZone: string;
  availability: AvailabilityBlock[];
  isDefault: boolean;
  overrides?: ScheduleOverride[];
}

export interface CreateScheduleRequest {
  name: string;
  timeZone: string;
  isDefault: boolean;
  availability?: AvailabilityBlock[];
  overrides?: ScheduleOverride[];
}

export interface UpdateScheduleRequest {
  name?: string;
  timeZone?: string;
  isDefault?: boolean;
  availability?: AvailabilityBlock[];
  overrides?: ScheduleOverride[];
}

// OAuth Client Types
export type OAuthPermission =
  | 'EVENT_TYPE_READ'
  | 'EVENT_TYPE_WRITE'
  | 'BOOKING_READ'
  | 'BOOKING_WRITE'
  | 'SCHEDULE_READ'
  | 'SCHEDULE_WRITE'
  | 'APPS_READ'
  | 'APPS_WRITE'
  | 'PROFILE_READ'
  | 'PROFILE_WRITE'
  | '*';

export interface OAuthClient {
  id: string;
  name: string;
  secret: string;
  permissions: OAuthPermission[];
  redirectUris: string[];
  organizationId: number;
  createdAt: string;
  areEmailsEnabled: boolean;
  areDefaultEventTypesEnabled: boolean;
  areCalendarEventsEnabled: boolean;
  logo?: string;
  bookingRedirectUri?: string;
  bookingCancelRedirectUri?: string;
  bookingRescheduleRedirectUri?: string;
}

export interface CreateOAuthClientRequest {
  name: string;
  redirectUris: string[];
  permissions: OAuthPermission[];
  logo?: string;
  bookingRedirectUri?: string;
  bookingCancelRedirectUri?: string;
  bookingRescheduleRedirectUri?: string;
  areEmailsEnabled?: boolean;
  areDefaultEventTypesEnabled?: boolean;
  areCalendarEventsEnabled?: boolean;
}

export interface UpdateOAuthClientRequest {
  name?: string;
  logo?: string;
  redirectUris?: string[];
  bookingRedirectUri?: string;
  bookingCancelRedirectUri?: string;
  bookingRescheduleRedirectUri?: string;
  areEmailsEnabled?: boolean;
  areDefaultEventTypesEnabled?: boolean;
  areCalendarEventsEnabled?: boolean;
}

export interface CreateOAuthClientResponse {
  clientId: string;
  clientSecret: string;
}
