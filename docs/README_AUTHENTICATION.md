# 🔐 JWT Authentication System - Complete Implementation

A production-ready JWT authentication system for the Movie Ticket Sales Web Project built with Spring Boot 3.5, Spring Security, and JJWT.

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Components](#components)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## ✨ Features

✅ **User Registration** - Create new user accounts with email, phone, and password  
✅ **User Login** - Authenticate users and generate JWT tokens  
✅ **JWT Token Management** - Access tokens (1 hour) and refresh tokens (24 hours)  
✅ **Role-Based Access Control** - Support for multiple roles (CUSTOMER, ADMIN, STAFF, MANAGER)  
✅ **Password Security** - BCrypt password hashing  
✅ **Automatic Membership** - New users automatically get BRONZE tier membership  
✅ **Email Uniqueness** - Prevent duplicate email registrations  
✅ **Phone Uniqueness** - Prevent duplicate phone registrations  
✅ **Token Validation** - Automatic token validation on protected endpoints  
✅ **CORS Support** - Allow cross-origin requests  
✅ **Exception Handling** - Comprehensive error responses  
✅ **Audit Ready** - Timestamps and user tracking  

---

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.8+
- MySQL 8.0+
- Spring Boot 3.5.6

### Installation

1. **Database Setup**
   ```bash
   # Run the SQL initialization script
   mysql -u root -p < docs/database_authentication_setup.sql
   ```

2. **Start the Application**
   ```bash
   cd "BE\Movie Ticket Sales Web Project"
   .\mvnw.cmd spring-boot:run
   ```

3. **Test Registration**
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "SecurePass123!",
       "fullName": "Your Name",
       "dateOfBirth": "1990-01-15",
       "gender": "MALE",
       "privacyPolicyAccepted": true,
       "privacyPolicyVersion": "1.0",
       "termsOfServiceAccepted": true,
       "termsOfServiceVersion": "1.0"
     }'
   ```

4. **Test Login**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "SecurePass123!"
     }'
   ```

---

## 🏗️ Architecture

### System Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├─→ POST /api/auth/register
       │   └─→ AuthController
       │       └─→ AuthenticationService
       │           ├─→ Validate Email Uniqueness
       │           ├─→ Hash Password (BCrypt)
       │           ├─→ Create User
       │           ├─→ Assign CUSTOMER Role
       │           ├─→ Create BRONZE Membership
       │           └─→ Return RegisterResponse
       │
       ├─→ POST /api/auth/login
       │   └─→ AuthController
       │       └─→ AuthenticationService
       │           ├─→ AuthenticationManager.authenticate()
       │           ├─→ Load User Details
       │           ├─→ Generate JWT Tokens
       │           ├─→ Update Last Login
       │           └─→ Return LoginResponse with Tokens
       │
       └─→ GET /api/protected-endpoint
           └─→ JwtAuthenticationFilter
               ├─→ Extract Token from Header
               ├─→ Validate Token Signature
               ├─→ Load User from Database
               ├─→ Set SecurityContext
               └─→ Continue to Controller
```

### Component Dependencies

```
User Entity
    ├── password_hash (BCrypted)
    ├── roles (UserRole junction table)
    └── membership (One-to-One)

UserRole Entity
    ├── user (Many-to-One)
    └── role (Many-to-One)

Membership Entity
    ├── user (One-to-One)
    └── tier (Many-to-One)

JWT Token
    ├── Subject: email
    ├── Claim: userId
    ├── Signed with: SECRET_KEY
    └── Expires: configurable
```

---

## 📡 API Endpoints

### 1. Register User
```http
POST /api/auth/register HTTP/1.1
Content-Type: application/json

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

**Response: 201 Created**
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

### 2. Login User
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response: 200 OK**
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
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "membershipTier": "BRONZE",
      "availablePoints": 0
    }
  }
}
```

### 3. Protected Endpoint (Example)
```http
GET /api/some-protected-endpoint HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧩 Components

### DTOs
| File | Purpose |
|------|---------|
| `RegisterRequest.java` | Registration input data |
| `LoginRequest.java` | Login credentials |
| `LoginResponse.java` | Login success response with tokens |
| `RegisterResponse.java` | Registration success response |
| `UserInfo.java` | User information in responses |
| `ApiResponse.java` | Generic API response wrapper |

### Security
| File | Purpose |
|------|---------|
| `JwtTokenProvider.java` | Generate and validate JWT tokens |
| `JwtAuthenticationFilter.java` | Process JWT in request headers |
| `CustomUserDetails.java` | Spring Security user implementation |
| `CustomUserDetailsService.java` | Load user from database |
| `JwtAuthenticationEntryPoint.java` | Handle 401 errors |
| `JwtAccessDeniedHandler.java` | Handle 403 errors |

### Service & Controller
| File | Purpose |
|------|---------|
| `AuthenticationService.java` | Business logic for auth |
| `AuthController.java` | REST endpoints |

### Repository
| File | Purpose |
|------|---------|
| `UserRepository.java` | Query user data |
| `RoleRepository.java` | Query role data |
| `UserRoleRepository.java` | Query user-role mappings |
| `MembershipRepository.java` | Query membership data |
| `MembershipTierRepository.java` | Query tier data |

---

## 📊 Database Setup

### Required Tables
- `users` - User accounts
- `roles` - Role definitions
- `user_roles` - User-Role mappings
- `memberships` - User memberships
- `membership_tiers` - Membership tier definitions

### Initialization
Run the database setup script:
```bash
mysql -u root -p movie_ticket_db < docs/database_authentication_setup.sql
```

This creates:
- 4 Roles: CUSTOMER, ADMIN, STAFF, MANAGER
- 4 Membership Tiers: BRONZE, SILVER, GOLD, PLATINUM
- 2 Test Users (optional)

---

## ⚙️ Configuration

### JWT Settings
**File:** `application.properties`

```properties
app.jwt.secret=mySecretKeyForJWTTokenGenerationAndValidationMustBeAtLeast32CharsLong
app.jwt.expiration=3600000          # 1 hour
app.jwt.refresh-expiration=86400000 # 24 hours
```

### Generate Secure Secret
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (with OpenSSL installed)
openssl rand -base64 32

# Or use Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Database Connection
**File:** `application-dev.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/movie_ticket_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

---

## 💡 Usage Examples

### Example 1: Register and Login Flow
```python
import requests
import json

BASE_URL = "http://localhost:8080/api/auth"

# 1. Register
register_data = {
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "fullName": "New User",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "privacyPolicyAccepted": True,
    "privacyPolicyVersion": "1.0",
    "termsOfServiceAccepted": True,
    "termsOfServiceVersion": "1.0"
}

register_response = requests.post(
    f"{BASE_URL}/register",
    json=register_data,
    headers={"Content-Type": "application/json"}
)

print("Registration:", register_response.json())

# 2. Login
login_data = {
    "email": "newuser@example.com",
    "password": "SecurePass123!"
}

login_response = requests.post(
    f"{BASE_URL}/login",
    json=login_data,
    headers={"Content-Type": "application/json"}
)

response_json = login_response.json()
print("Login:", response_json)

# 3. Use token for protected request
access_token = response_json['data']['accessToken']
headers = {
    "Authorization": f"Bearer {access_token}"
}

protected_response = requests.get(
    "http://localhost:8080/api/protected-endpoint",
    headers=headers
)

print("Protected Request:", protected_response.json())
```

### Example 2: JavaScript/Frontend
```javascript
// Register
async function register() {
  const response = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'SecurePass123!',
      fullName: 'User Name',
      dateOfBirth: '1990-01-15',
      gender: 'MALE',
      privacyPolicyAccepted: true,
      privacyPolicyVersion: '1.0',
      termsOfServiceAccepted: true,
      termsOfServiceVersion: '1.0'
    })
  });
  
  const data = await response.json();
  console.log(data);
}

// Login
async function login() {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'SecurePass123!'
    })
  });
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  
  console.log(data);
}

// Use token
async function protectedRequest() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:8080/api/protected-endpoint', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data);
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes
| Status | Meaning |
|--------|---------|
| 201 | Registration successful |
| 200 | Login successful |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (invalid credentials or missing token) |
| 403 | Forbidden (insufficient permissions) |
| 500 | Server error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Common Errors

**Duplicate Email:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Missing Token:**
```json
{
  "success": false,
  "status": 401,
  "message": "Unauthorized - Authentication required"
}
```

---

## 🔒 Security Features

1. **Password Hashing** - BCryptPasswordEncoder (strength: 10)
2. **JWT Signing** - HMAC-SHA256 with secret key
3. **Token Expiration** - Configurable access and refresh tokens
4. **CORS** - Configured for frontend communication
5. **Stateless Authentication** - No server-side sessions
6. **Role-Based Access** - Multiple roles per user
7. **Exception Handling** - Secure error messages
8. **SQL Injection Prevention** - Parameterized queries via JPA
9. **CSRF Protection** - Stateless, no form-based requests
10. **Audit Trail** - User tracking with timestamps

---

## 📁 Project Structure

```
BE/Movie Ticket Sales Web Project/
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
│   │   ├── User.java
│   │   ├── Role.java
│   │   ├── UserRole.java
│   │   ├── Membership.java
│   │   └── MembershipTier.java
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
├── src/main/resources/
│   ├── application.properties
│   ├── application-dev.properties
│   └── application-prod.properties
├── pom.xml
└── docs/
    ├── JWT_AUTHENTICATION_IMPLEMENTATION.md
    ├── AUTHENTICATION_FILES_SUMMARY.md
    ├── QUICK_START_GUIDE.md
    ├── database_authentication_setup.sql
    └── Authentication_API_Postman_Collection.json
```

---

## 🧪 Testing

### Using Postman
1. Import `Authentication_API_Postman_Collection.json`
2. Set `{{base_url}}` to `http://localhost:8080`
3. Run requests in order: Register → Login → Protected Endpoint

### Using cURL
See examples in [Usage Examples](#usage-examples) section

### Unit Testing
```java
@SpringBootTest
class AuthenticationServiceTest {
    @Autowired
    private AuthenticationService authService;
    
    @Test
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        // ... set other fields
        
        ApiResponse<RegisterResponse> response = authService.register(request);
        
        assertTrue(response.getSuccess());
        assertNotNull(response.getData().getUserId());
    }
}
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Database connection fails | Check MySQL is running, verify credentials |
| "Role not found" | Run database setup script |
| "Email already registered" | Use different email |
| Invalid token error | Ensure token hasn't expired |
| Port 8080 in use | Change port in application.properties |
| CORS error | Check SecurityConfig CORS settings |

---

## 📚 Documentation

- **Implementation Guide:** [JWT_AUTHENTICATION_IMPLEMENTATION.md](JWT_AUTHENTICATION_IMPLEMENTATION.md)
- **File Summary:** [AUTHENTICATION_FILES_SUMMARY.md](AUTHENTICATION_FILES_SUMMARY.md)
- **Quick Start:** [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
- **Database Setup:** [database_authentication_setup.sql](database_authentication_setup.sql)
- **Postman Collection:** [Authentication_API_Postman_Collection.json](Authentication_API_Postman_Collection.json)

---

## 📦 Dependencies

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>

<!-- Spring Boot -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

---

## 🎯 Future Enhancements

- [ ] Email verification endpoint
- [ ] Password reset functionality
- [ ] Refresh token endpoint
- [ ] OAuth2 integration
- [ ] Two-factor authentication
- [ ] Social login
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Account lockout after failed attempts

---

## 📝 License

This authentication system is part of the Movie Ticket Sales Web Project.

---

## 👥 Support

For issues or questions:
1. Check the documentation files
2. Review error messages in application logs
3. Verify database setup with provided SQL script
4. Check configuration in application.properties

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** October 2025
