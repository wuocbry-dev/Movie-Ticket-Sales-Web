package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.enums.Gender;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import aws.movie_ticket_sales_web_project.service.AuthenticationService;
import aws.movie_ticket_sales_web_project.service.RoleManagementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController Unit Tests")
class AuthControllerTest {

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private RoleManagementService roleManagementService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthController authController;

    private static final String VALID_TOKEN = "Bearer valid-jwt-token";
    private static final String INVALID_TOKEN = "Bearer invalid-jwt-token";
    private static final Integer USER_ID = 1;

    @BeforeEach
    void setUp() {
        lenient().when(jwtTokenProvider.getUserIdFromToken("valid-jwt-token"))
                .thenReturn(USER_ID);
        lenient().when(jwtTokenProvider.getUserIdFromToken("invalid-jwt-token"))
                .thenThrow(new RuntimeException("Invalid token"));
    }

    @Nested
    @DisplayName("register Tests")
    class RegisterTests {

        @Test
        @DisplayName("Should register new user successfully")
        void shouldRegisterNewUserSuccessfully() {
            // Given
            RegisterRequest request = createRegisterRequest(
                    "newuser@test.com",
                    "password123",
                    "New User"
            );

            RegisterResponse registerResponse = createRegisterResponse(
                    1,
                    "newuser@test.com",
                    "New User",
                    false,
                    "MEM001",
                    "Bronze"
            );

            ApiResponse<RegisterResponse> serviceResponse = ApiResponse.<RegisterResponse>builder()
                    .success(true)
                    .message("User registered successfully")
                    .data(registerResponse)
                    .build();

            when(authenticationService.register(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<RegisterResponse>> response = authController.register(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).isNotNull();
            assertThat(response.getBody().getData().getEmail()).isEqualTo("newuser@test.com");
            assertThat(response.getBody().getData().getFullName()).isEqualTo("New User");

            verify(authenticationService).register(request);
        }

        @Test
        @DisplayName("Should return bad request when email already exists")
        void shouldReturnBadRequestWhenEmailExists() {
            // Given
            RegisterRequest request = createRegisterRequest(
                    "existing@test.com",
                    "password123",
                    "Existing User"
            );

            ApiResponse<RegisterResponse> serviceResponse = ApiResponse.<RegisterResponse>builder()
                    .success(false)
                    .message("Email already exists")
                    .build();

            when(authenticationService.register(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<RegisterResponse>> response = authController.register(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Email already exists");

            verify(authenticationService).register(request);
        }

        @Test
        @DisplayName("Should return bad request for invalid email format")
        void shouldReturnBadRequestForInvalidEmail() {
            // Given
            RegisterRequest request = createRegisterRequest(
                    "invalid-email",
                    "password123",
                    "Test User"
            );

            ApiResponse<RegisterResponse> serviceResponse = ApiResponse.<RegisterResponse>builder()
                    .success(false)
                    .message("Invalid email format")
                    .build();

            when(authenticationService.register(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<RegisterResponse>> response = authController.register(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();

            verify(authenticationService).register(request);
        }

        @Test
        @DisplayName("Should return bad request for weak password")
        void shouldReturnBadRequestForWeakPassword() {
            // Given
            RegisterRequest request = createRegisterRequest(
                    "user@test.com",
                    "123",
                    "Test User"
            );

            ApiResponse<RegisterResponse> serviceResponse = ApiResponse.<RegisterResponse>builder()
                    .success(false)
                    .message("Password must be at least 6 characters long")
                    .build();

            when(authenticationService.register(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<RegisterResponse>> response = authController.register(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Password");

            verify(authenticationService).register(request);
        }

        @Test
        @DisplayName("Should register user with all optional fields")
        void shouldRegisterUserWithAllOptionalFields() {
            // Given
            RegisterRequest request = new RegisterRequest();
            request.setEmail("complete@test.com");
            request.setPassword("password123");
            request.setFullName("Complete User");
            request.setPhoneNumber("+1234567890");
            request.setDateOfBirth(LocalDate.of(1990, 1, 1));
            request.setGender(Gender.MALE);
            request.setPrivacyPolicyAccepted(true);
            request.setPrivacyPolicyVersion("1.0");
            request.setTermsOfServiceAccepted(true);
            request.setTermsOfServiceVersion("1.0");

            RegisterResponse registerResponse = createRegisterResponse(
                    1,
                    "complete@test.com",
                    "Complete User",
                    false,
                    "MEM001",
                    "Bronze"
            );

            ApiResponse<RegisterResponse> serviceResponse = ApiResponse.<RegisterResponse>builder()
                    .success(true)
                    .message("User registered successfully")
                    .data(registerResponse)
                    .build();

            when(authenticationService.register(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<RegisterResponse>> response = authController.register(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();

            verify(authenticationService).register(request);
        }
    }

    @Nested
    @DisplayName("login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login user successfully with valid credentials")
        void shouldLoginUserSuccessfully() {
            // Given
            LoginRequest request = new LoginRequest("user@test.com", "password123");

            UserInfo userInfo = createUserInfo(1, "user@test.com", "Test User");
            LoginResponse loginResponse = createLoginResponse(
                    "access-token-123",
                    "refresh-token-456",
                    3600L,
                    userInfo
            );

            ApiResponse<LoginResponse> serviceResponse = ApiResponse.<LoginResponse>builder()
                    .success(true)
                    .message("Login successful")
                    .data(loginResponse)
                    .build();

            when(authenticationService.login(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<LoginResponse>> response = authController.login(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).isNotNull();
            assertThat(response.getBody().getData().getAccessToken()).isEqualTo("access-token-123");
            assertThat(response.getBody().getData().getRefreshToken()).isEqualTo("refresh-token-456");
            assertThat(response.getBody().getData().getUser()).isNotNull();
            assertThat(response.getBody().getData().getUser().getEmail()).isEqualTo("user@test.com");

            verify(authenticationService).login(request);
        }

        @Test
        @DisplayName("Should return unauthorized for invalid credentials")
        void shouldReturnUnauthorizedForInvalidCredentials() {
            // Given
            LoginRequest request = new LoginRequest("user@test.com", "wrongpassword");

            ApiResponse<LoginResponse> serviceResponse = ApiResponse.<LoginResponse>builder()
                    .success(false)
                    .message("Invalid email or password")
                    .build();

            when(authenticationService.login(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<LoginResponse>> response = authController.login(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Invalid");

            verify(authenticationService).login(request);
        }

        @Test
        @DisplayName("Should return unauthorized for non-existent user")
        void shouldReturnUnauthorizedForNonExistentUser() {
            // Given
            LoginRequest request = new LoginRequest("nonexistent@test.com", "password123");

            ApiResponse<LoginResponse> serviceResponse = ApiResponse.<LoginResponse>builder()
                    .success(false)
                    .message("User not found")
                    .build();

            when(authenticationService.login(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<LoginResponse>> response = authController.login(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();

            verify(authenticationService).login(request);
        }

        @Test
        @DisplayName("Should return unauthorized for inactive user account")
        void shouldReturnUnauthorizedForInactiveAccount() {
            // Given
            LoginRequest request = new LoginRequest("inactive@test.com", "password123");

            ApiResponse<LoginResponse> serviceResponse = ApiResponse.<LoginResponse>builder()
                    .success(false)
                    .message("Account is inactive")
                    .build();

            when(authenticationService.login(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<LoginResponse>> response = authController.login(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("inactive");

            verify(authenticationService).login(request);
        }

        @Test
        @DisplayName("Should login admin user and return admin role")
        void shouldLoginAdminUser() {
            // Given
            LoginRequest request = new LoginRequest("admin@test.com", "adminpass");

            UserInfo userInfo = UserInfo.builder()
                    .userId(1)
                    .email("admin@test.com")
                    .fullName("Admin User")
                    .roles(Arrays.asList("ROLE_ADMIN", "ROLE_USER"))
                    .isActive(true)
                    .build();

            LoginResponse loginResponse = createLoginResponse(
                    "admin-access-token",
                    "admin-refresh-token",
                    3600L,
                    userInfo
            );

            ApiResponse<LoginResponse> serviceResponse = ApiResponse.<LoginResponse>builder()
                    .success(true)
                    .message("Login successful")
                    .data(loginResponse)
                    .build();

            when(authenticationService.login(request)).thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<LoginResponse>> response = authController.login(request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getUser().getRoles()).contains("ROLE_ADMIN");

            verify(authenticationService).login(request);
        }
    }

    @Nested
    @DisplayName("checkAdmin Tests")
    class CheckAdminTests {

        @Test
        @DisplayName("Should return true for admin user")
        void shouldReturnTrueForAdminUser() {
            // Given
            when(roleManagementService.isUserAdmin(USER_ID)).thenReturn(true);

            // When
            ResponseEntity<ApiResponse<Boolean>> response = authController.checkAdmin(VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).isTrue();
            assertThat(response.getBody().getMessage()).contains("Admin check completed");

            verify(jwtTokenProvider).getUserIdFromToken("valid-jwt-token");
            verify(roleManagementService).isUserAdmin(USER_ID);
        }

        @Test
        @DisplayName("Should return false for non-admin user")
        void shouldReturnFalseForNonAdminUser() {
            // Given
            when(roleManagementService.isUserAdmin(USER_ID)).thenReturn(false);

            // When
            ResponseEntity<ApiResponse<Boolean>> response = authController.checkAdmin(VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).isFalse();

            verify(jwtTokenProvider).getUserIdFromToken("valid-jwt-token");
            verify(roleManagementService).isUserAdmin(USER_ID);
        }

        @Test
        @DisplayName("Should return unauthorized for invalid token")
        void shouldReturnUnauthorizedForInvalidToken() {
            // When
            ResponseEntity<ApiResponse<Boolean>> response = authController.checkAdmin(INVALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Invalid or expired token");

            verify(jwtTokenProvider).getUserIdFromToken("invalid-jwt-token");
            verifyNoInteractions(roleManagementService);
        }

        @Test
        @DisplayName("Should return unauthorized when token returns null userId")
        void shouldReturnUnauthorizedWhenUserIdIsNull() {
            // Given
            when(jwtTokenProvider.getUserIdFromToken("null-user-token")).thenReturn(null);

            // When
            ResponseEntity<ApiResponse<Boolean>> response = authController.checkAdmin("Bearer null-user-token");

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Invalid token");

            verify(jwtTokenProvider).getUserIdFromToken("null-user-token");
            verifyNoInteractions(roleManagementService);
        }

        @Test
        @DisplayName("Should handle token without Bearer prefix")
        void shouldHandleTokenWithoutBearerPrefix() {
            // Given
            when(jwtTokenProvider.getUserIdFromToken("token-without-bearer")).thenReturn(USER_ID);
            when(roleManagementService.isUserAdmin(USER_ID)).thenReturn(true);

            // When
            ResponseEntity<ApiResponse<Boolean>> response = authController.checkAdmin("Bearer token-without-bearer");

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();

            verify(jwtTokenProvider).getUserIdFromToken("token-without-bearer");
            verify(roleManagementService).isUserAdmin(USER_ID);
        }

        @Test
        @DisplayName("Should handle exception from roleManagementService")
        void shouldHandleExceptionFromRoleManagementService() {
            // Given
            when(roleManagementService.isUserAdmin(USER_ID))
                    .thenThrow(new RuntimeException("Database error"));

            // When
            ResponseEntity<ApiResponse<Boolean>> response = authController.checkAdmin(VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Invalid or expired token");

            verify(jwtTokenProvider).getUserIdFromToken("valid-jwt-token");
            verify(roleManagementService).isUserAdmin(USER_ID);
        }
    }

    // Helper methods
    private RegisterRequest createRegisterRequest(String email, String password, String fullName) {
        RegisterRequest request = new RegisterRequest();
        request.setEmail(email);
        request.setPassword(password);
        request.setFullName(fullName);
        request.setPhoneNumber("+1234567890");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));
        request.setGender(Gender.MALE);
        request.setPrivacyPolicyAccepted(true);
        request.setPrivacyPolicyVersion("1.0");
        request.setTermsOfServiceAccepted(true);
        request.setTermsOfServiceVersion("1.0");
        return request;
    }

    private RegisterResponse createRegisterResponse(
            Integer userId,
            String email,
            String fullName,
            Boolean isEmailVerified,
            String membershipNumber,
            String tierName
    ) {
        RegisterResponse response = new RegisterResponse();
        response.setUserId(userId);
        response.setEmail(email);
        response.setFullName(fullName);
        response.setIsEmailVerified(isEmailVerified);
        response.setMembershipNumber(membershipNumber);
        response.setTierName(tierName);
        response.setRoles(Arrays.asList("ROLE_USER"));
        return response;
    }

    private UserInfo createUserInfo(Integer id, String email, String fullName) {
        return UserInfo.builder()
                .userId(id)
                .email(email)
                .fullName(fullName)
                .roles(Arrays.asList("ROLE_USER"))
                .isActive(true)
                .build();
    }

    private LoginResponse createLoginResponse(
            String accessToken,
            String refreshToken,
            Long expiresIn,
            UserInfo user
    ) {
        LoginResponse response = new LoginResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(expiresIn);
        response.setUser(user);
        return response;
    }
}
