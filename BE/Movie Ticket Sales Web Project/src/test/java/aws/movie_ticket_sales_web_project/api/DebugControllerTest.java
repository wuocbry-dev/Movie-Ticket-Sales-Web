package aws.movie_ticket_sales_web_project.api;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DebugController Unit Tests")
class DebugControllerTest {

    @InjectMocks
    private DebugController debugController;

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("whoami Tests")
    class WhoAmITests {

        @Test
        @DisplayName("Should return unauthenticated when no authentication")
        void shouldReturnUnauthenticatedWhenNoAuthentication() {
            // Arrange
            SecurityContextHolder.clearContext();

            // Act
            ResponseEntity<?> response = debugController.whoami();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).isNotNull();
            assertThat(body.get("authenticated")).isEqualTo(false);
            assertThat(body.get("message")).isEqualTo("No authentication found");
            assertThat(body).hasSize(2);
        }

        @Test
        @DisplayName("Should return authenticated user info with SYSTEM_ADMIN role")
        void shouldReturnAuthenticatedUserInfoWithSystemAdminRole() {
            // Arrange
            List<GrantedAuthority> authorities = Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_USER")
            );
            
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    "admin@example.com",
                    "password",
                    authorities
            );

            SecurityContext securityContext = mock(SecurityContext.class);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Act
            ResponseEntity<?> response = debugController.whoami();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).isNotNull();
            assertThat(body.get("authenticated")).isEqualTo(true);
            assertThat(body.get("username")).isEqualTo("admin@example.com");
            assertThat(body.get("principal")).isEqualTo("admin@example.com");
            
            @SuppressWarnings("unchecked")
            List<String> authList = (List<String>) body.get("authorities");
            assertThat(authList).containsExactlyInAnyOrder("ROLE_SYSTEM_ADMIN", "ROLE_USER");
            
            assertThat(body.get("hasSystemAdminRole")).isEqualTo(true);
            assertThat(body.get("hasSystemAdminWithoutRolePrefix")).isEqualTo(false);
        }

        @Test
        @DisplayName("Should return authenticated user info without ROLE prefix")
        void shouldReturnAuthenticatedUserInfoWithoutRolePrefix() {
            // Arrange
            List<GrantedAuthority> authorities = Arrays.asList(
                    new SimpleGrantedAuthority("SYSTEM_ADMIN"),
                    new SimpleGrantedAuthority("USER")
            );
            
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    "admin@example.com",
                    "password",
                    authorities
            );

            SecurityContext securityContext = mock(SecurityContext.class);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Act
            ResponseEntity<?> response = debugController.whoami();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).isNotNull();
            assertThat(body.get("authenticated")).isEqualTo(true);
            assertThat(body.get("username")).isEqualTo("admin@example.com");
            
            @SuppressWarnings("unchecked")
            List<String> authList = (List<String>) body.get("authorities");
            assertThat(authList).containsExactlyInAnyOrder("SYSTEM_ADMIN", "USER");
            
            assertThat(body.get("hasSystemAdminRole")).isEqualTo(false);
            assertThat(body.get("hasSystemAdminWithoutRolePrefix")).isEqualTo(true);
        }

        @Test
        @DisplayName("Should return authenticated regular user without admin role")
        void shouldReturnAuthenticatedRegularUserWithoutAdminRole() {
            // Arrange
            List<GrantedAuthority> authorities = Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_USER")
            );
            
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    "user@example.com",
                    "password",
                    authorities
            );

            SecurityContext securityContext = mock(SecurityContext.class);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Act
            ResponseEntity<?> response = debugController.whoami();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).isNotNull();
            assertThat(body.get("authenticated")).isEqualTo(true);
            assertThat(body.get("username")).isEqualTo("user@example.com");
            assertThat(body.get("principal")).isEqualTo("user@example.com");
            
            @SuppressWarnings("unchecked")
            List<String> authList = (List<String>) body.get("authorities");
            assertThat(authList).containsExactly("ROLE_USER");
            
            assertThat(body.get("hasSystemAdminRole")).isEqualTo(false);
            assertThat(body.get("hasSystemAdminWithoutRolePrefix")).isEqualTo(false);
        }

        @Test
        @DisplayName("Should return authenticated user with multiple roles")
        void shouldReturnAuthenticatedUserWithMultipleRoles() {
            // Arrange
            List<GrantedAuthority> authorities = Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_CHAIN_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_CINEMA_MANAGER"),
                    new SimpleGrantedAuthority("ROLE_USER")
            );
            
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    "manager@example.com",
                    "password",
                    authorities
            );

            SecurityContext securityContext = mock(SecurityContext.class);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Act
            ResponseEntity<?> response = debugController.whoami();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).isNotNull();
            assertThat(body.get("authenticated")).isEqualTo(true);
            assertThat(body.get("username")).isEqualTo("manager@example.com");
            
            @SuppressWarnings("unchecked")
            List<String> authList = (List<String>) body.get("authorities");
            assertThat(authList).hasSize(3);
            assertThat(authList).containsExactlyInAnyOrder(
                    "ROLE_CHAIN_ADMIN", 
                    "ROLE_CINEMA_MANAGER", 
                    "ROLE_USER"
            );
            
            assertThat(body.get("hasSystemAdminRole")).isEqualTo(false);
            assertThat(body.get("hasSystemAdminWithoutRolePrefix")).isEqualTo(false);
        }

        @Test
        @DisplayName("Should return authenticated user with no authorities")
        void shouldReturnAuthenticatedUserWithNoAuthorities() {
            // Arrange
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    "user@example.com",
                    "password",
                    Arrays.asList()
            );

            SecurityContext securityContext = mock(SecurityContext.class);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Act
            ResponseEntity<?> response = debugController.whoami();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).isNotNull();
            assertThat(body.get("authenticated")).isEqualTo(true);
            assertThat(body.get("username")).isEqualTo("user@example.com");
            
            @SuppressWarnings("unchecked")
            List<String> authList = (List<String>) body.get("authorities");
            assertThat(authList).isEmpty();
            
            assertThat(body.get("hasSystemAdminRole")).isEqualTo(false);
            assertThat(body.get("hasSystemAdminWithoutRolePrefix")).isEqualTo(false);
        }

        @Test
        @DisplayName("Should return info with both ROLE_SYSTEM_ADMIN and SYSTEM_ADMIN")
        void shouldReturnInfoWithBothSystemAdminFormats() {
            // Arrange
            List<GrantedAuthority> authorities = Arrays.asList(
                    new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"),
                    new SimpleGrantedAuthority("SYSTEM_ADMIN")
            );
            
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    "superadmin@example.com",
                    "password",
                    authorities
            );

            SecurityContext securityContext = mock(SecurityContext.class);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Act
            ResponseEntity<?> response = debugController.whoami();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body).isNotNull();
            
            @SuppressWarnings("unchecked")
            List<String> authList = (List<String>) body.get("authorities");
            assertThat(authList).containsExactlyInAnyOrder("ROLE_SYSTEM_ADMIN", "SYSTEM_ADMIN");
            
            assertThat(body.get("hasSystemAdminRole")).isEqualTo(true);
            assertThat(body.get("hasSystemAdminWithoutRolePrefix")).isEqualTo(true);
        }
    }
}
