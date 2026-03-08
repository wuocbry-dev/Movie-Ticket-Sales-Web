package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import aws.movie_ticket_sales_web_project.service.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingController Unit Tests")
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController).build();
        objectMapper = new ObjectMapper();
    }

    private BookingDto createTestBookingDto() {
        return BookingDto.builder()
                .bookingId(1)
                .bookingCode("BK123456")
                .userId(1)
                .username("testuser")
                .customerName("Test User")
                .customerEmail("test@example.com")
                .customerPhone("0123456789")
                .showtimeId(1)
                .movieTitle("Test Movie")
                .cinemaName("Test Cinema")
                .hallName("Hall 1")
                .showDate("2025-12-10")
                .startTime("18:00")
                .formatType("2D")
                .bookingDate(Instant.now())
                .totalSeats(2)
                .subtotal(new BigDecimal("200000"))
                .discountAmount(new BigDecimal("0"))
                .taxAmount(new BigDecimal("20000"))
                .serviceFee(new BigDecimal("10000"))
                .totalAmount(new BigDecimal("230000"))
                .pointsUsed(0)
                .pointsDiscount(new BigDecimal("0"))
                .status(StatusBooking.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod("CASH")
                .tickets(new ArrayList<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private PagedBookingResponse createTestPagedResponse() {
        BookingDto booking = createTestBookingDto();
        return PagedBookingResponse.builder()
                .totalElements(1L)
                .totalPages(1)
                .currentPage(0)
                .pageSize(10)
                .hasNext(false)
                .hasPrevious(false)
                .data(Arrays.asList(booking))
                .build();
    }

    @Nested
    @DisplayName("getAllBookings Tests")
    class GetAllBookingsTests {

        @Test
        @DisplayName("Should return all bookings without status filter")
        void shouldReturnAllBookingsWithoutStatusFilter() {
            // Arrange
            PagedBookingResponse expectedResponse = createTestPagedResponse();
            when(bookingService.getAllBookings(0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<PagedBookingResponse> response = bookingController.getAllBookings(0, 10, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getTotalElements()).isEqualTo(1L);
            verify(bookingService).getAllBookings(0, 10);
            verify(bookingService, never()).getBookingsByStatus(any(), anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should return bookings filtered by status")
        void shouldReturnBookingsFilteredByStatus() {
            // Arrange
            PagedBookingResponse expectedResponse = createTestPagedResponse();
            when(bookingService.getBookingsByStatus(StatusBooking.PENDING, 0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<PagedBookingResponse> response = bookingController.getAllBookings(0, 10, StatusBooking.PENDING);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getTotalElements()).isEqualTo(1L);
            verify(bookingService).getBookingsByStatus(StatusBooking.PENDING, 0, 10);
            verify(bookingService, never()).getAllBookings(anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should handle exception when getting all bookings")
        void shouldHandleExceptionWhenGettingAllBookings() {
            // Arrange
            when(bookingService.getAllBookings(0, 10)).thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<PagedBookingResponse> response = bookingController.getAllBookings(0, 10, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNull();
        }
    }

    @Nested
    @DisplayName("getBookingById Tests")
    class GetBookingByIdTests {

        @Test
        @DisplayName("Should return booking by ID successfully")
        void shouldReturnBookingByIdSuccessfully() {
            // Arrange
            BookingDto expectedBooking = createTestBookingDto();
            when(bookingService.getBookingById(1)).thenReturn(expectedBooking);

            // Act
            ResponseEntity<?> response = bookingController.getBookingById(1);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isInstanceOf(BookingDto.class);
            BookingDto actualBooking = (BookingDto) response.getBody();
            assertThat(actualBooking.getBookingId()).isEqualTo(1);
            assertThat(actualBooking.getBookingCode()).isEqualTo("BK123456");
        }

        @Test
        @DisplayName("Should return NOT_FOUND when booking doesn't exist")
        void shouldReturnNotFoundWhenBookingDoesNotExist() {
            // Arrange
            when(bookingService.getBookingById(999)).thenThrow(new RuntimeException("Booking not found"));

            // Act
            ResponseEntity<?> response = bookingController.getBookingById(999);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isInstanceOf(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> errorResponse = (Map<String, Object>) response.getBody();
            assertThat(errorResponse.get("success")).isEqualTo(false);
        }

        @Test
        @DisplayName("Should handle general exception")
        void shouldHandleGeneralException() {
            // Arrange
            // NullPointerException extends RuntimeException, so it's caught by the RuntimeException catch block
            when(bookingService.getBookingById(1)).thenThrow(new NullPointerException("Unexpected error"));

            // Act
            ResponseEntity<?> response = bookingController.getBookingById(1);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("getBookingByCode Tests")
    class GetBookingByCodeTests {

        @Test
        @DisplayName("Should return booking by code successfully")
        void shouldReturnBookingByCodeSuccessfully() {
            // Arrange
            BookingDto expectedBooking = createTestBookingDto();
            when(bookingService.getBookingByCode("BK123456")).thenReturn(expectedBooking);

            // Act
            ResponseEntity<?> response = bookingController.getBookingByCode("BK123456");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isInstanceOf(BookingDto.class);
            BookingDto actualBooking = (BookingDto) response.getBody();
            assertThat(actualBooking.getBookingCode()).isEqualTo("BK123456");
        }

        @Test
        @DisplayName("Should return NOT_FOUND for invalid booking code")
        void shouldReturnNotFoundForInvalidBookingCode() {
            // Arrange
            when(bookingService.getBookingByCode("INVALID")).thenThrow(new RuntimeException("Booking not found"));

            // Act
            ResponseEntity<?> response = bookingController.getBookingByCode("INVALID");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("Should handle general exception")
        void shouldHandleGeneralException() {
            // Arrange
            // NullPointerException extends RuntimeException, so it's caught by the RuntimeException catch block
            when(bookingService.getBookingByCode("BK123456")).thenThrow(new NullPointerException("Unexpected error"));

            // Act
            ResponseEntity<?> response = bookingController.getBookingByCode("BK123456");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("getBookingsByUserId Tests")
    class GetBookingsByUserIdTests {

        @Test
        @DisplayName("Should return bookings for user successfully")
        void shouldReturnBookingsForUserSuccessfully() {
            // Arrange
            PagedBookingResponse expectedResponse = createTestPagedResponse();
            when(bookingService.getBookingsByUserId(1, 0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<?> response = bookingController.getBookingsByUserId(1, 0, 10);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isInstanceOf(PagedBookingResponse.class);
            PagedBookingResponse actualResponse = (PagedBookingResponse) response.getBody();
            assertThat(actualResponse.getTotalElements()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should handle exception when getting bookings by user ID")
        void shouldHandleExceptionWhenGettingBookingsByUserId() {
            // Arrange
            when(bookingService.getBookingsByUserId(1, 0, 10)).thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<?> response = bookingController.getBookingsByUserId(1, 0, 10);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isInstanceOf(Map.class);
        }
    }

    @Nested
    @DisplayName("getBookingsByStatus Tests")
    class GetBookingsByStatusTests {

        @Test
        @DisplayName("Should return bookings by status successfully")
        void shouldReturnBookingsByStatusSuccessfully() {
            // Arrange
            PagedBookingResponse expectedResponse = createTestPagedResponse();
            when(bookingService.getBookingsByStatus(StatusBooking.PENDING, 0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<?> response = bookingController.getBookingsByStatus(StatusBooking.PENDING, 0, 10);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isInstanceOf(PagedBookingResponse.class);
        }

        @Test
        @DisplayName("Should handle exception when getting bookings by status")
        void shouldHandleExceptionWhenGettingBookingsByStatus() {
            // Arrange
            when(bookingService.getBookingsByStatus(StatusBooking.PENDING, 0, 10))
                    .thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<?> response = bookingController.getBookingsByStatus(StatusBooking.PENDING, 0, 10);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Nested
    @DisplayName("getBookingsByShowtimeId Tests")
    class GetBookingsByShowtimeIdTests {

        @Test
        @DisplayName("Should return bookings by showtime ID successfully")
        void shouldReturnBookingsByShowtimeIdSuccessfully() {
            // Arrange
            PagedBookingResponse expectedResponse = createTestPagedResponse();
            when(bookingService.getBookingsByShowtimeId(1, 0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<?> response = bookingController.getBookingsByShowtimeId(1, 0, 10);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isInstanceOf(PagedBookingResponse.class);
        }

        @Test
        @DisplayName("Should handle exception when getting bookings by showtime ID")
        void shouldHandleExceptionWhenGettingBookingsByShowtimeId() {
            // Arrange
            when(bookingService.getBookingsByShowtimeId(1, 0, 10)).thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<?> response = bookingController.getBookingsByShowtimeId(1, 0, 10);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Nested
    @DisplayName("createBooking Tests")
    class CreateBookingTests {

        @Test
        @DisplayName("Should create booking successfully")
        void shouldCreateBookingSuccessfully() {
            // Arrange
            CreateBookingRequest request = CreateBookingRequest.builder()
                    .userId(1)
                    .showtimeId(1)
                    .seatIds(Arrays.asList(1, 2))
                    .sessionId("session123")
                    .paymentMethod("CASH")
                    .build();

            BookingDto expectedBooking = createTestBookingDto();
            when(bookingService.createBooking(any(CreateBookingRequest.class))).thenReturn(expectedBooking);

            // Act
            ResponseEntity<?> response = bookingController.createBooking(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isInstanceOf(BookingDto.class);
            BookingDto actualBooking = (BookingDto) response.getBody();
            assertThat(actualBooking.getBookingId()).isEqualTo(1);
            verify(bookingService).createBooking(any(CreateBookingRequest.class));
        }

        @Test
        @DisplayName("Should handle RuntimeException when creating booking")
        void shouldHandleRuntimeExceptionWhenCreatingBooking() {
            // Arrange
            CreateBookingRequest request = CreateBookingRequest.builder()
                    .userId(1)
                    .showtimeId(1)
                    .seatIds(Arrays.asList(1, 2))
                    .sessionId("session123")
                    .paymentMethod("CASH")
                    .build();

            when(bookingService.createBooking(any(CreateBookingRequest.class)))
                    .thenThrow(new RuntimeException("Seats already booked"));

            // Act
            ResponseEntity<?> response = bookingController.createBooking(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isInstanceOf(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> errorResponse = (Map<String, Object>) response.getBody();
            assertThat(errorResponse.get("success")).isEqualTo(false);
            assertThat(errorResponse.get("message")).isEqualTo("Seats already booked");
        }

        @Test
        @DisplayName("Should handle general exception when creating booking")
        void shouldHandleGeneralExceptionWhenCreatingBooking() {
            // Arrange
            CreateBookingRequest request = CreateBookingRequest.builder()
                    .userId(1)
                    .showtimeId(1)
                    .seatIds(Arrays.asList(1, 2))
                    .sessionId("session123")
                    .paymentMethod("CASH")
                    .build();

            // NullPointerException extends RuntimeException, so it's caught by the RuntimeException catch block
            when(bookingService.createBooking(any(CreateBookingRequest.class)))
                    .thenThrow(new NullPointerException("Unexpected error"));

            // Act
            ResponseEntity<?> response = bookingController.createBooking(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            @SuppressWarnings("unchecked")
            Map<String, Object> errorResponse = (Map<String, Object>) response.getBody();
            assertThat(errorResponse.get("message")).isEqualTo("Unexpected error");
        }

        @Test
        @DisplayName("Should create booking with concession items")
        void shouldCreateBookingWithConcessionItems() {
            // Arrange
            List<CreateBookingRequest.ConcessionItemRequest> concessionItems = Arrays.asList(
                    CreateBookingRequest.ConcessionItemRequest.builder()
                            .itemId(1)
                            .quantity(2)
                            .price(new BigDecimal("50000"))
                            .build()
            );

            CreateBookingRequest request = CreateBookingRequest.builder()
                    .userId(1)
                    .showtimeId(1)
                    .seatIds(Arrays.asList(1, 2))
                    .sessionId("session123")
                    .paymentMethod("CASH")
                    .concessionItems(concessionItems)
                    .build();

            BookingDto expectedBooking = createTestBookingDto();
            when(bookingService.createBooking(any(CreateBookingRequest.class))).thenReturn(expectedBooking);

            // Act
            ResponseEntity<?> response = bookingController.createBooking(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            verify(bookingService).createBooking(any(CreateBookingRequest.class));
        }

        @Test
        @DisplayName("Should create booking with points redemption")
        void shouldCreateBookingWithPointsRedemption() {
            // Arrange
            CreateBookingRequest request = CreateBookingRequest.builder()
                    .userId(1)
                    .showtimeId(1)
                    .seatIds(Arrays.asList(1, 2))
                    .sessionId("session123")
                    .paymentMethod("CASH")
                    .pointsToUse(50)
                    .build();

            BookingDto expectedBooking = createTestBookingDto();
            expectedBooking.setPointsUsed(50);
            expectedBooking.setPointsDiscount(new BigDecimal("50000"));
            when(bookingService.createBooking(any(CreateBookingRequest.class))).thenReturn(expectedBooking);

            // Act
            ResponseEntity<?> response = bookingController.createBooking(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            BookingDto actualBooking = (BookingDto) response.getBody();
            assertThat(actualBooking.getPointsUsed()).isEqualTo(50);
        }
    }

    @Nested
    @DisplayName("updateBooking Tests")
    class UpdateBookingTests {

        @Test
        @DisplayName("Should update booking successfully")
        void shouldUpdateBookingSuccessfully() {
            // Arrange
            UpdateBookingRequest request = UpdateBookingRequest.builder()
                    .status(StatusBooking.CONFIRMED)
                    .paymentStatus(PaymentStatus.COMPLETED)
                    .build();

            BookingDto expectedBooking = createTestBookingDto();
            expectedBooking.setStatus(StatusBooking.CONFIRMED);
            expectedBooking.setPaymentStatus(PaymentStatus.COMPLETED);

            when(bookingService.updateBooking(eq(1), any(UpdateBookingRequest.class))).thenReturn(expectedBooking);

            // Act
            ResponseEntity<?> response = bookingController.updateBooking(1, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isInstanceOf(BookingDto.class);
            BookingDto actualBooking = (BookingDto) response.getBody();
            assertThat(actualBooking.getStatus()).isEqualTo(StatusBooking.CONFIRMED);
            assertThat(actualBooking.getPaymentStatus()).isEqualTo(PaymentStatus.COMPLETED);
        }

        @Test
        @DisplayName("Should handle RuntimeException when updating booking")
        void shouldHandleRuntimeExceptionWhenUpdatingBooking() {
            // Arrange
            UpdateBookingRequest request = UpdateBookingRequest.builder()
                    .status(StatusBooking.CONFIRMED)
                    .build();

            when(bookingService.updateBooking(eq(1), any(UpdateBookingRequest.class)))
                    .thenThrow(new RuntimeException("Booking not found"));

            // Act
            ResponseEntity<?> response = bookingController.updateBooking(1, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isInstanceOf(Map.class);
        }

        @Test
        @DisplayName("Should handle general exception when updating booking")
        void shouldHandleGeneralExceptionWhenUpdatingBooking() {
            // Arrange
            UpdateBookingRequest request = UpdateBookingRequest.builder()
                    .status(StatusBooking.CONFIRMED)
                    .build();

            // NullPointerException extends RuntimeException, so it's caught by the RuntimeException catch block
            when(bookingService.updateBooking(eq(1), any(UpdateBookingRequest.class)))
                    .thenThrow(new NullPointerException("Unexpected error"));

            // Act
            ResponseEntity<?> response = bookingController.updateBooking(1, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Nested
    @DisplayName("cancelBooking Tests")
    class CancelBookingTests {

        @Test
        @DisplayName("Should cancel booking successfully")
        void shouldCancelBookingSuccessfully() {
            // Arrange
            doNothing().when(bookingService).cancelBooking(1);

            // Act
            ResponseEntity<?> response = bookingController.cancelBooking(1);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isInstanceOf(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> successResponse = (Map<String, Object>) response.getBody();
            assertThat(successResponse.get("success")).isEqualTo(true);
            assertThat(successResponse.get("message")).isEqualTo("Booking cancelled successfully");
            verify(bookingService).cancelBooking(1);
        }

        @Test
        @DisplayName("Should handle RuntimeException when cancelling booking")
        void shouldHandleRuntimeExceptionWhenCancellingBooking() {
            // Arrange
            doThrow(new RuntimeException("Cannot cancel confirmed booking")).when(bookingService).cancelBooking(1);

            // Act
            ResponseEntity<?> response = bookingController.cancelBooking(1);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isInstanceOf(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> errorResponse = (Map<String, Object>) response.getBody();
            assertThat(errorResponse.get("success")).isEqualTo(false);
            assertThat(errorResponse.get("message")).isEqualTo("Cannot cancel confirmed booking");
        }

        @Test
        @DisplayName("Should handle general exception when cancelling booking")
        void shouldHandleGeneralExceptionWhenCancellingBooking() {
            // Arrange
            // NullPointerException extends RuntimeException, so it's caught by the RuntimeException catch block
            doThrow(new NullPointerException("Unexpected error")).when(bookingService).cancelBooking(1);

            // Act
            ResponseEntity<?> response = bookingController.cancelBooking(1);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Nested
    @DisplayName("deleteBooking Tests")
    class DeleteBookingTests {

        @Test
        @DisplayName("Should delete booking successfully")
        void shouldDeleteBookingSuccessfully() {
            // Arrange
            doNothing().when(bookingService).deleteBooking(1);

            // Act
            ResponseEntity<?> response = bookingController.deleteBooking(1);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isInstanceOf(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> successResponse = (Map<String, Object>) response.getBody();
            assertThat(successResponse.get("success")).isEqualTo(true);
            assertThat(successResponse.get("message")).isEqualTo("Booking deleted successfully");
            verify(bookingService).deleteBooking(1);
        }

        @Test
        @DisplayName("Should handle RuntimeException when deleting booking")
        void shouldHandleRuntimeExceptionWhenDeletingBooking() {
            // Arrange
            doThrow(new RuntimeException("Booking not found")).when(bookingService).deleteBooking(999);

            // Act
            ResponseEntity<?> response = bookingController.deleteBooking(999);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isInstanceOf(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> errorResponse = (Map<String, Object>) response.getBody();
            assertThat(errorResponse.get("success")).isEqualTo(false);
        }

        @Test
        @DisplayName("Should handle general exception when deleting booking")
        void shouldHandleGeneralExceptionWhenDeletingBooking() {
            // Arrange
            // NullPointerException extends RuntimeException, so it's caught by the RuntimeException catch block
            doThrow(new NullPointerException("Unexpected error")).when(bookingService).deleteBooking(1);

            // Act
            ResponseEntity<?> response = bookingController.deleteBooking(1);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }
}
