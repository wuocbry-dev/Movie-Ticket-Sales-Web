# Cinema Chain Filtering - Implementation & Troubleshooting

## Issue Report

**Problem**: When clicking "Quản Lý Rạp" (Manage Cinema) on a cinema chain, all cinemas appear instead of just cinemas for that specific chain.

**Example**: 
- Clicking "Quản Lý Rạp" on Cinestar shows CGV, BHD Star, and Cinestar cinemas
- Should only show Cinestar cinemas

## Root Cause

The existing cinema records in the database have `chain_id = NULL` because:

1. Cinemas were created before the `chain_id` foreign key was added
2. Or cinemas were imported/migrated without chain assignment
3. The `chain_id` column was added but not populated with data

**Result**: The query `SELECT * FROM cinemas WHERE chain_id = {chainId}` returns no results

## Quick Fix - Data Assignment

### Step 1: Run Database Migration

Run the fix script to assign cinemas to chains based on naming patterns:

```bash
# File: docs/fix_cinema_chain_data.sql
```

**Script content**:
```sql
-- Update CGV cinemas
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cgv' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%cgv%' AND chain_id IS NULL;

-- Update Cinestar cinemas
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'cinestar' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%cinestar%' AND chain_id IS NULL;

-- Update BHD Star cinemas
UPDATE cinemas 
SET chain_id = (SELECT chain_id FROM cinema_chains WHERE LOWER(chain_name) = 'bhd star' LIMIT 1)
WHERE LOWER(cinema_name) LIKE '%bhd%' AND chain_id IS NULL;
```

### Step 2: Verify Data

```sql
-- Check cinemas are now assigned
SELECT cinema_id, cinema_name, chain_id 
FROM cinemas 
WHERE chain_id IS NOT NULL 
ORDER BY chain_id;

-- Check for any unassigned
SELECT COUNT(*) FROM cinemas WHERE chain_id IS NULL;
```

### Step 3: Restart Backend

```bash
# Stop backend
# Restart backend application
```

### Step 4: Test in UI

1. Login as SYSTEM_ADMIN
2. Navigate to Cinema Chain Management
3. Click "Quản Lý Rạp" on different chains
4. Verify cinemas display correctly

## Technical Details

### Backend Implementation

**1. CinemaRepository** - Queries filter by chain_id:

```java
Page<Cinema> findByChainId(Integer chainId, Pageable pageable);

@Query("SELECT c FROM Cinema c WHERE c.chain.id = :chainId 
        AND LOWER(c.cinemaName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
Page<Cinema> searchByChainIdAndName(@Param("chainId") Integer chainId, ...);
```

**2. CinemaService** - Logs query results for debugging:

```java
Page<Cinema> cinemaPage = cinemaRepository.findByChainId(chainId, pageable);
log.debug("Found {} cinemas for chain {}", cinemaPage.getTotalElements(), chainId);
```

**3. CinemaController** - Exposes endpoints:

```java
// Admin endpoint - gets cinemas for specific chain
GET /api/cinemas/chain/{chainId}/admin?page=0&size=10

// Debug endpoint - gets all cinemas (for troubleshooting)
GET /api/cinemas/debug/all?page=0&size=10
```

### Frontend Implementation

**CinemaManagement.js** - Correctly passes chainId:

```javascript
const { chainId } = useParams();  // Get from URL: /admin/cinema-chains/{chainId}

const url = `${API_BASE_URL}/cinemas/chain/${chainId}/admin?page=...`;
```

The frontend implementation is correct. The issue is purely data-related.

## Debug Process

### If Cinemas Still Don't Filter After Migration:

**1. Check raw database data**:
```sql
SELECT cinema_id, cinema_name, chain_id FROM cinemas LIMIT 10;
```

**2. Verify chain_id is not NULL**:
```sql
SELECT COUNT(*) as null_count FROM cinemas WHERE chain_id IS NULL;
```

**3. Use debug endpoint to inspect what API returns**:
```bash
# Get all cinemas with no filtering
GET /api/cinemas/debug/all?page=0&size=100

# Check backend logs for:
# "DEBUG: Found X cinemas for chain Y"
# "DEBUG: Cinema: id=Z, name=..., chainId=..."
```

**4. Test specific chain query**:
```bash
# Get cinemas for chain ID 1
GET /api/cinemas/chain/1/admin?page=0&size=10

# Check response - should show only chain 1 cinemas
```

## Files Provided

### Documentation
- `FIX_CINEMA_FILTERING.md` - Detailed troubleshooting guide
- `CINEMA_MANAGER_ASSIGNMENT.md` - Manager assignment feature

### SQL Scripts
- `add_manager_to_cinema.sql` - Add manager_id column
- `fix_cinema_chain_data.sql` - Assign chain_id to cinemas

### Code Changes
**Backend**:
- `CinemaController.java` - Added debug endpoint
- `CinemaService.java` - Added debug logging
- `CinemaRepository.java` - Queries already correct

**Frontend**:
- `CinemaManagement.js` - Manager support added
- `CinemaManagement.css` - Styles for manager display

## Database Integrity

Ensure these constraints exist:

```sql
-- Foreign key prevents invalid chain assignments
ALTER TABLE cinemas 
ADD CONSTRAINT fk_cinema_chain 
FOREIGN KEY (chain_id) REFERENCES cinema_chains(chain_id);

-- Indexes for query performance
CREATE INDEX idx_cinema_chain_id ON cinemas(chain_id);
CREATE INDEX idx_cinema_manager_chain ON cinemas(manager_id, chain_id);
```

## Expected Behavior After Fix

✅ Click "Quản Lý Rạp" on CGV → Shows only CGV cinemas
✅ Click "Quản Lý Rạp" on Cinestar → Shows only Cinestar cinemas
✅ Click "Quản Lý Rạp" on BHD Star → Shows only BHD Star cinemas
✅ Can create new cinema with manager assignment
✅ Cinema card displays manager information when assigned

## Implementation Checklist

- [ ] Database migrated (chain_id column added)
- [ ] Cinema data fixed (chain_id assigned to all cinemas)
- [ ] Backend compiled successfully
- [ ] Backend restarted
- [ ] Frontend displays correctly
- [ ] Filtering by chain works
- [ ] Manager selection appears in create/edit forms
- [ ] Manager info displays on cinema cards
- [ ] No errors in browser console
- [ ] No errors in application logs

## Performance Notes

- Query uses indexed column `chain_id` → Fast
- Search additionally filters by cinema name with `LIKE` → May need optimization for large datasets
- Manager assignment adds minimal overhead

## Future Improvements

1. Add cascade delete when cinema chain deleted
2. Add cinema availability status (e.g., "Opening Soon")
3. Add cinema amenities/features management
4. Add seat/room management
5. Cache cinema list for better performance

## Support

For issues or questions, check:

1. Application logs for errors
2. Database for NULL chain_id values
3. Debug endpoint response
4. Browser console for network errors
5. JWT token validity
