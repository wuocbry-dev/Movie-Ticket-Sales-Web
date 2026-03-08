-- Fix cinema data - assign chain_id based on cinema naming patterns
-- This script associates existing cinemas with the correct cinema chains

-- Option 1: If you know which cinemas belong to which chains
-- Update CGV cinemas
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cgv' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%cgv%'
AND chain_id IS NULL;

-- Update Cinestar cinemas
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cinestar' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%cinestar%'
AND chain_id IS NULL;

-- Update other chains similarly
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'bhd star' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%bhd%'
AND chain_id IS NULL;

-- Option 2: If all cinemas should belong to a default chain (CGV)
-- Uncomment and use this if you want to assign all unassigned cinemas to one chain
-- UPDATE cinemas 
-- SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cgv' LIMIT 1)
-- WHERE chain_id IS NULL;

-- Verify the update
SELECT cinema_id, cinema_name, chain_id FROM cinemas WHERE chain_id IS NOT NULL ORDER BY cinema_name;

-- Check for any cinemas still without chain_id
SELECT cinema_id, cinema_name, chain_id FROM cinemas WHERE chain_id IS NULL;
