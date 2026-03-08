package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.Role;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
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

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminController Unit Tests")
class AdminControllerTest {

    @Mock
    private RoleManagementService roleManagementService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AdminController adminController;

    private static final String VALID_TOKEN = "Bearer valid-jwt-token";
    private static final String INVALID_TOKEN = "Bearer invalid-jwt-token";
    private static final Integer ADMIN_USER_ID = 1;
    private static final Integer TARGET_USER_ID = 2;

    @BeforeEach
    void setUp() {
        // Setup common mock behavior with lenient to avoid unnecessary stubbing errors
        lenient().when(jwtTokenProvider.getUserIdFromToken("valid-jwt-token"))
                .thenReturn(ADMIN_USER_ID);
        lenient().when(jwtTokenProvider.getUserIdFromToken("invalid-jwt-token"))
                .thenThrow(new RuntimeException("Invalid token"));
    }

    @Nested
    @DisplayName("getAllUsers Tests")
    class GetAllUsersTests {

        @Test
        @DisplayName("Should return all users when admin makes valid request")
        void shouldReturnAllUsersForValidAdmin() {
            // Given
            UserInfo user1 = createUserInfo(1, "admin@test.com", "Admin User");
            UserInfo user2 = createUserInfo(2, "user@test.com", "Regular User");
            List<UserInfo> users = Arrays.asList(user1, user2);

            ApiResponse<List<UserInfo>> serviceResponse = ApiResponse.<List<UserInfo>>builder()
                    .success(true)
                    .message("Users retrieved successfully")
                    .data(users)
                    .build();

            when(roleManagementService.getAllUsersWithRoles(ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<List<UserInfo>>> response = 
                    adminController.getAllUsers(VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).hasSize(2);
            assertThat(response.getBody().getData()).containsExactly(user1, user2);

            verify(jwtTokenProvider).getUserIdFromToken("valid-jwt-token");
            verify(roleManagementService).getAllUsersWithRoles(ADMIN_USER_ID);
        }

        @Test
        @DisplayName("Should return forbidden when user is not admin")
        void shouldReturnForbiddenForNonAdmin() {
            // Given
            ApiResponse<List<UserInfo>> serviceResponse = ApiResponse.<List<UserInfo>>builder()
                    .success(false)
                    .message("Access denied. Admin privileges required.")
                    .build();

            when(roleManagementService.getAllUsersWithRoles(ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<List<UserInfo>>> response = 
                    adminController.getAllUsers(VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Admin privileges required");

            verify(roleManagementService).getAllUsersWithRoles(ADMIN_USER_ID);
        }

        @Test
        @DisplayName("Should return unauthorized for invalid token")
        void shouldReturnUnauthorizedForInvalidToken() {
            // When
            ResponseEntity<ApiResponse<List<UserInfo>>> response = 
                    adminController.getAllUsers(INVALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Invalid or expired token");

            verify(jwtTokenProvider).getUserIdFromToken("invalid-jwt-token");
            verifyNoInteractions(roleManagementService);
        }
    }

    @Nested
    @DisplayName("updateUserRole Tests")
    class UpdateUserRoleTests {

        @Test
        @DisplayName("Should update user role successfully")
        void shouldUpdateUserRoleSuccessfully() {
            // Given
            UpdateUserRoleRequest request = new UpdateUserRoleRequest(TARGET_USER_ID, "MANAGER");
            UserInfo updatedUser = createUserInfo(TARGET_USER_ID, "user@test.com", "User Name");

            ApiResponse<UserInfo> serviceResponse = ApiResponse.<UserInfo>builder()
                    .success(true)
                    .message("User role updated successfully")
                    .data(updatedUser)
                    .build();

            when(roleManagementService.updateUserRole(request, ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<UserInfo>> response = 
                    adminController.updateUserRole(request, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).isEqualTo(updatedUser);

            verify(roleManagementService).updateUserRole(request, ADMIN_USER_ID);
        }

        @Test
        @DisplayName("Should return forbidden when admin tries to update their own role")
        void shouldReturnForbiddenForSelfUpdate() {
            // Given
            UpdateUserRoleRequest request = new UpdateUserRoleRequest(ADMIN_USER_ID, "USER");

            ApiResponse<UserInfo> serviceResponse = ApiResponse.<UserInfo>builder()
                    .success(false)
                    .message("Cannot modify your own role")
                    .build();

            when(roleManagementService.updateUserRole(request, ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<UserInfo>> response = 
                    adminController.updateUserRole(request, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }

        @Test
        @DisplayName("Should return unauthorized for invalid token")
        void shouldReturnUnauthorizedForInvalidToken() {
            // Given
            UpdateUserRoleRequest request = new UpdateUserRoleRequest(TARGET_USER_ID, "MANAGER");

            // When
            ResponseEntity<ApiResponse<UserInfo>> response = 
                    adminController.updateUserRole(request, INVALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();

            verifyNoInteractions(roleManagementService);
        }
    }

    @Nested
    @DisplayName("getAllRoles Tests")
    class GetAllRolesTests {

        @Test
        @DisplayName("Should return all roles successfully")
        void shouldReturnAllRolesSuccessfully() {
            // Given
            Role role1 = createRole(1, "ADMIN", "Administrator");
            Role role2 = createRole(2, "USER", "Regular User");
            List<Role> roles = Arrays.asList(role1, role2);

            ApiResponse<List<Role>> serviceResponse = ApiResponse.<List<Role>>builder()
                    .success(true)
                    .message("Roles retrieved successfully")
                    .data(roles)
                    .build();

            when(roleManagementService.getAllRoles(ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<List<Role>>> response = 
                    adminController.getAllRoles(VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).hasSize(2);

            verify(roleManagementService).getAllRoles(ADMIN_USER_ID);
        }

        @Test
        @DisplayName("Should return unauthorized for invalid token")
        void shouldReturnUnauthorizedForInvalidToken() {
            // When
            ResponseEntity<ApiResponse<List<Role>>> response = 
                    adminController.getAllRoles(INVALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();

            verifyNoInteractions(roleManagementService);
        }
    }

    @Nested
    @DisplayName("addRole Tests")
    class AddRoleTests {

        @Test
        @DisplayName("Should create new role successfully")
        void shouldCreateNewRoleSuccessfully() {
            // Given
            AddRoleRequest request = new AddRoleRequest("MANAGER", "Cinema Manager");
            Role newRole = createRole(3, "MANAGER", "Cinema Manager");

            ApiResponse<Role> serviceResponse = ApiResponse.<Role>builder()
                    .success(true)
                    .message("Role created successfully")
                    .data(newRole)
                    .build();

            when(roleManagementService.addRole("MANAGER", "Cinema Manager", ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<Role>> response = 
                    adminController.addRole(request, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).isEqualTo(newRole);

            verify(roleManagementService).addRole("MANAGER", "Cinema Manager", ADMIN_USER_ID);
        }

        @Test
        @DisplayName("Should return forbidden when role already exists")
        void shouldReturnForbiddenWhenRoleExists() {
            // Given
            AddRoleRequest request = new AddRoleRequest("ADMIN", "Administrator");

            ApiResponse<Role> serviceResponse = ApiResponse.<Role>builder()
                    .success(false)
                    .message("Role already exists")
                    .build();

            when(roleManagementService.addRole("ADMIN", "Administrator", ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<Role>> response = 
                    adminController.addRole(request, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }

        @Test
        @DisplayName("Should return unauthorized for invalid token")
        void shouldReturnUnauthorizedForInvalidToken() {
            // Given
            AddRoleRequest request = new AddRoleRequest("MANAGER", "Cinema Manager");

            // When
            ResponseEntity<ApiResponse<Role>> response = 
                    adminController.addRole(request, INVALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();

            verifyNoInteractions(roleManagementService);
        }
    }

    @Nested
    @DisplayName("getUsersByRole Tests")
    class GetUsersByRoleTests {

        @Test
        @DisplayName("Should return users with specified role")
        void shouldReturnUsersWithSpecifiedRole() {
            // Given
            String roleName = "MANAGER";
            UserInfo user1 = createUserInfo(2, "manager1@test.com", "Manager One");
            UserInfo user2 = createUserInfo(3, "manager2@test.com", "Manager Two");
            List<UserInfo> users = Arrays.asList(user1, user2);

            ApiResponse<List<UserInfo>> serviceResponse = ApiResponse.<List<UserInfo>>builder()
                    .success(true)
                    .message("Users retrieved successfully")
                    .data(users)
                    .build();

            when(roleManagementService.getUsersByRole(roleName, ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<List<UserInfo>>> response = 
                    adminController.getUsersByRole(roleName, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).hasSize(2);

            verify(roleManagementService).getUsersByRole(roleName, ADMIN_USER_ID);
        }

        @Test
        @DisplayName("Should return empty list when no users have the role")
        void shouldReturnEmptyListWhenNoUsersHaveRole() {
            // Given
            String roleName = "NONEXISTENT";

            ApiResponse<List<UserInfo>> serviceResponse = ApiResponse.<List<UserInfo>>builder()
                    .success(true)
                    .message("No users found with this role")
                    .data(List.of())
                    .build();

            when(roleManagementService.getUsersByRole(roleName, ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<List<UserInfo>>> response = 
                    adminController.getUsersByRole(roleName, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData()).isEmpty();
        }

        @Test
        @DisplayName("Should handle service exception gracefully")
        void shouldHandleServiceException() {
            // Given
            String roleName = "MANAGER";
            when(roleManagementService.getUsersByRole(roleName, ADMIN_USER_ID))
                    .thenThrow(new RuntimeException("Database error"));

            // When
            ResponseEntity<ApiResponse<List<UserInfo>>> response = 
                    adminController.getUsersByRole(roleName, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Error:");
        }
    }

    @Nested
    @DisplayName("deleteUser Tests")
    class DeleteUserTests {

        @Test
        @DisplayName("Should delete user successfully")
        void shouldDeleteUserSuccessfully() {
            // Given
            ApiResponse<String> serviceResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("User deleted successfully")
                    .data("User account has been deleted")
                    .build();

            when(roleManagementService.deleteUser(TARGET_USER_ID, ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<String>> response = 
                    adminController.deleteUser(TARGET_USER_ID, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();

            verify(roleManagementService).deleteUser(TARGET_USER_ID, ADMIN_USER_ID);
        }

        @Test
        @DisplayName("Should return unauthorized when token is missing")
        void shouldReturnUnauthorizedWhenTokenMissing() {
            // When
            ResponseEntity<ApiResponse<String>> response = 
                    adminController.deleteUser(TARGET_USER_ID, null);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("No authorization token provided");

            verifyNoInteractions(roleManagementService);
        }

        @Test
        @DisplayName("Should return unauthorized when token is empty")
        void shouldReturnUnauthorizedWhenTokenEmpty() {
            // When
            ResponseEntity<ApiResponse<String>> response = 
                    adminController.deleteUser(TARGET_USER_ID, "");

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();

            verifyNoInteractions(roleManagementService);
        }

        @Test
        @DisplayName("Should return forbidden when trying to delete own account")
        void shouldReturnForbiddenForSelfDeletion() {
            // Given
            ApiResponse<String> serviceResponse = ApiResponse.<String>builder()
                    .success(false)
                    .message("Cannot delete your own account")
                    .build();

            when(roleManagementService.deleteUser(ADMIN_USER_ID, ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<String>> response = 
                    adminController.deleteUser(ADMIN_USER_ID, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }

        @Test
        @DisplayName("Should handle service exception gracefully")
        void shouldHandleServiceException() {
            // Given
            when(roleManagementService.deleteUser(TARGET_USER_ID, ADMIN_USER_ID))
                    .thenThrow(new RuntimeException("Database error"));

            // When
            ResponseEntity<ApiResponse<String>> response = 
                    adminController.deleteUser(TARGET_USER_ID, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Error:");
        }
    }

    @Nested
    @DisplayName("activateUser Tests")
    class ActivateUserTests {

        @Test
        @DisplayName("Should activate user successfully")
        void shouldActivateUserSuccessfully() {
            // Given
            ApiResponse<String> serviceResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("User activated successfully")
                    .data("User account has been activated")
                    .build();

            when(roleManagementService.activateUser(TARGET_USER_ID, ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<String>> response = 
                    adminController.activateUser(TARGET_USER_ID, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();

            verify(roleManagementService).activateUser(TARGET_USER_ID, ADMIN_USER_ID);
        }

        @Test
        @DisplayName("Should return forbidden when user is not admin")
        void shouldReturnForbiddenForNonAdmin() {
            // Given
            ApiResponse<String> serviceResponse = ApiResponse.<String>builder()
                    .success(false)
                    .message("Access denied. Admin privileges required.")
                    .build();

            when(roleManagementService.activateUser(TARGET_USER_ID, ADMIN_USER_ID))
                    .thenReturn(serviceResponse);

            // When
            ResponseEntity<ApiResponse<String>> response = 
                    adminController.activateUser(TARGET_USER_ID, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }

        @Test
        @DisplayName("Should handle service exception gracefully")
        void shouldHandleServiceException() {
            // Given
            when(roleManagementService.activateUser(TARGET_USER_ID, ADMIN_USER_ID))
                    .thenThrow(new RuntimeException("Database error"));

            // When
            ResponseEntity<ApiResponse<String>> response = 
                    adminController.activateUser(TARGET_USER_ID, VALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Error:");
        }

        @Test
        @DisplayName("Should return unauthorized for invalid token")
        void shouldReturnUnauthorizedForInvalidToken() {
            // When
            ResponseEntity<ApiResponse<String>> response = 
                    adminController.activateUser(TARGET_USER_ID, INVALID_TOKEN);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();

            verifyNoInteractions(roleManagementService);
        }
    }

    // Helper methods
    private UserInfo createUserInfo(Integer id, String email, String fullName) {
        return UserInfo.builder()
                .userId(id)
                .email(email)
                .fullName(fullName)
                .isActive(true)
                .build();
    }

    private Role createRole(Integer id, String roleName, String description) {
        Role role = new Role();
        role.setId(id);
        role.setRoleName(roleName);
        role.setDescription(description);
        return role;
    }
}
