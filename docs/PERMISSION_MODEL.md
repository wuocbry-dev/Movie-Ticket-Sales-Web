# Permission Model - Movie Ticket Sales System

## Overview
This document describes the permission-based access control implemented in the Movie Ticket Sales Web Project.

## Role Hierarchy

```
SYSTEM_ADMIN (highest authority)
    ↓
CINEMA_MANAGER (operational management)
    ↓
CINEMA_STAFF (daily operations)
    ↓
CUSTOMER (end users)
```

## Permission Matrix

### Movie Management

| Action | SYSTEM_ADMIN | CINEMA_MANAGER | CINEMA_STAFF | CUSTOMER |
|--------|--------------|----------------|--------------|----------|
| View Movies | ✅ | ✅ | ❌ | ❌ |
| Add Movies | ✅ | ❌ | ❌ | ❌ |
| Edit Movies | ✅ | ❌ | ❌ | ❌ |
| Delete Movies | ✅ | ❌ | ❌ | ❌ |

### Cinema Management

| Action | SYSTEM_ADMIN | CINEMA_MANAGER | CINEMA_STAFF | CUSTOMER |
|--------|--------------|----------------|--------------|----------|
| View Cinemas | ✅ | ✅ | ✅ | ❌ |
| Add Cinemas | ✅ | ❌ | ❌ | ❌ |
| Edit Cinemas | ✅ | ✅ | ❌ | ❌ |
| Delete Cinemas | ✅ | ❌ | ❌ | ❌ |

### Ticket Sales

| Action | SYSTEM_ADMIN | CINEMA_MANAGER | CINEMA_STAFF | CUSTOMER |
|--------|--------------|----------------|--------------|----------|
| View Sales | ✅ | ✅ | ✅ | ❌ |
| Process Sales | ✅ | ✅ | ✅ | ❌ |
| Refund Tickets | ✅ | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ |

### User Management

| Action | SYSTEM_ADMIN | CINEMA_MANAGER | CINEMA_STAFF | CUSTOMER |
|--------|--------------|----------------|--------------|----------|
| View All Users | ✅ | ❌ | ❌ | ❌ |
| Create Users | ✅ | ❌ | ❌ | ❌ |
| Edit Users | ✅ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ |

## Implementation Details

### Permission Checks in Components

```javascript
import { hasRole, ROLES } from '../utils/roleUtils';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Check permissions
const canEdit = hasRole(user.roles, ROLES.SYSTEM_ADMIN);
const canView = hasRole(user.roles, ROLES.CINEMA_MANAGER) || canEdit;
```

### Conditional Rendering

```javascript
// Show button only for users with edit permission
{canEdit && (
  <button onClick={handleCreate}>
    Thêm Mới
  </button>
)}

// Show view-only indicator
{!canEdit && canView && (
  <div className="view-only-badge">
    <FaEye /> Chỉ xem
  </div>
)}
```

## Dashboard Access

| Role | Dashboard Path | Access Level |
|------|---------------|--------------|
| SYSTEM_ADMIN | /admin/dashboard | Full administrative access |
| CINEMA_MANAGER | /admin/dashboard | Limited administrative access (view-only for movies) |
| CINEMA_STAFF | /staff/dashboard | Operational access (sales, bookings) |
| CUSTOMER | / | Public access (home, booking, profile) |

## Security Considerations

### Frontend Protection
- UI elements hidden based on permissions
- Buttons and actions conditionally rendered
- Role checks using `hasRole()` utility function

### Backend Validation (Required)
⚠️ **IMPORTANT**: Frontend permission checks are for UX only. Always implement server-side validation:
- Validate user roles on every API endpoint
- Use Spring Security annotations (`@PreAuthorize`, `@Secured`)
- Never trust client-side role information alone

## Example: Movie Management Component

```javascript
const MovieManagement = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = hasRole(user.roles, ROLES.SYSTEM_ADMIN);
  const canView = hasRole(user.roles, ROLES.CINEMA_MANAGER) || canEdit;

  return (
    <div>
      {/* Header with conditional title */}
      <h1>{canEdit ? 'Quản Lý Phim' : 'Danh Sách Phim'}</h1>
      
      {/* Add button only for SYSTEM_ADMIN */}
      {canEdit && (
        <button onClick={handleCreate}>
          Thêm Phim Mới
        </button>
      )}
      
      {/* View-only badge for CINEMA_MANAGER */}
      {!canEdit && canView && (
        <div className="view-only-badge">
          <FaEye /> Chỉ xem
        </div>
      )}
      
      {/* Movie list */}
      {movies.map(movie => (
        <div key={movie.id}>
          <h3>{movie.title}</h3>
          
          {/* Action buttons only for SYSTEM_ADMIN */}
          {canEdit && (
            <div>
              <button onClick={() => handleEdit(movie)}>Sửa</button>
              <button onClick={() => handleDelete(movie.id)}>Xóa</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

## Future Enhancements

### Planned Features
- [ ] Fine-grained permissions per cinema (manager can only edit their assigned cinema)
- [ ] Permission caching to reduce localStorage reads
- [ ] Audit logging for sensitive actions
- [ ] Time-based permissions (temporary elevated access)
- [ ] Permission preloading on login

### API Integration
- Backend should return user permissions in login response
- Frontend should validate against these permissions
- Implement permission refresh mechanism

## Troubleshooting

### User Sees Wrong Permissions
1. Check localStorage user data: `localStorage.getItem('user')`
2. Verify roles array format: `["SYSTEM_ADMIN"]` or `["ROLE_SYSTEM_ADMIN"]`
3. Clear cache and re-login
4. Check `hasRole()` function logic in `roleUtils.js`

### Buttons Not Hiding
1. Verify `canEdit` and `canView` constants are correctly calculated
2. Check conditional rendering syntax: `{canEdit && <button>}`
3. Inspect component re-render after role change
4. Verify user object is loaded before render

## Related Files

- `src/utils/roleUtils.js` - Role management utilities
- `src/components/ProtectedRoute.js` - Route-level protection
- `src/components/MovieManagement.js` - Example implementation
- `docs/ROLE_BASED_DASHBOARD_README.md` - Dashboard architecture

## Notes

- **CINEMA_MANAGER** can view movies but cannot modify them
- **SYSTEM_ADMIN** has full control over all resources
- **CINEMA_STAFF** currently has no access to movie management
- Role protection in `App.js` is temporarily disabled for testing (see comment in code)

---

**Last Updated**: 2024
**Version**: 1.0
