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

// Event Type Types
export interface EventTypeLocation {
  type: string;
  link?: string;
  address?: string;
  phone?: string;
}

export interface EventType {
  id: number;
  slug: string;
  title: string;
  description?: string;
  lengthInMinutes: number;
  lengthInMinutesOptions?: number[];
  locations?: EventTypeLocation[];
  scheduleId?: number;
  ownerId: number;
  hidden: boolean;
  requiresConfirmation: boolean;
  disableGuests: boolean;
  minimumBookingNotice: number;
  beforeEventBuffer: number;
  afterEventBuffer: number;
  slotInterval?: number;
  schedulingType?: 'ROUND_ROBIN' | 'COLLECTIVE' | 'MANAGED';
  price?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateEventTypeRequest {
  title: string;
  slug: string;
  lengthInMinutes: number;
  description?: string;
  locations?: EventTypeLocation[];
  scheduleId?: number;
  hidden?: boolean;
  requiresConfirmation?: boolean;
  disableGuests?: boolean;
  minimumBookingNotice?: number;
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
  slotInterval?: number;
}

export interface UpdateEventTypeRequest {
  title?: string;
  slug?: string;
  lengthInMinutes?: number;
  description?: string;
  locations?: EventTypeLocation[];
  scheduleId?: number;
  hidden?: boolean;
  requiresConfirmation?: boolean;
  disableGuests?: boolean;
  minimumBookingNotice?: number;
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
  slotInterval?: number;
}

// Booking Types
export type BookingStatus =
  | 'upcoming'
  | 'recurring'
  | 'past'
  | 'cancelled'
  | 'unconfirmed';

export interface BookingAttendee {
  name: string;
  email: string;
  timeZone: string;
  language?: string;
}

export interface Booking {
  id: number;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  attendees: BookingAttendee[];
  eventTypeId: number;
  eventType?: {
    id: number;
    slug: string;
    title: string;
  };
  location?: string;
  meetingUrl?: string;
  cancellationReason?: string;
  rescheduledFromUid?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateBookingRequest {
  eventTypeId: number;
  start: string; // ISO 8601 format
  attendee: {
    name: string;
    email: string;
    timeZone: string;
    language?: string;
  };
  guests?: string[];
  meetingUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface RescheduleBookingRequest {
  start: string; // ISO 8601 format
  reschedulingReason?: string;
}

export interface CancelBookingRequest {
  cancellationReason?: string;
}

// Slots / Availability Types
export interface Slot {
  time: string; // ISO 8601 format
}

export interface AvailableSlotsRequest {
  eventTypeId?: number;
  eventTypeSlug?: string;
  username?: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  timeZone?: string;
}

// User Profile Types
export interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  timeZone: string;
  weekStart: string;
  timeFormat?: number;
  defaultScheduleId?: number;
}

export interface UpdateUserProfileRequest {
  name?: string;
  bio?: string;
  avatar?: string;
  timeZone?: string;
  weekStart?: string;
  timeFormat?: number;
  defaultScheduleId?: number;
}
