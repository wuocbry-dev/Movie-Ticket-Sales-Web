-- Add soft delete columns to movies table
-- This allows movies to be marked as deleted without removing from database

USE movie_ticket_sales;

-- Add deleted_at column (timestamp when movie was deleted)
ALTER TABLE movies 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
COMMENT 'Timestamp when movie was soft deleted';

-- Add is_deleted column (boolean flag for deleted status)
ALTER TABLE movies 
ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE
COMMENT 'Flag indicating if movie is soft deleted';

-- Create index for better query performance on is_deleted
CREATE INDEX idx_movies_is_deleted ON movies(is_deleted);

-- Verify the changes
DESCRIBE movies;

-- Show existing movies (should all have is_deleted = false)
SELECT id, title, is_deleted, deleted_at 
FROM movies 
ORDER BY id;
