package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import aws.movie_ticket_sales_web_project.service.CinemaService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CinemaController Unit Tests")
class CinemaControllerTest {

    @Mock
    private CinemaService cinemaService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private CinemaController cinemaController;

    private static final String VALID_TOKEN = "Bearer valid.jwt.token";
    private static final String INVALID_TOKEN = "Bearer invalid.jwt.token";
    private static final Integer USER_ID = 1;
    private static final Integer CHAIN_ID = 1;
    private static final Integer CINEMA_ID = 10;

    @BeforeEach
    void setUp() {
        lenient().when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
        lenient().when(jwtTokenProvider.getUserIdFromToken("invalid.jwt.token")).thenThrow(new RuntimeException("Invalid token"));
    }

    private CinemaDto createTestCinemaDto() {
        return CinemaDto.builder()
                .cinemaId(CINEMA_ID)
                .chainId(CHAIN_ID)
                .chainName("Test Cinema Chain")
                .managerId(5)
                .managerName("John Manager")
                .managerEmail("manager@test.com")
                .cinemaName("Test Cinema")
                .address("123 Test Street")
                .city("Ho Chi Minh")
                .district("District 1")
                .phoneNumber("0901234567")
                .email("cinema@test.com")
                .taxCode("0123456789")
                .legalName("Test Cinema Legal Name")
                .latitude(10.762622)
                .longitude(106.660172)
                .openingHours(new HashMap<>())
                .facilities(new HashMap<>())
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private PagedCinemaResponse createTestPagedResponse() {
        List<CinemaDto> cinemas = Arrays.asList(createTestCinemaDto());
        return PagedCinemaResponse.builder()
                .data(cinemas)
                .totalElements(1L)
                .totalPages(1)
                .currentPage(0)
                .pageSize(10)
                .build();
    }

    @Nested
    @DisplayName("getAllCinemasByChain Tests")
    class GetAllCinemasByChainTests {

        @Test
        @DisplayName("Should return all active cinemas for chain successfully")
        void shouldReturnAllActiveCinemasForChain() {
            // Arrange
            PagedCinemaResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(true)
                    .message("Cinemas retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaService.getAllCinemasByChain(CHAIN_ID, 0, 10, null))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasByChain(CHAIN_ID, 0, 10, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getTotalElements()).isEqualTo(1L);
            verify(cinemaService).getAllCinemasByChain(CHAIN_ID, 0, 10, null);
        }

        @Test
        @DisplayName("Should return cinemas with search parameter")
        void shouldReturnCinemasWithSearchParameter() {
            // Arrange
            PagedCinemaResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(true)
                    .message("Cinemas retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaService.getAllCinemasByChain(CHAIN_ID, 0, 10, "Test"))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasByChain(CHAIN_ID, 0, 10, "Test");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaService).getAllCinemasByChain(CHAIN_ID, 0, 10, "Test");
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when service fails")
        void shouldReturnBadRequestWhenServiceFails() {
            // Arrange
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(false)
                    .message("Error retrieving cinemas")
                    .build();

            when(cinemaService.getAllCinemasByChain(CHAIN_ID, 0, 10, null))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasByChain(CHAIN_ID, 0, 10, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("getAllCinemasByChainAdmin Tests")
    class GetAllCinemasByChainAdminTests {

        @Test
        @DisplayName("Should return all cinemas for admin successfully")
        void shouldReturnAllCinemasForAdmin() {
            // Arrange
            PagedCinemaResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(true)
                    .message("Cinemas retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaService.getAllCinemasByChainAdmin(CHAIN_ID, 0, 10, null, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasByChainAdmin(CHAIN_ID, 0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaService).getAllCinemasByChainAdmin(CHAIN_ID, 0, 10, null, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasByChainAdmin(CHAIN_ID, 0, 10, null, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).isEqualTo("Token khong hop le hoac da het han");
            verify(cinemaService, never()).getAllCinemasByChainAdmin(anyInt(), anyInt(), anyInt(), any(), anyInt());
        }

        @Test
        @DisplayName("Should return FORBIDDEN when user lacks permission")
        void shouldReturnForbiddenWhenUserLacksPermission() {
            // Arrange
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(false)
                    .message("Access denied")
                    .build();

            when(cinemaService.getAllCinemasByChainAdmin(CHAIN_ID, 0, 10, null, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasByChainAdmin(CHAIN_ID, 0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("getCinemaById Tests")
    class GetCinemaByIdTests {

        @Test
        @DisplayName("Should return cinema by ID successfully")
        void shouldReturnCinemaByIdSuccessfully() {
            // Arrange
            CinemaDto cinemaDto = createTestCinemaDto();
            ApiResponse<CinemaDto> expectedResponse = ApiResponse.<CinemaDto>builder()
                    .success(true)
                    .message("Cinema found")
                    .data(cinemaDto)
                    .build();

            when(cinemaService.getCinemaById(CHAIN_ID, CINEMA_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaDto>> response = 
                    cinemaController.getCinemaById(CINEMA_ID, CHAIN_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getCinemaId()).isEqualTo(CINEMA_ID);
            verify(cinemaService).getCinemaById(CHAIN_ID, CINEMA_ID);
        }

        @Test
        @DisplayName("Should return NOT_FOUND when cinema doesn't exist")
        void shouldReturnNotFoundWhenCinemaDoesNotExist() {
            // Arrange
            ApiResponse<CinemaDto> expectedResponse = ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Cinema not found")
                    .build();

            when(cinemaService.getCinemaById(CHAIN_ID, 999)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaDto>> response = 
                    cinemaController.getCinemaById(999, CHAIN_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("createCinema Tests")
    class CreateCinemaTests {

        @Test
        @DisplayName("Should create cinema successfully")
        void shouldCreateCinemaSuccessfully() {
            // Arrange
            CreateCinemaRequest request = CreateCinemaRequest.builder()
                    .chainId(CHAIN_ID)
                    .managerId(5)
                    .cinemaName("New Cinema")
                    .address("456 New Street")
                    .city("Ha Noi")
                    .district("Ba Dinh")
                    .phoneNumber("0987654321")
                    .email("newcinema@test.com")
                    .taxCode("9876543210")
                    .legalName("New Cinema Legal")
                    .latitude(21.028511)
                    .longitude(105.804817)
                    .openingHours(new HashMap<>())
                    .facilities(new HashMap<>())
                    .build();

            CinemaDto createdCinema = createTestCinemaDto();
            ApiResponse<CinemaDto> expectedResponse = ApiResponse.<CinemaDto>builder()
                    .success(true)
                    .message("Cinema created successfully")
                    .data(createdCinema)
                    .build();

            when(cinemaService.createCinema(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaDto>> response = 
                    cinemaController.createCinema(request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaService).createCinema(request, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Arrange
            CreateCinemaRequest request = CreateCinemaRequest.builder()
                    .cinemaName("New Cinema")
                    .build();

            // Act
            ResponseEntity<ApiResponse<CinemaDto>> response = 
                    cinemaController.createCinema(request, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaService, never()).createCinema(any(), anyInt());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when creation fails")
        void shouldReturnBadRequestWhenCreationFails() {
            // Arrange
            CreateCinemaRequest request = CreateCinemaRequest.builder()
                    .chainId(CHAIN_ID)
                    .cinemaName("Duplicate Cinema")
                    .build();

            ApiResponse<CinemaDto> expectedResponse = ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Cinema already exists")
                    .build();

            when(cinemaService.createCinema(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaDto>> response = 
                    cinemaController.createCinema(request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("updateCinema Tests")
    class UpdateCinemaTests {

        @Test
        @DisplayName("Should update cinema successfully")
        void shouldUpdateCinemaSuccessfully() {
            // Arrange
            UpdateCinemaRequest request = UpdateCinemaRequest.builder()
                    .chainId(CHAIN_ID)
                    .managerId(5)
                    .cinemaName("Updated Cinema")
                    .address("789 Updated Street")
                    .city("Da Nang")
                    .district("Hai Chau")
                    .phoneNumber("0912345678")
                    .email("updated@test.com")
                    .isActive(true)
                    .build();

            CinemaDto updatedCinema = createTestCinemaDto();
            updatedCinema.setCinemaName("Updated Cinema");
            ApiResponse<CinemaDto> expectedResponse = ApiResponse.<CinemaDto>builder()
                    .success(true)
                    .message("Cinema updated successfully")
                    .data(updatedCinema)
                    .build();

            when(cinemaService.updateCinema(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaDto>> response = 
                    cinemaController.updateCinema(CINEMA_ID, request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(request.getCinemaId()).isEqualTo(CINEMA_ID); // Verify cinemaId was set
            verify(cinemaService).updateCinema(request, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Arrange
            UpdateCinemaRequest request = UpdateCinemaRequest.builder()
                    .cinemaName("Updated Cinema")
                    .build();

            // Act
            ResponseEntity<ApiResponse<CinemaDto>> response = 
                    cinemaController.updateCinema(CINEMA_ID, request, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaService, never()).updateCinema(any(), anyInt());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when update fails")
        void shouldReturnBadRequestWhenUpdateFails() {
            // Arrange
            UpdateCinemaRequest request = UpdateCinemaRequest.builder()
                    .chainId(CHAIN_ID)
                    .cinemaName("Updated Cinema")
                    .build();

            ApiResponse<CinemaDto> expectedResponse = ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Cinema not found")
                    .build();

            when(cinemaService.updateCinema(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaDto>> response = 
                    cinemaController.updateCinema(CINEMA_ID, request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
        }

        @Test
        @DisplayName("Should set cinemaId from path variable")
        void shouldSetCinemaIdFromPathVariable() {
            // Arrange
            UpdateCinemaRequest request = UpdateCinemaRequest.builder()
                    .chainId(CHAIN_ID)
                    .cinemaName("Updated Cinema")
                    .build();

            ApiResponse<CinemaDto> expectedResponse = ApiResponse.<CinemaDto>builder()
                    .success(true)
                    .message("Updated")
                    .data(createTestCinemaDto())
                    .build();

            when(cinemaService.updateCinema(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            cinemaController.updateCinema(15, request, VALID_TOKEN);

            // Assert
            assertThat(request.getCinemaId()).isEqualTo(15);
        }
    }

    @Nested
    @DisplayName("deleteCinema Tests")
    class DeleteCinemaTests {

        @Test
        @DisplayName("Should delete cinema successfully")
        void shouldDeleteCinemaSuccessfully() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(true)
                    .message("Cinema deleted successfully")
                    .build();

            when(cinemaService.deleteCinema(CHAIN_ID, CINEMA_ID, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaController.deleteCinema(CINEMA_ID, CHAIN_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaService).deleteCinema(CHAIN_ID, CINEMA_ID, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaController.deleteCinema(CINEMA_ID, CHAIN_ID, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaService, never()).deleteCinema(anyInt(), anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when deletion fails")
        void shouldReturnBadRequestWhenDeletionFails() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(false)
                    .message("Cinema not found")
                    .build();

            when(cinemaService.deleteCinema(CHAIN_ID, 999, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaController.deleteCinema(999, CHAIN_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("getMyCinemas Tests")
    class GetMyCinemasTests {

        @Test
        @DisplayName("Should return manager's cinemas successfully")
        void shouldReturnManagerCinemasSuccessfully() {
            // Arrange
            PagedCinemaResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(true)
                    .message("Cinemas retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaService.getMycinemas(USER_ID, 0, 10, null))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getMycinemas(0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaService).getMycinemas(USER_ID, 0, 10, null);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getMycinemas(0, 10, null, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaService, never()).getMycinemas(anyInt(), anyInt(), anyInt(), any());
        }

        @Test
        @DisplayName("Should return FORBIDDEN when user lacks permission")
        void shouldReturnForbiddenWhenUserLacksPermission() {
            // Arrange
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(false)
                    .message("Access denied")
                    .build();

            when(cinemaService.getMycinemas(USER_ID, 0, 10, null))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getMycinemas(0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody().getSuccess()).isFalse();
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR on exception")
        void shouldReturnInternalServerErrorOnException() {
            // Arrange
            when(cinemaService.getMycinemas(USER_ID, 0, 10, null))
                    .thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getMycinemas(0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Error:");
        }
    }

    @Nested
    @DisplayName("getAllCinemasForSystemAdmin Tests")
    class GetAllCinemasForSystemAdminTests {

        @Test
        @DisplayName("Should return all cinemas for system admin successfully")
        void shouldReturnAllCinemasForSystemAdminSuccessfully() {
            // Arrange
            PagedCinemaResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(true)
                    .message("Cinemas retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaService.getAllCinemasForSystemAdmin(USER_ID, 0, 10, null, null))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasForSystemAdmin(0, 10, null, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaService).getAllCinemasForSystemAdmin(USER_ID, 0, 10, null, null);
        }

        @Test
        @DisplayName("Should filter by chainId when provided")
        void shouldFilterByChainIdWhenProvided() {
            // Arrange
            PagedCinemaResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(true)
                    .message("Cinemas retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaService.getAllCinemasForSystemAdmin(USER_ID, 0, 10, "Test", CHAIN_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasForSystemAdmin(0, 10, "Test", CHAIN_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaService).getAllCinemasForSystemAdmin(USER_ID, 0, 10, "Test", CHAIN_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasForSystemAdmin(0, 10, null, null, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaService, never()).getAllCinemasForSystemAdmin(anyInt(), anyInt(), anyInt(), any(), any());
        }

        @Test
        @DisplayName("Should return FORBIDDEN when user lacks permission")
        void shouldReturnForbiddenWhenUserLacksPermission() {
            // Arrange
            ApiResponse<PagedCinemaResponse> expectedResponse = ApiResponse.<PagedCinemaResponse>builder()
                    .success(false)
                    .message("Access denied")
                    .build();

            when(cinemaService.getAllCinemasForSystemAdmin(USER_ID, 0, 10, null, null))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasForSystemAdmin(0, 10, null, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody().getSuccess()).isFalse();
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR on exception")
        void shouldReturnInternalServerErrorOnException() {
            // Arrange
            when(cinemaService.getAllCinemasForSystemAdmin(USER_ID, 0, 10, null, null))
                    .thenThrow(new RuntimeException("Service error"));

            // Act
            ResponseEntity<ApiResponse<PagedCinemaResponse>> response = 
                    cinemaController.getAllCinemasForSystemAdmin(0, 10, null, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Error:");
        }
    }
}
