package aws.movie_ticket_sales_web_project.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import aws.movie_ticket_sales_web_project.scheduler.BookingScheduler;

@ExtendWith(MockitoExtension.class)
@DisplayName("SchedulerTestController Unit Tests")
class SchedulerTestControllerTest {

    @Mock
    private BookingScheduler bookingScheduler;

    @InjectMocks
    private SchedulerTestController schedulerTestController;

    @Nested
    @DisplayName("triggerCancelExpiredBookings Tests")
    class TriggerCancelExpiredBookingsTests {

        @Test
        @DisplayName("Should trigger cancel expired bookings successfully")
        void shouldTriggerCancelExpiredBookingsSuccessfully() {
            // Arrange
            doNothing().when(bookingScheduler).cancelExpiredBookings();

            // Act
            ResponseEntity<?> response = schedulerTestController.triggerCancelExpiredBookings();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            verify(bookingScheduler).cancelExpiredBookings();
        }

        @Test
        @DisplayName("Should return correct response message")
        @SuppressWarnings("unchecked")
        void shouldReturnCorrectResponseMessage() {
            // Arrange
            doNothing().when(bookingScheduler).cancelExpiredBookings();

            // Act
            ResponseEntity<?> response = schedulerTestController.triggerCancelExpiredBookings();

            // Assert
            assertThat(response.getBody()).isInstanceOf(Map.class);
            Map<String, String> responseBody = (Map<String, String>) response.getBody();
            assertThat(responseBody).containsKey("message");
            assertThat(responseBody.get("message")).isEqualTo("Expired bookings cancellation triggered");
            
            verify(bookingScheduler).cancelExpiredBookings();
        }

        @Test
        @DisplayName("Should call booking scheduler exactly once")
        void shouldCallBookingSchedulerExactlyOnce() {
            // Arrange
            doNothing().when(bookingScheduler).cancelExpiredBookings();

            // Act
            schedulerTestController.triggerCancelExpiredBookings();

            // Assert
            verify(bookingScheduler, times(1)).cancelExpiredBookings();
            verifyNoMoreInteractions(bookingScheduler);
        }

        @Test
        @DisplayName("Should return OK status even when scheduler completes quickly")
        void shouldReturnOkStatusWhenSchedulerCompletesQuickly() {
            // Arrange
            doNothing().when(bookingScheduler).cancelExpiredBookings();

            // Act
            ResponseEntity<?> response = schedulerTestController.triggerCancelExpiredBookings();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            verify(bookingScheduler).cancelExpiredBookings();
        }

        @Test
        @DisplayName("Should propagate exception from scheduler")
        void shouldPropagateExceptionFromScheduler() {
            // Arrange
            RuntimeException expectedException = new RuntimeException("Scheduler error");
            doThrow(expectedException).when(bookingScheduler).cancelExpiredBookings();

            // Act & Assert
            try {
                schedulerTestController.triggerCancelExpiredBookings();
                // If no exception, fail the test
                assertThat(true).isFalse().as("Expected exception to be thrown");
            } catch (RuntimeException e) {
                assertThat(e.getMessage()).isEqualTo("Scheduler error");
            }
            
            verify(bookingScheduler).cancelExpiredBookings();
        }

        @Test
        @DisplayName("Should handle multiple consecutive calls")
        void shouldHandleMultipleConsecutiveCalls() {
            // Arrange
            doNothing().when(bookingScheduler).cancelExpiredBookings();

            // Act
            ResponseEntity<?> response1 = schedulerTestController.triggerCancelExpiredBookings();
            ResponseEntity<?> response2 = schedulerTestController.triggerCancelExpiredBookings();
            ResponseEntity<?> response3 = schedulerTestController.triggerCancelExpiredBookings();

            // Assert
            assertThat(response1.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response2.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response3.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            verify(bookingScheduler, times(3)).cancelExpiredBookings();
        }

        @Test
        @DisplayName("Should return non-null response body")
        void shouldReturnNonNullResponseBody() {
            // Arrange
            doNothing().when(bookingScheduler).cancelExpiredBookings();

            // Act
            ResponseEntity<?> response = schedulerTestController.triggerCancelExpiredBookings();

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getBody()).isNotNull();
            
            verify(bookingScheduler).cancelExpiredBookings();
        }
    }

    @Nested
    @DisplayName("Service Interaction Tests")
    class ServiceInteractionTests {

        @Test
        @DisplayName("Should interact with booking scheduler dependency")
        void shouldInteractWithBookingSchedulerDependency() {
            // Arrange
            doNothing().when(bookingScheduler).cancelExpiredBookings();

            // Act
            schedulerTestController.triggerCancelExpiredBookings();

            // Assert
            verify(bookingScheduler).cancelExpiredBookings();
        }

        @Test
        @DisplayName("Should not interact with other methods on scheduler")
        void shouldNotInteractWithOtherMethodsOnScheduler() {
            // Arrange
            doNothing().when(bookingScheduler).cancelExpiredBookings();

            // Act
            schedulerTestController.triggerCancelExpiredBookings();

            // Assert
            verify(bookingScheduler, only()).cancelExpiredBookings();
        }
    }
}
