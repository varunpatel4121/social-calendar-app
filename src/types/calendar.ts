export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  imageUrl: string;
  description?: string;
  color?: string;
}
