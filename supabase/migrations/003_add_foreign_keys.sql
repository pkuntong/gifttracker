-- Add foreign key columns to gifts table
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES people(id);
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS occasion_id UUID REFERENCES occasions(id);

-- Update existing gifts to have null values for the new columns
UPDATE gifts SET recipient_id = NULL WHERE recipient_id IS NULL;
UPDATE gifts SET occasion_id = NULL WHERE occasion_id IS NULL; 