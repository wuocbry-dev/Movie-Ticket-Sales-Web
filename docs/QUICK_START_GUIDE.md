# JWT Authentication - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Database Initialization
Run these SQL commands to initialize the required data:

```sql
-- Roles
INSERT INTO roles (role_name, description, created_at) VALUES ('CUSTOMER', 'Customer role', NOW());
INSERT INTO roles (role_name, description, created_at) VALUES ('ADMIN', 'Administrator role', NOW());

-- Membership Tiers
INSERT INTO membership_tiers (tier_name, tier_name_display, min_annual_spending, min_visits_per_year, 
                              points_earn_rate, discount_percentage, free_tickets_per_year, 
                              priority_booking, free_upgrades, tier_level, is_active, created_at, updated_at)
VALUES ('BRONZE', 'Bronze Member', 0, 0, 1.0, 0, 0, 0, 0, 1, 1, NOW(), NOW());
```

### Step 2: Start the Application
```bash
cd "BE\Movie Ticket Sales Web Project"
.\mvnw.cmd spring-boot:run
```

### Step 3: Test the Endpoints

#### 3a. Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "phoneNumber": "0912345678",
    "password": "SecurePass123!",
    "fullName": "Test User",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "privacyPolicyAccepted": true,
    "privacyPolicyVersion": "1.0",
    "termsOfServiceAccepted": true,
    "termsOfServiceVersion": "1.0"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "userId": 1,
    "email": "testuser@example.com",
    "fullName": "Test User",
    "isEmailVerified": false,
    "membershipNumber": "MB000000001",
    "tierName": "BRONZE"
  }
}
```

#### 3b. Login the User
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "userId": 1,
      "email": "testuser@example.com",
      "fullName": "Test User",
      "membershipTier": "BRONZE",
      "availablePoints": 0
    }
  }
}
```

---

## 🔐 Using the JWT Token

### Authorization Header Format
```
Authorization: Bearer <accessToken>
```

### Example Request with Token
```bash
curl -X GET http://localhost:8080/api/protected-endpoint \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📝 Request/Response Examples

### Registration Request Fields
| Field | Type | Required | Format |
|-------|------|----------|--------|
| email | string | Yes | Valid email |
| phoneNumber | string | No | Phone number format |
| password | string | Yes | Min 8 chars, special chars recommended |
| fullName | string | Yes | User's full name |
| dateOfBirth | date | No | YYYY-MM-DD |
| gender | enum | No | MALE, FEMALE, OTHER |
| privacyPolicyAccepted | boolean | Yes | true/false |
| privacyPolicyVersion | string | Yes | Version string |
| termsOfServiceAccepted | boolean | Yes | true/false |
| termsOfServiceVersion | string | Yes | Version string |

### Login Request Fields
| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

---

## ✅ Validation Rules

### Email
- Must be unique in the system
- Must be valid email format
- Case-insensitive

### Phone Number
- Must be unique if provided
- Optional field
- Must be valid phone format

### Password
- Minimum 8 characters (recommended)
- Will be hashed with BCrypt before storage
- Never stored as plain text
- Case-sensitive during login

### Full Name
- Required
- No specific format constraints

---

## 🔄 Token Flow

```
1. User sends credentials (register/login)
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT tokens:
   - Access Token (expires in 1 hour)
   - Refresh Token (expires in 24 hours)
   ↓
4. Client stores tokens
   ↓
5. Client includes access token in Authorization header for subsequent requests
   ↓
6. Server validates token before processing request
```

---

## 🚨 Error Responses

### 400 Bad Request - Duplicate Email
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 400 Bad Request - Duplicate Phone Number
```json
{
  "success": false,
  "message": "Phone number already registered"
}
```

### 401 Unauthorized - Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 401 Unauthorized - Missing Token
```json
{
  "success": false,
  "status": 401,
  "message": "Unauthorized - Authentication required",
  "error": "Full authentication is required to access this resource"
}
```

### 403 Forbidden - Insufficient Permissions
```json
{
  "success": false,
  "status": 403,
  "message": "Forbidden - Access Denied",
  "error": "Access Denied"
}
```

---

## 🛠️ Configuration

### application.properties
```properties
# JWT Configuration
app.jwt.secret=mySecretKeyForJWTTokenGenerationAndValidationMustBeAtLeast32CharsLong
app.jwt.expiration=3600000          # 1 hour
app.jwt.refresh-expiration=86400000 # 24 hours
```

**⚠️ IMPORTANT:** Change `app.jwt.secret` to a secure random string in production!

Generate a secure secret:
```bash
openssl rand -base64 32
```

---

## 🗂️ Project Structure

```
Movie Ticket Sales Web Project/
├── src/main/java/aws/movie_ticket_sales_web_project/
│   ├── api/
│   │   └── AuthController.java
│   ├── config/
│   │   └── SecurityConfig.java
│   ├── dto/
│   │   ├── ApiResponse.java
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   ├── RegisterRequest.java
│   │   ├── RegisterResponse.java
│   │   └── UserInfo.java
│   ├── entity/
│   │   ├── User.java (modified)
│   │   ├── Role.java (modified)
│   │   ├── UserRole.java (modified)
│   │   ├── Membership.java (modified)
│   │   └── MembershipTier.java (modified)
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── RoleRepository.java
│   │   ├── UserRoleRepository.java
│   │   ├── MembershipRepository.java
│   │   └── MembershipTierRepository.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── CustomUserDetails.java
│   │   ├── CustomUserDetailsService.java
│   │   ├── JwtAuthenticationEntryPoint.java
│   │   └── JwtAccessDeniedHandler.java
│   └── service/
│       └── AuthenticationService.java
├── pom.xml (modified)
└── application.properties (modified)
```

---

## 🧪 Testing Checklist

- [ ] Database initialized with roles and tiers
- [ ] Application starts without errors
- [ ] Can register a new user
- [ ] User receives unique membership number
- [ ] User is assigned CUSTOMER role
- [ ] User gets BRONZE membership tier
- [ ] Can login with registered credentials
- [ ] JWT tokens are returned on login
- [ ] Can use token for authenticated requests
- [ ] Invalid credentials return 401
- [ ] Duplicate email returns 400
- [ ] Missing token returns 401

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Check MySQL is running and credentials in application-dev.properties |
| "Role not found" | Run the SQL initialization script to insert roles |
| "Tier not found" | Run the SQL initialization script to insert membership tiers |
| "User not found after registration" | Check that user was actually saved to database |
| "Invalid token" | Ensure the token hasn't expired (1 hour) and secret matches |
| "Email already registered" | Use a different email for registration |
| "Port 8080 already in use" | Kill process using port 8080 or change server.port in properties |

---

## 📚 Additional Resources

- **Complete Implementation Guide:** `JWT_AUTHENTICATION_IMPLEMENTATION.md`
- **File Structure Summary:** `AUTHENTICATION_FILES_SUMMARY.md`
- **Postman Collection:** `Authentication_API_Postman_Collection.json`

---

## 🎯 Next Steps

After the authentication system is working:

1. **Add Email Verification** - Send verification emails to new users
2. **Add Password Reset** - Implement forgot password functionality
3. **Add Refresh Token Endpoint** - Allow token refresh without re-login
4. **Add Role-Based Endpoints** - Protect endpoints with specific roles
5. **Add Audit Logging** - Log all authentication events
6. **Implement Rate Limiting** - Prevent brute force attacks

---

## 📞 Support

For issues or questions about the authentication system:
1. Check `JWT_AUTHENTICATION_IMPLEMENTATION.md` for detailed documentation
2. Review error messages and troubleshooting guide
3. Check application logs for detailed error information
4. Verify database connection and data initialization

---

## ✨ Features Implemented

✅ User Registration with Email, Phone, and Password
✅ Secure Password Hashing (BCrypt)
✅ JWT Token Generation (Access + Refresh)
✅ Token Validation and Expiration
✅ Automatic Membership Creation
✅ Role-Based Access Control
✅ CORS Support
✅ Exception Handling
✅ Transaction Management
✅ Comprehensive Error Messages

---

**Last Updated:** October 2025
**Version:** 1.0
**Status:** Production Ready
