# Cinema Manager Assignment Guide

## Overview

This document explains how to assign and manage CINEMA_MANAGER roles for individual cinemas using the new manager tracking system.

## Database Changes

### New Column Added to `cinemas` Table

```sql
ALTER TABLE cinemas ADD COLUMN manager_id INT;

ALTER TABLE cinemas 
ADD CONSTRAINT fk_cinema_manager 
FOREIGN KEY (manager_id) REFERENCES users(user_id);

CREATE INDEX idx_cinema_manager_id ON cinemas(manager_id);
CREATE INDEX idx_cinema_manager_chain ON cinemas(manager_id, chain_id);
```

## How It Works

### 1. SYSTEM_ADMIN Creates Cinema with Manager Assignment

When creating a new cinema:
- SYSTEM_ADMIN can select an existing CINEMA_MANAGER to manage the cinema
- The cinema is then linked to that manager via `manager_id` column
- Optional: Can leave manager unassigned initially

**API Endpoint:**
```
POST /api/cinemas/admin
Content-Type: application/json
Authorization: Bearer {token}

{
  "chainId": 1,
  "managerId": 5,
  "cinemaName": "CGV Premium Hà Nội",
  "address": "123 Kim Mã, Ba Đình, Hà Nội",
  "city": "Hà Nội",
  "district": "Ba Đình",
  "phoneNumber": "024-3825-8888",
  "email": "hanoi@cgvcinema.vn",
  "taxCode": "0102024561",
  "legalName": "CGV Vietnam Co., Ltd",
  "latitude": 10.7769,
  "longitude": 106.7009
}
```

### 2. SYSTEM_ADMIN Reassigns Manager

To change which CINEMA_MANAGER manages a cinema:
- Edit the cinema
- Select a different manager from the dropdown
- Save changes

**API Endpoint:**
```
PUT /api/cinemas/admin/{cinemaId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "managerId": 6,
  "cinemaName": "...",
  ...
}
```

### 3. Frontend - Cinema Management UI

#### Cinema Creation Form
1. Navigate to Cinema Chain Management
2. Click "Quản Lý Rạp" on a cinema chain
3. Click "Thêm Rạp Mới" button
4. Fill in cinema details
5. **Select a manager from "Người Quản Lý" dropdown**
6. Click "Tạo Rạp"

#### Cinema Card Display
Each cinema card now shows:
- Cinema Name
- Address
- Contact Information
- **Manager Name & Email** (if assigned)

#### Edit Cinema
1. Click edit button on cinema card
2. **Update manager assignment** if needed
3. Save changes

## Authorization Rules

### SYSTEM_ADMIN Permissions
✅ Create cinemas with manager assignment
✅ Reassign managers to different cinemas
✅ View all cinema managers
✅ Update cinema manager information

### CINEMA_MANAGER Permissions
✅ View cinemas assigned to them
✅ Update cinema details (phone, email, address, etc.)
❌ Cannot assign themselves to other cinemas
❌ Cannot manage unassigned cinemas
❌ Cannot change manager assignments

## API Response Format

### Cinema DTO Response

```json
{
  "cinemaId": 1,
  "chainId": 1,
  "chainName": "CGV",
  "managerId": 5,
  "managerName": "Nguyễn Văn A",
  "managerEmail": "manager@cgv.vn",
  "cinemaName": "CGV Premium Hà Nội",
  "address": "123 Kim Mã",
  "city": "Hà Nội",
  "district": "Ba Đình",
  "phoneNumber": "024-3825-8888",
  "email": "hanoi@cgvcinema.vn",
  "taxCode": "0102024561",
  "legalName": "CGV Vietnam",
  "latitude": 10.7769,
  "longitude": 106.7009,
  "isActive": true,
  "createdAt": "2025-12-03T10:00:00Z",
  "updatedAt": "2025-12-03T10:00:00Z"
}
```

## Repository Queries

### Find Cinemas by Manager

**Method:** `findByManagerId(Integer managerId, Pageable pageable)`

Returns all cinemas managed by a specific CINEMA_MANAGER.

### Find Cinemas by Manager and Chain

**Method:** `findCinemasByManagerAndChain(Integer managerId, Integer chainId, Pageable pageable)`

Returns cinemas managed by a specific CINEMA_MANAGER within a specific chain.

## Frontend Components

### CinemaManagement Component
- Fetches managers list when opening modal
- Displays manager dropdown in create/edit forms
- Shows manager info on cinema cards
- Validates manager selection before submission

### State Management
```javascript
const [managers, setManagers] = useState([]);
const [loadingManagers, setLoadingManagers] = useState(false);
const [formData, setFormData] = useState({
  ...otherFields,
  managerId: ''
});
```

### Manager API Endpoint (Frontend)
```javascript
GET /api/accounts/roles/CINEMA_MANAGER

// Fetches all users with CINEMA_MANAGER role
// Used to populate manager selection dropdown
```

## Error Handling

### Common Errors

**"Người dùng không có quyền CINEMA_MANAGER"**
- The selected user doesn't have CINEMA_MANAGER role
- Solution: Assign CINEMA_MANAGER role to user first via user management

**"Người quản lý không tồn tại"**
- The manager_id references a non-existent user
- Solution: Verify manager exists and is active

**"Chỉ SYSTEM_ADMIN mới có thể tạo rạp"**
- Only SYSTEM_ADMIN can create new cinemas
- CINEMA_MANAGER can only edit assigned cinemas

## Database Migration Steps

1. **Backup Database**
   ```sql
   -- Before applying migration
   ```

2. **Run Migration**
   ```sql
   -- From docs/add_manager_to_cinema.sql
   ALTER TABLE cinemas ADD COLUMN manager_id INT;
   ALTER TABLE cinemas 
   ADD CONSTRAINT fk_cinema_manager 
   FOREIGN KEY (manager_id) REFERENCES users(user_id);
   CREATE INDEX idx_cinema_manager_id ON cinemas(manager_id);
   CREATE INDEX idx_cinema_manager_chain ON cinemas(manager_id, chain_id);
   ```

3. **Test Connection**
   - Verify no foreign key constraint violations
   - Check cinema creation with manager assignment works

4. **Update Application**
   - Redeploy backend with updated CinemaService
   - Redeploy frontend with updated CinemaManagement component

## Example Workflow

### Scenario: Assigning Manager to New Cinema

1. **SYSTEM_ADMIN logs in** to admin dashboard
2. **Navigates** to Cinema Chain Management
3. **Clicks** "Quản Lý Rạp" on a chain
4. **Clicks** "Thêm Rạp Mới"
5. **Fills** cinema details:
   - Name: "CGV Metropolis Thủ Đức"
   - Address: "Metropolis, Tây Thạnh"
   - City: "TP. HCM"
   - District: "Tây Thạnh"
   - Phone: "028-3825-8888"
   - Email: "metropolis@cgv.vn"
6. **Selects Manager**: "Lê Thị Huỳnh (manager.huynh@cgv.vn)"
7. **Clicks** "Tạo Rạp"
8. **Cinema created** with manager_id assigned
9. **Manager** can now manage this cinema

## Rollback Plan

If issues occur:

```sql
-- Remove the manager_id column
ALTER TABLE cinemas DROP FOREIGN KEY fk_cinema_manager;
ALTER TABLE cinemas DROP COLUMN manager_id;
DROP INDEX idx_cinema_manager_id ON cinemas;
DROP INDEX idx_cinema_manager_chain ON cinemas;
```

Note: Revert backend code changes to previous version.

## Testing Checklist

- [ ] SYSTEM_ADMIN can create cinema with manager assignment
- [ ] Manager name displays on cinema card
- [ ] Manager can view assigned cinemas
- [ ] SYSTEM_ADMIN can reassign manager
- [ ] Error: Invalid manager role validation works
- [ ] Dropdown loads managers on modal open
- [ ] Edit modal pre-selects current manager
- [ ] API returns manager info in DTO

## Related Documents

- `CINEMA_MANAGER_GUIDE.md` - General CINEMA_MANAGER usage
- `ROLE_BASED_DASHBOARD_GUIDE.md` - Dashboard access by role
- Database schema migration: `add_manager_to_cinema.sql`
