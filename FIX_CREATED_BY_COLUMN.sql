-- Make created_by column nullable to handle demo/mock scenarios
ALTER TABLE customers ALTER COLUMN created_by DROP NOT NULL;
