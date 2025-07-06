-- Create events table for the social calendar app
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    event_date DATE NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calendar_id TEXT DEFAULT 'default-calendar-id',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendars table for the social calendar app
CREATE TABLE IF NOT EXISTS public.calendars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    public_id TEXT UNIQUE,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see their own events
CREATE POLICY "Users can view their own events" ON public.events
    FOR SELECT USING (auth.uid() = owner_id);

-- Create policy to allow users to insert their own events
CREATE POLICY "Users can create their own events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Create policy to allow users to update their own events
CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (auth.uid() = owner_id);

-- Create policy to allow users to delete their own events
CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (auth.uid() = owner_id);

-- Create policy to allow users to see their own calendars
CREATE POLICY "Users can view their own calendars" ON public.calendars
    FOR SELECT USING (auth.uid() = owner_id);

-- Create policy to allow users to insert their own calendars
CREATE POLICY "Users can create their own calendars" ON public.calendars
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Create policy to allow users to update their own calendars
CREATE POLICY "Users can update their own calendars" ON public.calendars
    FOR UPDATE USING (auth.uid() = owner_id);

-- Create policy to allow users to delete their own calendars
CREATE POLICY "Users can delete their own calendars" ON public.calendars
    FOR DELETE USING (auth.uid() = owner_id);

-- Create policy to allow public access to public calendars
CREATE POLICY "Public access to public calendars" ON public.calendars
    FOR SELECT USING (is_public = true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_events_owner_id ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendars_owner_id ON public.calendars(owner_id);
CREATE INDEX IF NOT EXISTS idx_calendars_public_id ON public.calendars(public_id);
CREATE INDEX IF NOT EXISTS idx_calendars_slug ON public.calendars(slug);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendars_updated_at 
    BEFORE UPDATE ON public.calendars 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add slug column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calendars' AND column_name = 'slug') THEN
        ALTER TABLE public.calendars ADD COLUMN slug TEXT UNIQUE;
    END IF;
END $$; 