# Fix Cinema Chain Filtering Issue

## Problem

When clicking "Quản Lý Rạp" on a cinema chain, all cinemas appear instead of just cinemas for that chain. This happens because:

1. **Root Cause**: Existing cinemas in database have `chain_id = NULL`
2. **Result**: Query `WHERE chain_id = {chainId}` returns no results
3. **Why**: Cinemas were created before `chain_id` column existed or weren't properly assigned

## Solution

### Step 1: Check Current Data

Run these queries to check the current state:

```sql
-- Check if cinemas have chain_id assigned
SELECT chain_id, COUNT(*) as count FROM cinemas GROUP BY chain_id;

-- Check cinema chains
SELECT chain_id, chain_name FROM cinema_chains;

-- View all cinemas with their chain assignments
SELECT cinema_id, cinema_name, chain_id FROM cinemas;
```

### Step 2: Assign Cinema Chain IDs

**Option A: Auto-assign based on cinema name patterns**

```sql
-- For CGV cinemas
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cgv' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%cgv%' AND chain_id IS NULL;

-- For Cinestar cinemas
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cinestar' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%cinestar%' AND chain_id IS NULL;

-- For BHD Star cinemas
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'bhd' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%bhd%' AND chain_id IS NULL;
```

**Option B: Manually assign cinemas to chains**

```sql
-- Assign specific cinema to chain
UPDATE cinemas 
SET chain_id = 1 
WHERE cinema_id = {cinemaId};
```

**Option C: Assign all unassigned cinemas to default chain**

```sql
-- Assign all to CGV (if CGV is your default chain)
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cgv' LIMIT 1)
WHERE chain_id IS NULL;
```

### Step 3: Verify Data

```sql
-- Check all cinemas now have chain_id
SELECT cinema_id, cinema_name, chain_id FROM cinemas 
WHERE chain_id IS NOT NULL 
ORDER BY chain_id, cinema_name;

-- Verify no cinemas with NULL chain_id
SELECT COUNT(*) as unassigned_cinemas FROM cinemas WHERE chain_id IS NULL;
```

### Step 4: Test in Application

1. **Restart backend application**
2. **Login as SYSTEM_ADMIN**
3. **Go to Cinema Chain Management**
4. **Click "Quản Lý Rạp"** on each chain
5. **Verify** cinemas show correctly for each chain

### Step 5: Debug if Still Not Working

If cinemas still don't filter correctly, use the debug endpoint:

```bash
# Get all cinemas (for debugging)
GET /api/cinemas/debug/all?page=0&size=100
Authorization: Bearer {token}
```

This will show:
- All cinemas in system
- Their chain_id values
- Any NULL assignments

Check logs for debug messages:
```
DEBUG: Found {count} cinemas for chain {chainId}
DEBUG: Cinema: id={id}, name={name}, chainId={chainId}
```

## Prevention for New Cinemas

When creating new cinemas via API:

```bash
POST /api/cinemas/admin
Authorization: Bearer {token}
Content-Type: application/json

{
  "chainId": 1,           # ← MUST provide chainId
  "cinemaName": "...",
  "address": "...",
  ...
}
```

The backend validates:
✅ chainId is provided
✅ chainId exists in database
✅ Cinema name doesn't duplicate in chain

## Database Constraints

The following constraints ensure data integrity:

```sql
-- Foreign key ensures chain_id references valid chain
ALTER TABLE cinemas 
ADD CONSTRAINT fk_cinema_chain 
FOREIGN KEY (chain_id) REFERENCES cinema_chains(chain_id);

-- Index for query performance
CREATE INDEX idx_cinema_chain_id ON cinemas(chain_id);
```

## Files Modified

Backend:
- `CinemaController.java` - Added debug endpoint
- `CinemaService.java` - Added debug logging

Frontend:
- `CinemaManagement.js` - Already correctly filters by chainId

Database:
- `add_manager_to_cinema.sql` - Migration script
- `fix_cinema_chain_data.sql` - Data fix script (NEW)

## Verification Checklist

- [ ] Database backup taken
- [ ] SQL update executed successfully
- [ ] Backend recompiled and restarted
- [ ] No errors in logs
- [ ] /api/cinemas/chain/1/admin returns correct cinemas
- [ ] /api/cinemas/debug/all shows all cinemas
- [ ] Frontend shows correct cinemas per chain
- [ ] Manager assignment works
- [ ] New cinemas created with correct chainId

## Rollback Plan

If data assignment causes issues:

```sql
-- Revert all chain_id assignments
UPDATE cinemas SET chain_id = NULL;

-- Or revert specific updates
UPDATE cinemas 
SET chain_id = NULL 
WHERE cinema_id IN (list_of_cinema_ids);
```

Then re-run data fix script carefully.

## Performance Note

After fixing data, query performance improves:

```sql
-- With proper chain_id, this query is fast:
SELECT * FROM cinemas WHERE chain_id = 1;  -- Uses idx_cinema_chain_id index

-- Without chain_id, full table scan occurs:
SELECT * FROM cinemas;  -- Slow if many cinemas
```

## Support

If issue persists after following these steps:

1. Check backend logs for errors
2. Use `/api/cinemas/debug/all` endpoint
3. Verify database connection
4. Check `chain_id` foreign key constraint
5. Ensure JWT token is valid and user is SYSTEM_ADMIN
