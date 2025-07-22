-- Add missing columns to occasions table
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES people(id);
ALTER TABLE occasions ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2);

-- Update existing occasions to have null values for the new columns
UPDATE occasions SET person_id = NULL WHERE person_id IS NULL;
UPDATE occasions SET budget = NULL WHERE budget IS NULL; 