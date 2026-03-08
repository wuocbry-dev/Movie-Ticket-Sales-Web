package aws.movie_ticket_sales_web_project.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

import aws.movie_ticket_sales_web_project.dto.HoldSeatsRequest;
import aws.movie_ticket_sales_web_project.dto.SeatAvailabilityResponse;
import aws.movie_ticket_sales_web_project.dto.SeatHoldDto;
import aws.movie_ticket_sales_web_project.service.SeatHoldService;

@ExtendWith(MockitoExtension.class)
@DisplayName("SeatHoldController Unit Tests")
class SeatHoldControllerTest {

    @Mock
    private SeatHoldService seatHoldService;

    @InjectMocks
    private SeatHoldController seatHoldController;

    private HoldSeatsRequest testHoldSeatsRequest;
    private SeatHoldDto testSeatHoldDto;
    private SeatAvailabilityResponse testSeatAvailabilityResponse;

    @BeforeEach
    void setUp() {
        testHoldSeatsRequest = HoldSeatsRequest.builder()
                .showtimeId(1)
                .seatIds(Arrays.asList(1, 2, 3))
                .sessionId("session-123")
                .customerEmail("test@example.com")
                .build();

        testSeatHoldDto = SeatHoldDto.builder()
                .showtimeId(1)
                .seatIds(Arrays.asList(1, 2, 3))
                .sessionId("session-123")
                .customerEmail("test@example.com")
                .holdExpiresAt(System.currentTimeMillis() + 300000) // 5 minutes
                .createdAt(System.currentTimeMillis())
                .build();

        testSeatAvailabilityResponse = SeatAvailabilityResponse.builder()
                .showtimeId(1)
                .hallId(1)
                .availableSeatIds(Arrays.asList(4, 5, 6, 7, 8))
                .heldSeats(Arrays.asList(
                        SeatAvailabilityResponse.SeatHoldInfo.builder()
                                .seatId(1)
                                .heldBy("you")
                                .expiresAt(System.currentTimeMillis() + 300000)
                                .build()
                ))
                .build();
    }

    @Nested
    @DisplayName("holdSeats Tests")
    class HoldSeatsTests {

        @Test
        @DisplayName("Should hold seats successfully")
        void shouldHoldSeatsSuccessfully() {
            // Arrange
            when(seatHoldService.holdSeats(testHoldSeatsRequest)).thenReturn(testSeatHoldDto);

            // Act
            ResponseEntity<?> response = seatHoldController.holdSeats(testHoldSeatsRequest);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).isInstanceOf(SeatHoldDto.class);
            
            SeatHoldDto body = (SeatHoldDto) response.getBody();
            assertThat(body.getSessionId()).isEqualTo("session-123");
            assertThat(body.getSeatIds()).containsExactly(1, 2, 3);
            
            verify(seatHoldService).holdSeats(testHoldSeatsRequest);
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when RuntimeException occurs")
        @SuppressWarnings("unchecked")
        void shouldReturnBadRequestWhenRuntimeExceptionOccurs() {
            // Arrange
            when(seatHoldService.holdSeats(any(HoldSeatsRequest.class)))
                    .thenThrow(new RuntimeException("Seats already held by another user"));

            // Act
            ResponseEntity<?> response = seatHoldController.holdSeats(testHoldSeatsRequest);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(false);
            assertThat(body.get("message")).isEqualTo("Seats already held by another user");
            
            verify(seatHoldService).holdSeats(testHoldSeatsRequest);
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when IllegalStateException occurs (subclass of RuntimeException)")
        @SuppressWarnings("unchecked")
        void shouldReturnBadRequestWhenIllegalStateExceptionOccurs() {
            // Arrange - IllegalStateException is a RuntimeException, so BAD_REQUEST is expected
            when(seatHoldService.holdSeats(any(HoldSeatsRequest.class)))
                    .thenThrow(new IllegalStateException("Database connection failed"));

            // Act
            ResponseEntity<?> response = seatHoldController.holdSeats(testHoldSeatsRequest);

            // Assert - IllegalStateException extends RuntimeException, so BAD_REQUEST
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(false);
            assertThat(body.get("message")).isEqualTo("Database connection failed");
            
            verify(seatHoldService).holdSeats(testHoldSeatsRequest);
        }

        @Test
        @DisplayName("Should hold multiple seats for same showtime")
        void shouldHoldMultipleSeatsForSameShowtime() {
            // Arrange
            HoldSeatsRequest multiSeatRequest = HoldSeatsRequest.builder()
                    .showtimeId(1)
                    .seatIds(Arrays.asList(10, 11, 12, 13, 14))
                    .sessionId("session-456")
                    .build();

            SeatHoldDto multiSeatHold = SeatHoldDto.builder()
                    .showtimeId(1)
                    .seatIds(Arrays.asList(10, 11, 12, 13, 14))
                    .sessionId("session-456")
                    .holdExpiresAt(System.currentTimeMillis() + 300000)
                    .build();

            when(seatHoldService.holdSeats(multiSeatRequest)).thenReturn(multiSeatHold);

            // Act
            ResponseEntity<?> response = seatHoldController.holdSeats(multiSeatRequest);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            SeatHoldDto body = (SeatHoldDto) response.getBody();
            assertThat(body.getSeatIds()).hasSize(5);
            
            verify(seatHoldService).holdSeats(multiSeatRequest);
        }
    }

    @Nested
    @DisplayName("releaseSeats Tests")
    class ReleaseSeatsTests {

        @Test
        @DisplayName("Should release seats successfully")
        @SuppressWarnings("unchecked")
        void shouldReleaseSeatsSuccessfully() {
            // Arrange
            String sessionId = "session-123";
            Integer showtimeId = 1;
            List<Integer> seatIds = Arrays.asList(1, 2, 3);
            
            doNothing().when(seatHoldService).releaseSeats(sessionId, showtimeId, seatIds);

            // Act
            ResponseEntity<?> response = seatHoldController.releaseSeats(sessionId, showtimeId, seatIds);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(true);
            assertThat(body.get("message")).isEqualTo("Seats released successfully");
            
            verify(seatHoldService).releaseSeats(sessionId, showtimeId, seatIds);
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR when release fails")
        @SuppressWarnings("unchecked")
        void shouldReturnInternalServerErrorWhenReleaseFails() {
            // Arrange
            String sessionId = "session-123";
            Integer showtimeId = 1;
            List<Integer> seatIds = Arrays.asList(1, 2, 3);
            
            doThrow(new RuntimeException("Redis error")).when(seatHoldService)
                    .releaseSeats(sessionId, showtimeId, seatIds);

            // Act
            ResponseEntity<?> response = seatHoldController.releaseSeats(sessionId, showtimeId, seatIds);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(false);
            assertThat(body.get("message")).isEqualTo("Failed to release seats");
            
            verify(seatHoldService).releaseSeats(sessionId, showtimeId, seatIds);
        }

        @Test
        @DisplayName("Should release single seat")
        @SuppressWarnings("unchecked")
        void shouldReleaseSingleSeat() {
            // Arrange
            String sessionId = "session-789";
            Integer showtimeId = 2;
            List<Integer> seatIds = Arrays.asList(5);
            
            doNothing().when(seatHoldService).releaseSeats(sessionId, showtimeId, seatIds);

            // Act
            ResponseEntity<?> response = seatHoldController.releaseSeats(sessionId, showtimeId, seatIds);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(true);
            
            verify(seatHoldService).releaseSeats(sessionId, showtimeId, seatIds);
        }
    }

    @Nested
    @DisplayName("extendHold Tests")
    class ExtendHoldTests {

        @Test
        @DisplayName("Should extend hold successfully with default minutes")
        @SuppressWarnings("unchecked")
        void shouldExtendHoldSuccessfullyWithDefaultMinutes() {
            // Arrange
            String sessionId = "session-123";
            Integer showtimeId = 1;
            List<Integer> seatIds = Arrays.asList(1, 2, 3);
            long additionalMinutes = 5L;
            
            doNothing().when(seatHoldService).extendHold(sessionId, showtimeId, seatIds, additionalMinutes);

            // Act
            ResponseEntity<?> response = seatHoldController.extendHold(sessionId, showtimeId, seatIds, additionalMinutes);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(true);
            assertThat(body.get("message")).isEqualTo("Hold extended successfully");
            
            verify(seatHoldService).extendHold(sessionId, showtimeId, seatIds, additionalMinutes);
        }

        @Test
        @DisplayName("Should extend hold with custom minutes")
        @SuppressWarnings("unchecked")
        void shouldExtendHoldWithCustomMinutes() {
            // Arrange
            String sessionId = "session-123";
            Integer showtimeId = 1;
            List<Integer> seatIds = Arrays.asList(1, 2);
            long additionalMinutes = 10L;
            
            doNothing().when(seatHoldService).extendHold(sessionId, showtimeId, seatIds, additionalMinutes);

            // Act
            ResponseEntity<?> response = seatHoldController.extendHold(sessionId, showtimeId, seatIds, additionalMinutes);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(true);
            
            verify(seatHoldService).extendHold(sessionId, showtimeId, seatIds, 10L);
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR when extend hold fails")
        @SuppressWarnings("unchecked")
        void shouldReturnInternalServerErrorWhenExtendHoldFails() {
            // Arrange
            String sessionId = "session-123";
            Integer showtimeId = 1;
            List<Integer> seatIds = Arrays.asList(1, 2, 3);
            long additionalMinutes = 5L;
            
            doThrow(new RuntimeException("Hold expired")).when(seatHoldService)
                    .extendHold(sessionId, showtimeId, seatIds, additionalMinutes);

            // Act
            ResponseEntity<?> response = seatHoldController.extendHold(sessionId, showtimeId, seatIds, additionalMinutes);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(false);
            assertThat(body.get("message")).isEqualTo("Failed to extend hold");
            
            verify(seatHoldService).extendHold(sessionId, showtimeId, seatIds, additionalMinutes);
        }
    }

    @Nested
    @DisplayName("getSeatAvailability Tests")
    class GetSeatAvailabilityTests {

        @Test
        @DisplayName("Should get seat availability successfully")
        void shouldGetSeatAvailabilitySuccessfully() {
            // Arrange
            Integer showtimeId = 1;
            String sessionId = "session-123";
            
            when(seatHoldService.getSeatAvailability(showtimeId, sessionId))
                    .thenReturn(testSeatAvailabilityResponse);

            // Act
            ResponseEntity<?> response = seatHoldController.getSeatAvailability(showtimeId, sessionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).isInstanceOf(SeatAvailabilityResponse.class);
            
            SeatAvailabilityResponse body = (SeatAvailabilityResponse) response.getBody();
            assertThat(body.getShowtimeId()).isEqualTo(1);
            assertThat(body.getAvailableSeatIds()).containsExactly(4, 5, 6, 7, 8);
            
            verify(seatHoldService).getSeatAvailability(showtimeId, sessionId);
        }

        @Test
        @DisplayName("Should return NOT_FOUND when RuntimeException occurs")
        @SuppressWarnings("unchecked")
        void shouldReturnNotFoundWhenRuntimeExceptionOccurs() {
            // Arrange
            Integer showtimeId = 999;
            String sessionId = "session-123";
            
            when(seatHoldService.getSeatAvailability(showtimeId, sessionId))
                    .thenThrow(new RuntimeException("Showtime not found"));

            // Act
            ResponseEntity<?> response = seatHoldController.getSeatAvailability(showtimeId, sessionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(false);
            assertThat(body.get("message")).isEqualTo("Showtime not found");
            
            verify(seatHoldService).getSeatAvailability(showtimeId, sessionId);
        }

        @Test
        @DisplayName("Should return NOT_FOUND when IllegalStateException occurs (subclass of RuntimeException)")
        @SuppressWarnings("unchecked")
        void shouldReturnNotFoundWhenIllegalStateExceptionOccurs() {
            // Arrange - IllegalStateException is a RuntimeException, so NOT_FOUND is expected
            Integer showtimeId = 1;
            String sessionId = "session-123";
            
            when(seatHoldService.getSeatAvailability(showtimeId, sessionId))
                    .thenThrow(new IllegalStateException("Database error"));

            // Act
            ResponseEntity<?> response = seatHoldController.getSeatAvailability(showtimeId, sessionId);

            // Assert - IllegalStateException extends RuntimeException, so NOT_FOUND
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(false);
            assertThat(body.get("message")).isEqualTo("Database error");
            
            verify(seatHoldService).getSeatAvailability(showtimeId, sessionId);
        }

        @Test
        @DisplayName("Should return availability with held seats info")
        void shouldReturnAvailabilityWithHeldSeatsInfo() {
            // Arrange
            Integer showtimeId = 1;
            String sessionId = "session-123";
            
            SeatAvailabilityResponse responseWithHeldSeats = SeatAvailabilityResponse.builder()
                    .showtimeId(1)
                    .hallId(1)
                    .availableSeatIds(Arrays.asList(10, 11, 12))
                    .heldSeats(Arrays.asList(
                            SeatAvailabilityResponse.SeatHoldInfo.builder()
                                    .seatId(1)
                                    .heldBy("you")
                                    .expiresAt(System.currentTimeMillis() + 300000)
                                    .build(),
                            SeatAvailabilityResponse.SeatHoldInfo.builder()
                                    .seatId(2)
                                    .heldBy("another_user")
                                    .expiresAt(System.currentTimeMillis() + 200000)
                                    .build()
                    ))
                    .build();
            
            when(seatHoldService.getSeatAvailability(showtimeId, sessionId))
                    .thenReturn(responseWithHeldSeats);

            // Act
            ResponseEntity<?> response = seatHoldController.getSeatAvailability(showtimeId, sessionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            SeatAvailabilityResponse body = (SeatAvailabilityResponse) response.getBody();
            assertThat(body.getHeldSeats()).hasSize(2);
            assertThat(body.getHeldSeats().get(0).getHeldBy()).isEqualTo("you");
            assertThat(body.getHeldSeats().get(1).getHeldBy()).isEqualTo("another_user");
            
            verify(seatHoldService).getSeatAvailability(showtimeId, sessionId);
        }
    }

    @Nested
    @DisplayName("verifyHold Tests")
    class VerifyHoldTests {

        @Test
        @DisplayName("Should verify hold successfully")
        void shouldVerifyHoldSuccessfully() {
            // Arrange
            Integer showtimeId = 1;
            String sessionId = "session-123";
            List<Integer> seatIds = Arrays.asList(1, 2, 3);
            
            Map<String, Object> verifyResult = new HashMap<>();
            verifyResult.put("allHeldBySession", true);
            verifyResult.put("showtimeId", showtimeId);
            verifyResult.put("sessionId", sessionId);
            verifyResult.put("seatIds", seatIds);
            
            when(seatHoldService.verifySeatsHeldBySession(showtimeId, seatIds, sessionId))
                    .thenReturn(verifyResult);

            // Act
            ResponseEntity<?> response = seatHoldController.verifyHold(showtimeId, sessionId, seatIds);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).isEqualTo(verifyResult);
            
            verify(seatHoldService).verifySeatsHeldBySession(showtimeId, seatIds, sessionId);
        }

        @Test
        @DisplayName("Should return verify result with partial hold")
        @SuppressWarnings("unchecked")
        void shouldReturnVerifyResultWithPartialHold() {
            // Arrange
            Integer showtimeId = 1;
            String sessionId = "session-123";
            List<Integer> seatIds = Arrays.asList(1, 2, 3, 4);
            
            Map<String, Object> verifyResult = new HashMap<>();
            verifyResult.put("allHeldBySession", false);
            verifyResult.put("heldBySession", Arrays.asList(1, 2));
            verifyResult.put("notHeldBySession", Arrays.asList(3, 4));
            
            when(seatHoldService.verifySeatsHeldBySession(showtimeId, seatIds, sessionId))
                    .thenReturn(verifyResult);

            // Act
            ResponseEntity<?> response = seatHoldController.verifyHold(showtimeId, sessionId, seatIds);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("allHeldBySession")).isEqualTo(false);
            
            verify(seatHoldService).verifySeatsHeldBySession(showtimeId, seatIds, sessionId);
        }

        @Test
        @DisplayName("Should return INTERNAL_SERVER_ERROR when verify fails")
        @SuppressWarnings("unchecked")
        void shouldReturnInternalServerErrorWhenVerifyFails() {
            // Arrange
            Integer showtimeId = 1;
            String sessionId = "session-123";
            List<Integer> seatIds = Arrays.asList(1, 2, 3);
            
            when(seatHoldService.verifySeatsHeldBySession(showtimeId, seatIds, sessionId))
                    .thenThrow(new RuntimeException("Redis connection error"));

            // Act
            ResponseEntity<?> response = seatHoldController.verifyHold(showtimeId, sessionId, seatIds);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertThat(body.get("success")).isEqualTo(false);
            assertThat(body.get("message")).isEqualTo("Failed to verify hold");
            
            verify(seatHoldService).verifySeatsHeldBySession(showtimeId, seatIds, sessionId);
        }

        @Test
        @DisplayName("Should verify hold with single seat")
        void shouldVerifyHoldWithSingleSeat() {
            // Arrange
            Integer showtimeId = 1;
            String sessionId = "session-123";
            List<Integer> seatIds = Arrays.asList(5);
            
            Map<String, Object> verifyResult = new HashMap<>();
            verifyResult.put("allHeldBySession", true);
            verifyResult.put("seatId", 5);
            
            when(seatHoldService.verifySeatsHeldBySession(showtimeId, seatIds, sessionId))
                    .thenReturn(verifyResult);

            // Act
            ResponseEntity<?> response = seatHoldController.verifyHold(showtimeId, sessionId, seatIds);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            verify(seatHoldService).verifySeatsHeldBySession(showtimeId, seatIds, sessionId);
        }
    }

    @Nested
    @DisplayName("Service Interaction Tests")
    class ServiceInteractionTests {

        @Test
        @DisplayName("Should call service once for hold seats")
        void shouldCallServiceOnceForHoldSeats() {
            // Arrange
            when(seatHoldService.holdSeats(testHoldSeatsRequest)).thenReturn(testSeatHoldDto);

            // Act
            seatHoldController.holdSeats(testHoldSeatsRequest);

            // Assert
            verify(seatHoldService, times(1)).holdSeats(testHoldSeatsRequest);
            verifyNoMoreInteractions(seatHoldService);
        }

        @Test
        @DisplayName("Should call service once for release seats")
        void shouldCallServiceOnceForReleaseSeats() {
            // Arrange
            String sessionId = "session-123";
            Integer showtimeId = 1;
            List<Integer> seatIds = Arrays.asList(1, 2, 3);
            
            doNothing().when(seatHoldService).releaseSeats(sessionId, showtimeId, seatIds);

            // Act
            seatHoldController.releaseSeats(sessionId, showtimeId, seatIds);

            // Assert
            verify(seatHoldService, times(1)).releaseSeats(sessionId, showtimeId, seatIds);
            verifyNoMoreInteractions(seatHoldService);
        }

        @Test
        @DisplayName("Should call service once for extend hold")
        void shouldCallServiceOnceForExtendHold() {
            // Arrange
            String sessionId = "session-123";
            Integer showtimeId = 1;
            List<Integer> seatIds = Arrays.asList(1, 2);
            long additionalMinutes = 5L;
            
            doNothing().when(seatHoldService).extendHold(sessionId, showtimeId, seatIds, additionalMinutes);

            // Act
            seatHoldController.extendHold(sessionId, showtimeId, seatIds, additionalMinutes);

            // Assert
            verify(seatHoldService, times(1)).extendHold(sessionId, showtimeId, seatIds, additionalMinutes);
            verifyNoMoreInteractions(seatHoldService);
        }

        @Test
        @DisplayName("Should call service once for get availability")
        void shouldCallServiceOnceForGetAvailability() {
            // Arrange
            Integer showtimeId = 1;
            String sessionId = "session-123";
            
            when(seatHoldService.getSeatAvailability(showtimeId, sessionId))
                    .thenReturn(testSeatAvailabilityResponse);

            // Act
            seatHoldController.getSeatAvailability(showtimeId, sessionId);

            // Assert
            verify(seatHoldService, times(1)).getSeatAvailability(showtimeId, sessionId);
            verifyNoMoreInteractions(seatHoldService);
        }

        @Test
        @DisplayName("Should call service once for verify hold")
        void shouldCallServiceOnceForVerifyHold() {
            // Arrange
            Integer showtimeId = 1;
            String sessionId = "session-123";
            List<Integer> seatIds = Arrays.asList(1, 2, 3);
            
            Map<String, Object> verifyResult = new HashMap<>();
            verifyResult.put("allHeldBySession", true);
            
            when(seatHoldService.verifySeatsHeldBySession(showtimeId, seatIds, sessionId))
                    .thenReturn(verifyResult);

            // Act
            seatHoldController.verifyHold(showtimeId, sessionId, seatIds);

            // Assert
            verify(seatHoldService, times(1)).verifySeatsHeldBySession(showtimeId, seatIds, sessionId);
            verifyNoMoreInteractions(seatHoldService);
        }
    }
}
