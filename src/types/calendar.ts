export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  imageUrl: string;
  description?: string;
  color?: string;
}

export interface Calendar {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  is_default: boolean;
  is_public: boolean;
  public_id: string;
  slug?: string;
  created_at: string;
  updated_at: string;
  events?: CalendarEvent[]; // Optional events for public calendar views
}

export interface PublicCalendarData {
  id: string;
  title: string;
  description?: string;
  is_public: boolean;
  public_id: string;
  slug?: string;
  created_at: string;
  owner_name: string;
  events: PublicEvent[];
}

export interface PublicEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  image_url?: string;
  color?: string;
  created_at: string;
}
