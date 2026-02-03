-- Create site_settings table for managing advertised content
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- Disable RLS for now - this is public advertised content
-- We'll handle admin-only updates in the app layer
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Insert default advertised times
INSERT INTO site_settings (key, value, label, description, category) VALUES
    ('cohort_date_short', 'Jan 23-25', 'Cohort Date (Short)', 'Short date format shown in badges and pills (e.g., "Jan 23-25")', 'advertised_times'),
    ('cohort_date_full', 'January 23-25, 2025', 'Cohort Date (Full)', 'Full date format for detailed sections', 'advertised_times'),
    ('enrollment_status', 'Now enrolling for January 2025', 'Enrollment Status', 'Text shown in the hero badge (e.g., "Now enrolling for January 2025")', 'advertised_times'),
    ('first_class_pill', 'First class: Jan 23-25', 'First Class Pill', 'Text shown in the hero pill (e.g., "First class: Jan 23-25")', 'advertised_times'),
    ('reserve_spot_text', 'Reserve your spot for Jan 23-25', 'Reserve Spot Text', 'Call-to-action text for reservations', 'advertised_times'),
    ('cta_heading', 'Reserve Jan 23-25 and train with us', 'CTA Heading', 'Main call-to-action heading at bottom of page', 'advertised_times')
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();
