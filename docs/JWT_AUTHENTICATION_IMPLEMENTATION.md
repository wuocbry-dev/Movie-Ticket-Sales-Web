# JWT Authentication Implementation Guide

## Overview
This document provides a complete guide for the JWT authentication system implementation using Spring Boot 3.5, Spring Security, Spring Data JPA, and JJWT.

## Components Created

### 1. **DTOs (Data Transfer Objects)**
Located in: `aws/movie_ticket_sales_web_project/dto/`

- **RegisterRequest.java** - Registration request payload
- **LoginRequest.java** - Login request payload
- **LoginResponse.java** - Login response with tokens
- **RegisterResponse.java** - Registration response
- **UserInfo.java** - User information in login response
- **ApiResponse.java** - Generic API response wrapper

### 2. **Security Components**
Located in: `aws/movie_ticket_sales_web_project/security/`

- **JwtTokenProvider.java** - JWT token generation and validation
- **JwtAuthenticationFilter.java** - JWT authentication filter for request processing
- **CustomUserDetails.java** - Custom implementation of Spring Security UserDetails
- **CustomUserDetailsService.java** - Custom UserDetailsService for loading user from database
- **JwtAuthenticationEntryPoint.java** - Handles authentication errors
- **JwtAccessDeniedHandler.java** - Handles authorization errors

### 3. **Configuration**
Located in: `aws/movie_ticket_sales_web_project/config/`

- **SecurityConfig.java** - Spring Security configuration with JWT filter chain

### 4. **Repository Layer**
Located in: `aws/movie_ticket_sales_web_project/repository/`

- **UserRepository.java** - User entity repository
- **RoleRepository.java** - Role entity repository
- **UserRoleRepository.java** - UserRole entity repository
- **MembershipRepository.java** - Membership entity repository
- **MembershipTierRepository.java** - MembershipTier entity repository

### 5. **Service Layer**
Located in: `aws/movie_ticket_sales_web_project/service/`

- **AuthenticationService.java** - Business logic for register and login

### 6. **API Controller**
Located in: `aws/movie_ticket_sales_web_project/api/`

- **AuthController.java** - REST endpoints for authentication

---

## Database Setup

### Required SQL Initialization

Before testing, ensure your database has the required data:

```sql
-- Insert default roles
INSERT INTO roles (role_name, description, created_at) 
VALUES ('CUSTOMER', 'Customer role', NOW());

INSERT INTO roles (role_name, description, created_at) 
VALUES ('ADMIN', 'Administrator role', NOW());

INSERT INTO roles (role_name, description, created_at) 
VALUES ('STAFF', 'Staff role', NOW());

-- Insert default membership tiers
INSERT INTO membership_tiers (tier_name, tier_name_display, min_annual_spending, min_visits_per_year, 
                              points_earn_rate, discount_percentage, free_tickets_per_year, 
                              priority_booking, free_upgrades, tier_level, is_active, created_at, updated_at)
VALUES ('BRONZE', 'Bronze Member', 0, 0, 1.0, 0, 0, 0, 0, 1, 1, NOW(), NOW());

INSERT INTO membership_tiers (tier_name, tier_name_display, min_annual_spending, min_visits_per_year, 
                              points_earn_rate, discount_percentage, free_tickets_per_year, 
                              priority_booking, free_upgrades, tier_level, is_active, created_at, updated_at)
VALUES ('SILVER', 'Silver Member', 5000000, 12, 1.5, 5, 2, 1, 0, 2, 1, NOW(), NOW());

INSERT INTO membership_tiers (tier_name, tier_name_display, min_annual_spending, min_visits_per_year, 
                              points_earn_rate, discount_percentage, free_tickets_per_year, 
                              priority_booking, free_upgrades, tier_level, is_active, created_at, updated_at)
VALUES ('GOLD', 'Gold Member', 20000000, 24, 2.0, 10, 5, 1, 1, 3, 1, NOW(), NOW());

INSERT INTO membership_tiers (tier_name, tier_name_display, min_annual_spending, min_visits_per_year, 
                              points_earn_rate, discount_percentage, free_tickets_per_year, 
                              priority_booking, free_upgrades, tier_level, is_active, created_at, updated_at)
VALUES ('PLATINUM', 'Platinum Member', 50000000, 36, 2.5, 15, 10, 1, 1, 4, 1, NOW(), NOW());
```

---

## API Endpoints

### 1. User Registration
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "0901234567",
  "password": "SecurePass123!",
  "fullName": "Nguyen Van A",
  "dateOfBirth": "1995-05-15",
  "gender": "MALE",
  "privacyPolicyAccepted": true,
  "privacyPolicyVersion": "1.0",
  "termsOfServiceAccepted": true,
  "termsOfServiceVersion": "1.0"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "isEmailVerified": false,
    "membershipNumber": "MB000000001",
    "tierName": "BRONZE"
  }
}
```

### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "userId": 1,
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "membershipTier": "BRONZE",
      "availablePoints": 0
    }
  }
}
```

---

## JWT Token Configuration

The JWT configuration is set in `application.properties`:

```properties
# JWT Configuration
app.jwt.secret=mySecretKeyForJWTTokenGenerationAndValidationMustBeAtLeast32CharsLong
app.jwt.expiration=3600000          # 1 hour in milliseconds
app.jwt.refresh-expiration=86400000 # 24 hours in milliseconds
```

**Important:** Change the `app.jwt.secret` to a secure random string in production!

---

## Using the JWT Token

### Bearer Token Format

After login, use the `accessToken` in the Authorization header for authenticated requests:

```
Authorization: Bearer <accessToken>
```

### Example Request with JWT:
```bash
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Security Features Implemented

1. **Password Encryption** - Uses BCryptPasswordEncoder
2. **JWT Token Validation** - Validates token signature and expiration
3. **Role-Based Access Control** - Supports multiple roles per user
4. **CORS Configuration** - Configured for frontend communication
5. **Stateless Authentication** - Uses JWT instead of sessions
6. **Automatic Token Extraction** - Extracts token from Authorization header
7. **User Details Loading** - Loads user with roles from database

---

## Testing the Implementation

### 1. Start the Spring Boot Application
```bash
cd "d:\Git_WP\Movie-Ticket-Sales-Web-Project\BE\Movie Ticket Sales Web Project"
.\mvnw.cmd spring-boot:run
```

### 2. Test Registration
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

### 3. Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!"
  }'
```

### 4. Test Protected Endpoint with Token
```bash
curl -X GET http://localhost:8080/api/some-protected-endpoint \
  -H "Authorization: Bearer <accessToken>"
```

---

## Error Responses

### Duplicate Email:
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Invalid Login Credentials:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Unauthorized Access (Missing Token):
```json
{
  "success": false,
  "status": 401,
  "message": "Unauthorized - Authentication required",
  "error": "Full authentication is required to access this resource"
}
```

### Forbidden Access (Insufficient Permissions):
```json
{
  "success": false,
  "status": 403,
  "message": "Forbidden - Access Denied",
  "error": "Access Denied"
}
```

---

## Entity Relationships

```
User (1) -----> (Many) UserRole -----> (1) Role
  |
  +---> (1) Membership -----> (1) MembershipTier
```

---

## Updated Entity Classes

The following entity classes were updated with `@GeneratedValue(strategy = GenerationType.IDENTITY)`:

- `User.java`
- `Role.java`
- `UserRole.java`
- `Membership.java`
- `MembershipTier.java`

This enables automatic ID generation by the database.

---

## Flow Diagrams

### Registration Flow:
1. User sends POST request to `/api/auth/register` with credentials
2. Service validates email and phone don't exist
3. Service creates User with hashed password
4. Service assigns CUSTOMER role
5. Service creates Membership with BRONZE tier
6. Service returns RegisterResponse with userId and membershipNumber

### Login Flow:
1. User sends POST request to `/api/auth/login` with credentials
2. AuthenticationManager validates credentials against hashed password
3. Service generates JWT accessToken and refreshToken
4. Service retrieves user info and membership details
5. Service returns LoginResponse with tokens and user info
6. Client stores tokens and uses accessToken in future requests

### Request Authentication Flow:
1. Client sends request with `Authorization: Bearer <token>` header
2. JwtAuthenticationFilter extracts token from header
3. JwtTokenProvider validates token signature and expiration
4. CustomUserDetailsService loads user and roles from database
5. SecurityContext is set with authenticated user
6. Request proceeds to controller

---

## Notes

- All timestamps use `Instant` (UTC timezone)
- Passwords are stored as hashed strings using BCryptPasswordEncoder
- Each user can have multiple roles through the UserRole junction table
- Membership is automatically created with BRONZE tier upon registration
- JWT tokens expire after 1 hour (configurable)
- Refresh tokens expire after 24 hours (configurable)

---

## Dependencies Added to pom.xml

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

---

## Troubleshooting

### Issue: "User not found with email"
**Solution:** Ensure the user is registered first before attempting to login

### Issue: "Invalid email or password"
**Solution:** Verify the email and password are correct. Note that passwords are case-sensitive.

### Issue: "Token validation failed"
**Solution:** Ensure the token is not expired and the secret key matches between token generation and validation

### Issue: "Email already registered"
**Solution:** Use a different email address for registration

---

## Future Enhancements

1. Email verification functionality
2. Password reset mechanism
3. Refresh token endpoint
4. Two-factor authentication
5. Social login integration
6. Role-based endpoint protection
7. Rate limiting on authentication endpoints
8. Audit logging for authentication events
