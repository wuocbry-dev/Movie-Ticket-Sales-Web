package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import aws.movie_ticket_sales_web_project.service.CinemaHallService;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CinemaHallController Unit Tests")
class CinemaHallControllerTest {

    @Mock
    private CinemaHallService cinemaHallService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private CinemaHallController cinemaHallController;

    private static final String VALID_TOKEN = "Bearer valid.jwt.token";
    private static final String INVALID_TOKEN = "Bearer invalid.jwt.token";
    private static final Integer USER_ID = 1;
    private static final Integer CINEMA_ID = 1;
    private static final Integer HALL_ID = 10;

    @BeforeEach
    void setUp() {
        lenient().when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
        lenient().when(jwtTokenProvider.getUserIdFromToken("invalid.jwt.token")).thenThrow(new RuntimeException("Invalid token"));
    }

    private CinemaHallDto createTestCinemaHallDto() {
        return CinemaHallDto.builder()
                .hallId(HALL_ID)
                .cinemaId(CINEMA_ID)
                .cinemaName("Test Cinema")
                .hallName("Hall 1")
                .hallType("Standard")
                .totalSeats(100)
                .rowsCount(10)
                .seatsPerRow(10)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private PagedCinemaHallResponse createTestPagedResponse() {
        List<CinemaHallDto> halls = Arrays.asList(createTestCinemaHallDto());
        return PagedCinemaHallResponse.builder()
                .data(halls)
                .totalElements(1L)
                .totalPages(1)
                .currentPage(0)
                .pageSize(10)
                .build();
    }

    @Nested
    @DisplayName("getHallById Tests")
    class GetHallByIdTests {

        @Test
        @DisplayName("Should return hall by ID successfully")
        void shouldReturnHallByIdSuccessfully() {
            // Arrange
            CinemaHallDto hallDto = createTestCinemaHallDto();
            ApiResponse<CinemaHallDto> expectedResponse = ApiResponse.<CinemaHallDto>builder()
                    .success(true)
                    .message("Hall found")
                    .data(hallDto)
                    .build();

            when(cinemaHallService.getHallById(HALL_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaHallDto>> response = 
                    cinemaHallController.getHallById(HALL_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getHallId()).isEqualTo(HALL_ID);
            verify(cinemaHallService).getHallById(HALL_ID);
        }

        @Test
        @DisplayName("Should return NOT_FOUND when hall doesn't exist")
        void shouldReturnNotFoundWhenHallDoesNotExist() {
            // Arrange
            ApiResponse<CinemaHallDto> expectedResponse = ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Hall not found")
                    .build();

            when(cinemaHallService.getHallById(999)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaHallDto>> response = 
                    cinemaHallController.getHallById(999);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("getAllHallsByCinema Tests")
    class GetAllHallsByCinemaTests {

        @Test
        @DisplayName("Should return all active halls for cinema successfully")
        void shouldReturnAllActiveHallsForCinema() {
            // Arrange
            PagedCinemaHallResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaHallResponse> expectedResponse = ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(true)
                    .message("Halls retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaHallService.getAllHallsByCinema(CINEMA_ID, 0, 10, null))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaHallResponse>> response = 
                    cinemaHallController.getAllHallsByCinema(CINEMA_ID, 0, 10, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getTotalElements()).isEqualTo(1L);
            verify(cinemaHallService).getAllHallsByCinema(CINEMA_ID, 0, 10, null);
        }

        @Test
        @DisplayName("Should return halls with search parameter")
        void shouldReturnHallsWithSearchParameter() {
            // Arrange
            PagedCinemaHallResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaHallResponse> expectedResponse = ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(true)
                    .message("Halls retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaHallService.getAllHallsByCinema(CINEMA_ID, 0, 10, "Hall 1"))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaHallResponse>> response = 
                    cinemaHallController.getAllHallsByCinema(CINEMA_ID, 0, 10, "Hall 1");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaHallService).getAllHallsByCinema(CINEMA_ID, 0, 10, "Hall 1");
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when service fails")
        void shouldReturnBadRequestWhenServiceFails() {
            // Arrange
            ApiResponse<PagedCinemaHallResponse> expectedResponse = ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(false)
                    .message("Error retrieving halls")
                    .build();

            when(cinemaHallService.getAllHallsByCinema(CINEMA_ID, 0, 10, null))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaHallResponse>> response = 
                    cinemaHallController.getAllHallsByCinema(CINEMA_ID, 0, 10, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("getAllHallsByCinemaAdmin Tests")
    class GetAllHallsByCinemaAdminTests {

        @Test
        @DisplayName("Should return all halls for admin successfully")
        void shouldReturnAllHallsForAdmin() {
            // Arrange
            PagedCinemaHallResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaHallResponse> expectedResponse = ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(true)
                    .message("Halls retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaHallService.getAllHallsByCinemaAdmin(CINEMA_ID, 0, 10, null, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaHallResponse>> response = 
                    cinemaHallController.getAllHallsByCinemaAdmin(CINEMA_ID, 0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaHallService).getAllHallsByCinemaAdmin(CINEMA_ID, 0, 10, null, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<PagedCinemaHallResponse>> response = 
                    cinemaHallController.getAllHallsByCinemaAdmin(CINEMA_ID, 0, 10, null, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaHallService, never()).getAllHallsByCinemaAdmin(anyInt(), anyInt(), anyInt(), any(), anyInt());
        }

        @Test
        @DisplayName("Should return FORBIDDEN when user lacks permission")
        void shouldReturnForbiddenWhenUserLacksPermission() {
            // Arrange
            ApiResponse<PagedCinemaHallResponse> expectedResponse = ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(false)
                    .message("Access denied")
                    .build();

            when(cinemaHallService.getAllHallsByCinemaAdmin(CINEMA_ID, 0, 10, null, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaHallResponse>> response = 
                    cinemaHallController.getAllHallsByCinemaAdmin(CINEMA_ID, 0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("getMyHalls Tests")
    class GetMyHallsTests {

        @Test
        @DisplayName("Should return manager's halls successfully")
        void shouldReturnManagerHallsSuccessfully() {
            // Arrange
            PagedCinemaHallResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedCinemaHallResponse> expectedResponse = ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(true)
                    .message("Halls retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(cinemaHallService.getHallsForManager(USER_ID, CINEMA_ID, 0, 10, null))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedCinemaHallResponse>> response = 
                    cinemaHallController.getMyHalls(CINEMA_ID, 0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaHallService).getHallsForManager(USER_ID, CINEMA_ID, 0, 10, null);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<PagedCinemaHallResponse>> response = 
                    cinemaHallController.getMyHalls(CINEMA_ID, 0, 10, null, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaHallService, never()).getHallsForManager(anyInt(), anyInt(), anyInt(), anyInt(), any());
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR on exception")
        void shouldReturnInternalServerErrorOnException() {
            // Arrange
            when(cinemaHallService.getHallsForManager(USER_ID, CINEMA_ID, 0, 10, null))
                    .thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<ApiResponse<PagedCinemaHallResponse>> response = 
                    cinemaHallController.getMyHalls(CINEMA_ID, 0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("createCinemaHall Tests")
    class CreateCinemaHallTests {

        @Test
        @DisplayName("Should create cinema hall successfully")
        void shouldCreateCinemaHallSuccessfully() {
            // Arrange
            CreateCinemaHallRequest request = CreateCinemaHallRequest.builder()
                    .cinemaId(CINEMA_ID)
                    .hallName("New Hall")
                    .hallType("IMAX")
                    .totalSeats(150)
                    .rowsCount(15)
                    .seatsPerRow(10)
                    .build();

            CinemaHallDto createdHall = createTestCinemaHallDto();
            ApiResponse<CinemaHallDto> expectedResponse = ApiResponse.<CinemaHallDto>builder()
                    .success(true)
                    .message("Hall created successfully")
                    .data(createdHall)
                    .build();

            when(cinemaHallService.createCinemaHall(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaHallDto>> response = 
                    cinemaHallController.createCinemaHall(request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaHallService).createCinemaHall(request, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Arrange
            CreateCinemaHallRequest request = CreateCinemaHallRequest.builder()
                    .hallName("New Hall")
                    .build();

            // Act
            ResponseEntity<ApiResponse<CinemaHallDto>> response = 
                    cinemaHallController.createCinemaHall(request, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaHallService, never()).createCinemaHall(any(), anyInt());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when creation fails")
        void shouldReturnBadRequestWhenCreationFails() {
            // Arrange
            CreateCinemaHallRequest request = CreateCinemaHallRequest.builder()
                    .cinemaId(CINEMA_ID)
                    .hallName("Duplicate Hall")
                    .build();

            ApiResponse<CinemaHallDto> expectedResponse = ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Hall already exists")
                    .build();

            when(cinemaHallService.createCinemaHall(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaHallDto>> response = 
                    cinemaHallController.createCinemaHall(request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("updateCinemaHall Tests")
    class UpdateCinemaHallTests {

        @Test
        @DisplayName("Should update cinema hall successfully")
        void shouldUpdateCinemaHallSuccessfully() {
            // Arrange
            UpdateCinemaHallRequest request = UpdateCinemaHallRequest.builder()
                    .cinemaId(CINEMA_ID)
                    .hallName("Updated Hall")
                    .hallType("Premium")
                    .totalSeats(120)
                    .isActive(true)
                    .build();

            CinemaHallDto updatedHall = createTestCinemaHallDto();
            updatedHall.setHallName("Updated Hall");
            ApiResponse<CinemaHallDto> expectedResponse = ApiResponse.<CinemaHallDto>builder()
                    .success(true)
                    .message("Hall updated successfully")
                    .data(updatedHall)
                    .build();

            when(cinemaHallService.updateCinemaHall(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<CinemaHallDto>> response = 
                    cinemaHallController.updateCinemaHall(HALL_ID, request, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(request.getHallId()).isEqualTo(HALL_ID); // Verify hallId was set
            verify(cinemaHallService).updateCinemaHall(request, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Arrange
            UpdateCinemaHallRequest request = UpdateCinemaHallRequest.builder()
                    .hallName("Updated Hall")
                    .build();

            // Act
            ResponseEntity<ApiResponse<CinemaHallDto>> response = 
                    cinemaHallController.updateCinemaHall(HALL_ID, request, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaHallService, never()).updateCinemaHall(any(), anyInt());
        }

        @Test
        @DisplayName("Should set hallId from path variable")
        void shouldSetHallIdFromPathVariable() {
            // Arrange
            UpdateCinemaHallRequest request = UpdateCinemaHallRequest.builder()
                    .cinemaId(CINEMA_ID)
                    .hallName("Updated Hall")
                    .build();

            ApiResponse<CinemaHallDto> expectedResponse = ApiResponse.<CinemaHallDto>builder()
                    .success(true)
                    .message("Updated")
                    .data(createTestCinemaHallDto())
                    .build();

            when(cinemaHallService.updateCinemaHall(request, USER_ID)).thenReturn(expectedResponse);

            // Act
            cinemaHallController.updateCinemaHall(15, request, VALID_TOKEN);

            // Assert
            assertThat(request.getHallId()).isEqualTo(15);
        }
    }

    @Nested
    @DisplayName("deleteCinemaHall Tests")
    class DeleteCinemaHallTests {

        @Test
        @DisplayName("Should delete cinema hall successfully")
        void shouldDeleteCinemaHallSuccessfully() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(true)
                    .message("Hall deleted successfully")
                    .build();

            when(cinemaHallService.deleteCinemaHall(CINEMA_ID, HALL_ID, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaHallController.deleteCinemaHall(HALL_ID, CINEMA_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaHallService).deleteCinemaHall(CINEMA_ID, HALL_ID, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaHallController.deleteCinemaHall(HALL_ID, CINEMA_ID, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaHallService, never()).deleteCinemaHall(anyInt(), anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when deletion fails")
        void shouldReturnBadRequestWhenDeletionFails() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(false)
                    .message("Hall not found")
                    .build();

            when(cinemaHallService.deleteCinemaHall(CINEMA_ID, 999, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    cinemaHallController.deleteCinemaHall(999, CINEMA_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("regenerateSeatsForHall Tests")
    class RegenerateSeatsForHallTests {

        @Test
        @DisplayName("Should regenerate seats for hall successfully")
        void shouldRegenerateSeatsForHallSuccessfully() {
            // Arrange
            ApiResponse<String> expectedResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("Seats regenerated successfully")
                    .data("100 seats generated")
                    .build();

            when(cinemaHallService.regenerateSeatsForHall(HALL_ID, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.regenerateSeatsForHall(HALL_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaHallService).regenerateSeatsForHall(HALL_ID, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.regenerateSeatsForHall(HALL_ID, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaHallService, never()).regenerateSeatsForHall(anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR on exception")
        void shouldReturnInternalServerErrorOnException() {
            // Arrange
            when(cinemaHallService.regenerateSeatsForHall(HALL_ID, USER_ID))
                    .thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.regenerateSeatsForHall(HALL_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("regenerateSeatsForAllHalls Tests")
    class RegenerateSeatsForAllHallsTests {

        @Test
        @DisplayName("Should regenerate seats for all halls successfully")
        void shouldRegenerateSeatsForAllHallsSuccessfully() {
            // Arrange
            ApiResponse<String> expectedResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("Seats regenerated for all halls")
                    .data("5 halls processed")
                    .build();

            when(cinemaHallService.regenerateSeatsForAllHalls(CINEMA_ID, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.regenerateSeatsForAllHalls(CINEMA_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaHallService).regenerateSeatsForAllHalls(CINEMA_ID, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.regenerateSeatsForAllHalls(CINEMA_ID, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaHallService, never()).regenerateSeatsForAllHalls(anyInt(), anyInt());
        }
    }

    @Nested
    @DisplayName("deleteAllSeatsInHall Tests")
    class DeleteAllSeatsInHallTests {

        @Test
        @DisplayName("Should delete all seats in hall successfully")
        void shouldDeleteAllSeatsInHallSuccessfully() {
            // Arrange
            ApiResponse<String> expectedResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("All seats deleted successfully")
                    .data("100 seats deleted")
                    .build();

            when(cinemaHallService.deleteAllSeatsInHall(HALL_ID, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.deleteAllSeatsInHall(HALL_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaHallService).deleteAllSeatsInHall(HALL_ID, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.deleteAllSeatsInHall(HALL_ID, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaHallService, never()).deleteAllSeatsInHall(anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR on exception")
        void shouldReturnInternalServerErrorOnException() {
            // Arrange
            when(cinemaHallService.deleteAllSeatsInHall(HALL_ID, USER_ID))
                    .thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.deleteAllSeatsInHall(HALL_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }

    @Nested
    @DisplayName("deleteAllSeatsInCinema Tests")
    class DeleteAllSeatsInCinemaTests {

        @Test
        @DisplayName("Should delete all seats in cinema successfully")
        void shouldDeleteAllSeatsInCinemaSuccessfully() {
            // Arrange
            ApiResponse<String> expectedResponse = ApiResponse.<String>builder()
                    .success(true)
                    .message("All seats deleted successfully")
                    .data("500 seats deleted from 5 halls")
                    .build();

            when(cinemaHallService.deleteAllSeatsInCinema(CINEMA_ID, USER_ID))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.deleteAllSeatsInCinema(CINEMA_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            verify(cinemaHallService).deleteAllSeatsInCinema(CINEMA_ID, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED with invalid token")
        void shouldReturnUnauthorizedWithInvalidToken() {
            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.deleteAllSeatsInCinema(CINEMA_ID, INVALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            verify(cinemaHallService, never()).deleteAllSeatsInCinema(anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR on exception")
        void shouldReturnInternalServerErrorOnException() {
            // Arrange
            when(cinemaHallService.deleteAllSeatsInCinema(CINEMA_ID, USER_ID))
                    .thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<ApiResponse<String>> response = 
                    cinemaHallController.deleteAllSeatsInCinema(CINEMA_ID, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
        }
    }
}
