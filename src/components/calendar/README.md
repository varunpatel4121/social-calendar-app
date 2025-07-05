# Calendar Components

This directory contains the modular calendar components for the social calendar app.

## Structure

```
calendar/
├── Calendar.tsx          # Main calendar component (orchestrates everything)
├── CalendarMonth.tsx     # Renders a single month's grid
├── CalendarDay.tsx       # Renders one day with event indicators
├── EventDot.tsx          # Circle overlay for event days
├── index.ts             # Clean exports
└── README.md            # This file
```

## Components

### Calendar
The main calendar component that:
- Manages navigation (month/year navigation, date picker)
- Handles event selection and modal display
- Renders the header with stats and navigation
- Orchestrates all sub-components

### CalendarMonth
Renders a single month including:
- Month header with title
- Day of week headers
- Grid of CalendarDay components

### CalendarDay
Renders an individual day cell with:
- Date number display
- Today highlighting (blue ring)
- Event indicators (EventDot components)
- Multiple events counter (+N indicator)
- Click handling for event selection

### EventDot
Renders an event indicator with:
- Event image as background
- Overlay with event title
- Hover effects

## Data Flow

1. **Mock Data**: Events are loaded from `src/data/mockEvents.ts`
2. **Date Helpers**: Utility functions in `src/lib/utils/dateHelpers.ts`
3. **Event Selection**: Clicking a day opens a modal with event details
4. **Navigation**: Month/year navigation updates the view dynamically

## Future Integration

The calendar is designed to easily swap mock data for Supabase:
- Event data loading is isolated in `Calendar.tsx`
- Event interfaces are defined in `mockEvents.ts`
- Date utilities are reusable for any data source

## Styling

All components use Tailwind CSS with:
- Instagram-style modern design
- Glass-morphism effects
- Responsive layout
- Smooth transitions and hover effects 