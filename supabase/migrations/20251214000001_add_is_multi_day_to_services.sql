-- Add is_multi_day column to services table
-- This allows services to be flagged as multi-day activities for proper calendar display

ALTER TABLE services
ADD COLUMN is_multi_day BOOLEAN DEFAULT false;

COMMENT ON COLUMN services.is_multi_day IS 'Indicates if this service spans multiple days (e.g., retreats, workshops)';
