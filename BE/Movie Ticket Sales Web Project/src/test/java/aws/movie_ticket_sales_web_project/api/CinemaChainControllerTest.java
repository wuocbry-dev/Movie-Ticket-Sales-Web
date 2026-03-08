package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import aws.movie_ticket_sales_web_project.service.CinemaChainService;
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

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CinemaChainController Unit Tests")
class CinemaChainControllerTest {

    @Mock
    private CinemaChainService cinemaChainService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private CinemaChainController cinemaChainController;

    private static final String VALID_TOKEN = "Bearer valid.jwt.token";
    private static final String INVALID_TOKEN = "Bearer invalid.jwt.token";
    private static final Integer USER_ID = 1;

    @BeforeEach
    void setUp() {
        lenient().when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
        lenient().when(jwtTokenProvider.getUserIdFromToken("invalid.jwt.token")).thenThrow(new RuntimeException("Invalid token"));
    }

    private CinemaChainDto createTestCinemaChainDto() {
        return CinemaChainDto.builder()
                .chainId(1)
                .chainName("Test Cinema Chain")
                .logoUrl("https://example.com/logo.png")
                .website("https://example.com")
                .description("Test Description")
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private PagedCinemaChainResponse createTestPagedResponse() {
        List<CinemaChainDto> chains = Arrays.asList(createTestCinemaChainDto());
        return PagedCinemaChainResponse.builder()
                .data(chains)
                .totalElements(1L)
                .totalPages(1)
                .currentPage(0)
                .pageSize(10)
                .build();
    }

    @Nested
    @DisplayName("getAllPublicCinemaChains Tests")
    class GetAllPublicCinemaChainsTests {

        @Test
        @DisplayName("Should return all public cinema chains successfully")
        void shouldReturnAllPublicCinemaChainsSuccessfully() {
            // Arrange
            PagedCinemaChainResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaChainResponse> expectedResponse = ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(true)
                    .message("Cinema chains retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaChainService.getAllCinemaChains(0, 10, null, null)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaChainResponse>> response = 
                    cinemaChainController.getAllPublicCinemaChains(0, 10, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getTotalElements()).isEqualTo(1L);
            verify(cinemaChainService).getAllCinemaChains(0, 10, null, null);
        }

        @Test
        @DisplayName("Should return cinema chains with search parameter")
        void shouldReturnCinemaChainsWithSearchParameter() {
            // Arrange
            PagedCinemaChainResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaChainResponse> expectedResponse = ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(true)
                    .message("Cinema chains retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaChainService.getAllCinemaChains(0, 10, "Test", null)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaChainResponse>> response = 
                    cinemaChainController.getAllPublicCinemaChains(0, 10, "Test");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaChainService).getAllCinemaChains(0, 10, "Test", null);
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when service fails")
        void shouldReturnBadRequestWhenServiceFails() {
            // Arrange
            ApiResponse<PagedCinemaChainResponse> expectedResponse = ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(false)
                    .message("Error retrieving cinema chains")
                    .build();

            when(cinemaChainService.getAllCinemaChains(0, 10, null, null)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaChainResponse>> response = 
                    cinemaChainController.getAllPublicCinemaChains(0, 10, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("getCinemaChainById Tests")
    class GetCinemaChainByIdTests {

        @Test
        @DisplayName("Should return cinema chain by ID successfully")
        void shouldReturnCinemaChainByIdSuccessfully() {
            // Arrange
            CinemaChainDto chainDto = createTestCinemaChainDto();
            ApiResponse<CinemaChainDto> expectedResponse = ApiResponse.<CinemaChainDto>builder()
                    .success(true)
                    .message("Cinema chain found")
                    .data(chainDto)
                    .build();

            when(cinemaChainService.getCinemaChainById(1)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaChainDto>> response = 
                    cinemaChainController.getCinemaChainById(1);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getChainId()).isEqualTo(1);
            verify(cinemaChainService).getCinemaChainById(1);
        }

        @Test
        @DisplayName("Should return NOT_FOUND when cinema chain doesn't exist")
        void shouldReturnNotFoundWhenCinemaChainDoesNotExist() {
            // Arrange
            ApiResponse<CinemaChainDto> expectedResponse = ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Cinema chain not found")
                    .build();

            when(cinemaChainService.getCinemaChainById(999)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaChainDto>> response = 
                    cinemaChainController.getCinemaChainById(999);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("getAllCinemaChainsByAdmin Tests")
    class GetAllCinemaChainsByAdminTests {

        @Test
        @DisplayName("Should return all cinema chains for admin successfully")
        void shouldReturnAllCinemaChainsForAdminSuccessfully() {
            // Arrange
            PagedCinemaChainResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaChainResponse> expectedResponse = ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(true)
                    .message("Cinema chains retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaChainService.getAllCinemaChainsByAdmin(0, 10, null, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaChainResponse>> response = 
                    cinemaChainController.getAllCinemaChainsByAdmin(0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaChainService).getAllCinemaChainsByAdmin(0, 10, null, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<PagedCinemaChainResponse>> response = 
                    cinemaChainController.getAllCinemaChainsByAdmin(0, 10, null, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).isEqualTo("Invalid or expired token");
            verify(cinemaChainService, never()).getAllCinemaChainsByAdmin(anyInt(), anyInt(), any(), anyInt());
        }

        @Test
        @DisplayName("Should return FORBIDDEN when user is not admin")
        void shouldReturnForbiddenWhenUserIsNotAdmin() {
            // Arrange
            ApiResponse<PagedCinemaChainResponse> expectedResponse = ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(false)
                    .message("Access denied")
                    .build();

            when(cinemaChainService.getAllCinemaChainsByAdmin(0, 10, null, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaChainResponse>> response = 
                    cinemaChainController.getAllCinemaChainsByAdmin(0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("createCinemaChain Tests")
    class CreateCinemaChainTests {

        @Test
        @DisplayName("Should create cinema chain successfully")
        void shouldCreateCinemaChainSuccessfully() {
            // Arrange
            CreateCinemaChainRequest request = CreateCinemaChainRequest.builder()
                    .chainName("New Cinema Chain")
                    .logoUrl("https://example.com/new-logo.png")
                    .website("https://newchain.com")
                    .description("New Description")
                    .build();

            CinemaChainDto createdChain = createTestCinemaChainDto();
            ApiResponse<CinemaChainDto> expectedResponse = ApiResponse.<CinemaChainDto>builder()
                    .success(true)
                    .message("Cinema chain created successfully")
                    .data(createdChain)
                    .build();

            when(cinemaChainService.createCinemaChain(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaChainDto>> response = 
                    cinemaChainController.createCinemaChain(request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaChainService).createCinemaChain(request, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Arrange
            CreateCinemaChainRequest request = CreateCinemaChainRequest.builder()
                    .chainName("New Cinema Chain")
                    .build();

            // Act
            ResponseEntity<ApiResponse<CinemaChainDto>> response = 
                    cinemaChainController.createCinemaChain(request, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaChainService, never()).createCinemaChain(any(), anyInt());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when creation fails")
        void shouldReturnBadRequestWhenCreationFails() {
            // Arrange
            CreateCinemaChainRequest request = CreateCinemaChainRequest.builder()
                    .chainName("Duplicate Chain")
                    .build();

            ApiResponse<CinemaChainDto> expectedResponse = ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Cinema chain already exists")
                    .build();

            when(cinemaChainService.createCinemaChain(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaChainDto>> response = 
                    cinemaChainController.createCinemaChain(request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("updateCinemaChain Tests")
    class UpdateCinemaChainTests {

        @Test
        @DisplayName("Should update cinema chain successfully")
        void shouldUpdateCinemaChainSuccessfully() {
            // Arrange
            UpdateCinemaChainRequest request = UpdateCinemaChainRequest.builder()
                    .chainName("Updated Cinema Chain")
                    .logoUrl("https://example.com/updated-logo.png")
                    .website("https://updatedchain.com")
                    .description("Updated Description")
                    .isActive(true)
                    .build();

            CinemaChainDto updatedChain = createTestCinemaChainDto();
            ApiResponse<CinemaChainDto> expectedResponse = ApiResponse.<CinemaChainDto>builder()
                    .success(true)
                    .message("Cinema chain updated successfully")
                    .data(updatedChain)
                    .build();

            when(cinemaChainService.updateCinemaChain(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaChainDto>> response = 
                    cinemaChainController.updateCinemaChain(1, request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(request.getChainId()).isEqualTo(1); // Verify chainId was set
            verify(cinemaChainService).updateCinemaChain(request, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Arrange
            UpdateCinemaChainRequest request = UpdateCinemaChainRequest.builder()
                    .chainName("Updated Chain")
                    .build();

            // Act
            ResponseEntity<ApiResponse<CinemaChainDto>> response = 
                    cinemaChainController.updateCinemaChain(1, request, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaChainService, never()).updateCinemaChain(any(), anyInt());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when update fails")
        void shouldReturnBadRequestWhenUpdateFails() {
            // Arrange
            UpdateCinemaChainRequest request = UpdateCinemaChainRequest.builder()
                    .chainName("Updated Chain")
                    .build();

            ApiResponse<CinemaChainDto> expectedResponse = ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Cinema chain not found")
                    .build();

            when(cinemaChainService.updateCinemaChain(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaChainDto>> response = 
                    cinemaChainController.updateCinemaChain(1, request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }

        @Test
        @DisplayName("Should set chainId from path variable")
        void shouldSetChainIdFromPathVariable() {
            // Arrange
            UpdateCinemaChainRequest request = UpdateCinemaChainRequest.builder()
                    .chainName("Updated Chain")
                    .build();

            ApiResponse<CinemaChainDto> expectedResponse = ApiResponse.<CinemaChainDto>builder()
                    .success(true)
                    .message("Updated")
                    .data(createTestCinemaChainDto())
                    .build();

            when(cinemaChainService.updateCinemaChain(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            cinemaChainController.updateCinemaChain(5, request, VALID_TOKEN);

            // Assert
            assertThat(request.getChainId()).isEqualTo(5);
        }
    }

    @Nested
    @DisplayName("deleteCinemaChain Tests")
    class DeleteCinemaChainTests {

        @Test
        @DisplayName("Should delete cinema chain successfully (soft delete)")
        void shouldDeleteCinemaChainSuccessfully() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(true)
                    .message("Cinema chain deleted successfully")
                    .build();

            when(cinemaChainService.deleteCinemaChain(1, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaChainController.deleteCinemaChain(1, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaChainService).deleteCinemaChain(1, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaChainController.deleteCinemaChain(1, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaChainService, never()).deleteCinemaChain(anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when deletion fails")
        void shouldReturnBadRequestWhenDeletionFails() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(false)
                    .message("Cinema chain not found")
                    .build();

            when(cinemaChainService.deleteCinemaChain(999, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaChainController.deleteCinemaChain(999, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("permanentlyDeleteCinemaChain Tests")
    class PermanentlyDeleteCinemaChainTests {

        @Test
        @DisplayName("Should permanently delete cinema chain successfully")
        void shouldPermanentlyDeleteCinemaChainSuccessfully() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(true)
                    .message("Cinema chain permanently deleted")
                    .build();

            when(cinemaChainService.permanentlyDeleteCinemaChain(1, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaChainController.permanentlyDeleteCinemaChain(1, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaChainService).permanentlyDeleteCinemaChain(1, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaChainController.permanentlyDeleteCinemaChain(1, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaChainService, never()).permanentlyDeleteCinemaChain(anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when permanent deletion fails")
        void shouldReturnBadRequestWhenPermanentDeletionFails() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(false)
                    .message("Cinema chain not found")
                    .build();

            when(cinemaChainService.permanentlyDeleteCinemaChain(999, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaChainController.permanentlyDeleteCinemaChain(999, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }
}
