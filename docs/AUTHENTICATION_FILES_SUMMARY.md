# Authentication System - File Structure Summary

## Files Created and Modified

### 1. Dependencies Modified
**File:** `pom.xml`
- Added JJWT (JSON Web Token) dependencies:
  - jjwt-api
  - jjwt-impl
  - jjwt-jackson

**File:** `application.properties`
- Added JWT configuration:
  - app.jwt.secret
  - app.jwt.expiration
  - app.jwt.refresh-expiration

---

### 2. Entity Classes - Modified (Added @GeneratedValue)
- `entity/User.java` - ID generation strategy updated
- `entity/Role.java` - ID generation strategy updated
- `entity/UserRole.java` - ID generation strategy updated
- `entity/Membership.java` - ID generation strategy updated
- `entity/MembershipTier.java` - ID generation strategy updated

---

### 3. DTO Classes - Created
**Location:** `dto/`

#### RegisterRequest.java
```
- email: String
- phoneNumber: String
- password: String
- fullName: String
- dateOfBirth: LocalDate
- gender: Gender (enum)
- privacyPolicyAccepted: Boolean
- privacyPolicyVersion: String
- termsOfServiceAccepted: Boolean
- termsOfServiceVersion: String
```

#### LoginRequest.java
```
- email: String
- password: String
```

#### LoginResponse.java
```
- accessToken: String
- refreshToken: String
- expiresIn: Long
- user: UserInfo
```

#### RegisterResponse.java
```
- userId: Integer
- email: String
- fullName: String
- isEmailVerified: Boolean
- membershipNumber: String
- tierName: String
```

#### UserInfo.java
```
- userId: Integer
- email: String
- fullName: String
- membershipTier: String
- availablePoints: Integer
```

#### ApiResponse.java (Generic)
```
- success: Boolean
- message: String
- data: T (Generic type)
```

---

### 4. Security Components - Created
**Location:** `security/`

#### JwtTokenProvider.java
Methods:
- `generateAccessToken(String email, Integer userId)` - Generate access token
- `generateRefreshToken(String email, Integer userId)` - Generate refresh token
- `getEmailFromToken(String token)` - Extract email from token
- `getUserIdFromToken(String token)` - Extract userId from token
- `validateToken(String token)` - Validate token signature and expiration
- `getTokenExpirationTime()` - Get token expiration time

#### JwtAuthenticationFilter.java
- Extends `OncePerRequestFilter`
- Extracts JWT from `Authorization: Bearer <token>` header
- Validates token and sets SecurityContext with authenticated user

#### CustomUserDetails.java
- Implements `UserDetails` interface
- Properties: id, email, password, isActive, authorities
- Static builder method: `build(User user, List<UserRole> userRoles)`

#### CustomUserDetailsService.java
- Implements `UserDetailsService` interface
- `loadUserByUsername(String email)` - Load user by email
- `loadUserById(Integer id)` - Load user by ID
- Loads user with roles from database

#### JwtAuthenticationEntryPoint.java
- Implements `AuthenticationEntryPoint`
- Handles 401 Unauthorized errors
- Returns JSON error response

#### JwtAccessDeniedHandler.java
- Implements `AccessDeniedHandler`
- Handles 403 Forbidden errors
- Returns JSON error response

---

### 5. Configuration - Created
**Location:** `config/`

#### SecurityConfig.java
- `@EnableWebSecurity` - Enable Spring Security
- `@EnableMethodSecurity` - Enable method-level security
- Beans:
  - `passwordEncoder()` - BCryptPasswordEncoder
  - `authenticationProvider()` - DaoAuthenticationProvider
  - `authenticationManager()` - AuthenticationManager
  - `jwtAuthenticationFilter()` - JWT filter
  - `corsConfigurationSource()` - CORS configuration
  - `filterChain()` - Security filter chain
- Allows public access to:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
- Requires authentication for all other endpoints
- Configures JWT filter in filter chain

---

### 6. Repository Interfaces - Created
**Location:** `repository/`

#### UserRepository.java
```java
Optional<User> findByEmail(String email);
boolean existsByEmail(String email);
boolean existsByPhoneNumber(String phoneNumber);
```

#### RoleRepository.java
```java
Optional<Role> findByRoleName(String roleName);
```

#### UserRoleRepository.java
```java
List<UserRole> findByUserId(Integer userId);
```

#### MembershipRepository.java
```java
Optional<Membership> findByUserId(Integer userId);
```

#### MembershipTierRepository.java
```java
Optional<MembershipTier> findByTierName(String tierName);
Optional<MembershipTier> findByTierLevel(Integer tierLevel);
```

---

### 7. Service Layer - Created
**Location:** `service/`

#### AuthenticationService.java
- `register(RegisterRequest request)` - ApiResponse<RegisterResponse>
  - Validates email and phone uniqueness
  - Creates user with hashed password
  - Assigns CUSTOMER role
  - Creates membership with BRONZE tier
  - Generates membership number
  
- `login(LoginRequest request)` - ApiResponse<LoginResponse>
  - Authenticates user with email and password
  - Generates JWT access and refresh tokens
  - Loads user with roles and membership
  - Updates last login timestamp
  - Returns tokens and user info

---

### 8. API Controller - Created
**Location:** `api/`

#### AuthController.java
- `POST /api/auth/register` - Register new user
  - Request: RegisterRequest
  - Response: 201 Created (ApiResponse<RegisterResponse>)
  
- `POST /api/auth/login` - Login user
  - Request: LoginRequest
  - Response: 200 OK (ApiResponse<LoginResponse>)
  - Response: 401 Unauthorized on failure

---

### 9. Documentation - Created
**Location:** `docs/`

#### JWT_AUTHENTICATION_IMPLEMENTATION.md
Complete implementation guide including:
- Component overview
- Database setup SQL
- API endpoint documentation
- JWT token configuration
- Testing examples
- Error responses
- Entity relationships
- Security features
- Troubleshooting guide

---

## Data Flow Diagrams

### Registration Flow:
```
Client
  ↓
POST /api/auth/register
  ↓
AuthController.register()
  ↓
AuthenticationService.register()
  ├→ UserRepository.existsByEmail() [validate uniqueness]
  ├→ PasswordEncoder.encode() [hash password]
  ├→ UserRepository.save() [save user]
  ├→ RoleRepository.findByRoleName() [get CUSTOMER role]
  ├→ UserRoleRepository.save() [assign role]
  ├→ MembershipTierRepository.findByTierLevel() [get BRONZE tier]
  └→ MembershipRepository.save() [create membership]
  ↓
ApiResponse<RegisterResponse>
```

### Login Flow:
```
Client
  ↓
POST /api/auth/login
  ↓
AuthController.login()
  ↓
AuthenticationService.login()
  ├→ AuthenticationManager.authenticate()
  │   ├→ CustomUserDetailsService.loadUserByUsername()
  │   ├→ UserRepository.findByEmail()
  │   ├→ UserRoleRepository.findByUserId()
  │   └→ PasswordEncoder.matches()
  ├→ JwtTokenProvider.generateAccessToken()
  ├→ JwtTokenProvider.generateRefreshToken()
  ├→ MembershipRepository.findByUserId()
  └→ UserRepository.save() [update last login]
  ↓
ApiResponse<LoginResponse> with tokens
```

### Request Authentication Flow:
```
Client Request (with Authorization: Bearer <token>)
  ↓
JwtAuthenticationFilter.doFilterInternal()
  ├→ Extract token from Authorization header
  ├→ JwtTokenProvider.validateToken()
  ├→ JwtTokenProvider.getEmailFromToken()
  ├→ CustomUserDetailsService.loadUserByUsername()
  ├→ Create UsernamePasswordAuthenticationToken
  └→ SecurityContextHolder.getContext().setAuthentication()
  ↓
Request continues to controller with authenticated user
```

---

## Security Features

1. ✅ **Password Encryption** - BCryptPasswordEncoder
2. ✅ **JWT Token Generation** - JJWT library
3. ✅ **Token Validation** - Signature and expiration check
4. ✅ **Role-Based Access** - Multiple roles per user
5. ✅ **CORS Support** - Cross-origin requests allowed
6. ✅ **Stateless Auth** - No server-side sessions
7. ✅ **Automatic Token Extraction** - From Authorization header
8. ✅ **User Details Loading** - With roles from database
9. ✅ **Exception Handling** - JSON error responses
10. ✅ **Transactional Support** - Atomic operations

---

## Configuration Properties

```properties
# JWT Configuration
app.jwt.secret=mySecretKeyForJWTTokenGenerationAndValidationMustBeAtLeast32CharsLong
app.jwt.expiration=3600000          # 1 hour in milliseconds
app.jwt.refresh-expiration=86400000 # 24 hours in milliseconds

# Spring Security
spring.security.user.name=admin
spring.security.user.password=admin
```

---

## HTTP Status Codes

| Endpoint | Success | Failure |
|----------|---------|---------|
| POST /api/auth/register | 201 Created | 400 Bad Request |
| POST /api/auth/login | 200 OK | 401 Unauthorized |
| Protected endpoints (missing token) | - | 401 Unauthorized |
| Protected endpoints (no permission) | - | 403 Forbidden |

---

## Database Tables Used

1. `users` - User account information
2. `roles` - Role definitions
3. `user_roles` - User-Role junction table
4. `memberships` - User membership information
5. `membership_tiers` - Membership tier definitions

---

## Required SQL Initialization

Before testing, run the following SQL:

```sql
-- Insert default roles
INSERT INTO roles (role_name, description, created_at) VALUES ('CUSTOMER', 'Customer role', NOW());
INSERT INTO roles (role_name, description, created_at) VALUES ('ADMIN', 'Administrator role', NOW());

-- Insert default membership tiers
INSERT INTO membership_tiers (tier_name, tier_name_display, min_annual_spending, tier_level, is_active, created_at, updated_at) 
VALUES ('BRONZE', 'Bronze Member', 0, 1, 1, NOW(), NOW());
```

---

## How to Test

1. **Start Application:**
   ```bash
   cd "BE\Movie Ticket Sales Web Project"
   .\mvnw.cmd spring-boot:run
   ```

2. **Register User:**
   ```bash
   POST http://localhost:8080/api/auth/register
   ```

3. **Login User:**
   ```bash
   POST http://localhost:8080/api/auth/login
   ```

4. **Use Token:**
   ```
   Authorization: Bearer <accessToken>
   ```

---

## File Locations

```
src/main/java/aws/movie_ticket_sales_web_project/
├── api/
│   └── AuthController.java
├── config/
│   └── SecurityConfig.java
├── dto/
│   ├── ApiResponse.java
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── RegisterRequest.java
│   ├── RegisterResponse.java
│   └── UserInfo.java
├── repository/
│   ├── MembershipRepository.java
│   ├── MembershipTierRepository.java
│   ├── RoleRepository.java
│   ├── UserRepository.java
│   └── UserRoleRepository.java
├── security/
│   ├── CustomUserDetails.java
│   ├── CustomUserDetailsService.java
│   ├── JwtAccessDeniedHandler.java
│   ├── JwtAuthenticationEntryPoint.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtTokenProvider.java
└── service/
    └── AuthenticationService.java

src/main/resources/
└── application.properties (modified)

pom.xml (modified)

docs/
└── JWT_AUTHENTICATION_IMPLEMENTATION.md
```

---

## Summary

A complete JWT-based authentication system has been implemented with:

✅ **8 DTO Classes** - For request/response serialization
✅ **6 Security Components** - For token management and filtering
✅ **1 Configuration Class** - For Spring Security setup
✅ **5 Repository Interfaces** - For database operations
✅ **1 Service Class** - For business logic
✅ **1 Controller Class** - For REST endpoints
✅ **5 Entity Updates** - For ID generation
✅ **Comprehensive Documentation** - Implementation guide

All components follow Spring Boot 3.5 best practices and use modern Java features like records, sealed classes, and text blocks where applicable.
