package aws.movie_ticket_sales_web_project.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.Instant;

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

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.PaymentRequest;
import aws.movie_ticket_sales_web_project.dto.PaymentResponse;
import aws.movie_ticket_sales_web_project.service.PaymentService;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentController Unit Tests")
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private PaymentRequest testPaymentRequest;
    private PaymentResponse testPaymentResponse;

    @BeforeEach
    void setUp() {
        testPaymentRequest = PaymentRequest.builder()
                .bookingId(1)
                .build();

        testPaymentResponse = PaymentResponse.builder()
                .transactionId("TXN-123456")
                .bookingCode("BK-001")
                .status("COMPLETED")
                .amount(new BigDecimal("150000"))
                .paymentMethod("VNPAY")
                .paymentGatewayUrl("https://payment.vnpay.vn/pay")
                .qrCodeUrl("https://payment.vnpay.vn/qr/123")
                .paidAt(Instant.now())
                .message("Payment successful")
                .errorCode(null)
                .build();
    }

    @Nested
    @DisplayName("processPayment Tests")
    class ProcessPaymentTests {

        @Test
        @DisplayName("Should process payment successfully")
        void shouldProcessPaymentSuccessfully() {
            // Arrange
            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Payment processed successfully")
                    .data(testPaymentResponse)
                    .build();

            when(paymentService.processPayment(testPaymentRequest)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.processPayment(testPaymentRequest);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).isNotNull();
            assertThat(response.getBody().getData().getTransactionId()).isEqualTo("TXN-123456");
            assertThat(response.getBody().getData().getStatus()).isEqualTo("COMPLETED");
            assertThat(response.getBody().getData().getAmount()).isEqualByComparingTo(new BigDecimal("150000"));
            
            verify(paymentService).processPayment(testPaymentRequest);
        }

        @Test
        @DisplayName("Should process payment with pending status")
        void shouldProcessPaymentWithPendingStatus() {
            // Arrange
            PaymentResponse pendingResponse = PaymentResponse.builder()
                    .transactionId("TXN-789012")
                    .bookingCode("BK-002")
                    .status("PENDING")
                    .amount(new BigDecimal("200000"))
                    .paymentMethod("MOMO")
                    .paymentGatewayUrl("https://payment.momo.vn/pay")
                    .qrCodeUrl("https://payment.momo.vn/qr/456")
                    .paidAt(null)
                    .message("Awaiting payment")
                    .errorCode(null)
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Payment initiated")
                    .data(pendingResponse)
                    .build();

            when(paymentService.processPayment(testPaymentRequest)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.processPayment(testPaymentRequest);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getStatus()).isEqualTo("PENDING");
            assertThat(response.getBody().getData().getPaymentGatewayUrl()).isNotNull();
            
            verify(paymentService).processPayment(testPaymentRequest);
        }

        @Test
        @DisplayName("Should return failure when payment fails")
        void shouldReturnFailureWhenPaymentFails() {
            // Arrange
            PaymentResponse failedResponse = PaymentResponse.builder()
                    .transactionId("TXN-FAILED")
                    .bookingCode("BK-003")
                    .status("FAILED")
                    .amount(new BigDecimal("100000"))
                    .paymentMethod("CREDIT_CARD")
                    .message("Payment failed")
                    .errorCode("INSUFFICIENT_FUNDS")
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(false)
                    .message("Payment failed")
                    .data(failedResponse)
                    .build();

            when(paymentService.processPayment(any(PaymentRequest.class))).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.processPayment(testPaymentRequest);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getData().getStatus()).isEqualTo("FAILED");
            assertThat(response.getBody().getData().getErrorCode()).isEqualTo("INSUFFICIENT_FUNDS");
            
            verify(paymentService).processPayment(any(PaymentRequest.class));
        }

        @Test
        @DisplayName("Should process payment for different booking")
        void shouldProcessPaymentForDifferentBooking() {
            // Arrange
            PaymentRequest differentRequest = PaymentRequest.builder()
                    .bookingId(999)
                    .build();

            PaymentResponse differentResponse = PaymentResponse.builder()
                    .transactionId("TXN-999")
                    .bookingCode("BK-999")
                    .status("PROCESSING")
                    .amount(new BigDecimal("500000"))
                    .paymentMethod("BANK_TRANSFER")
                    .message("Processing payment")
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Payment is being processed")
                    .data(differentResponse)
                    .build();

            when(paymentService.processPayment(differentRequest)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.processPayment(differentRequest);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData().getBookingCode()).isEqualTo("BK-999");
            assertThat(response.getBody().getData().getStatus()).isEqualTo("PROCESSING");
            
            verify(paymentService).processPayment(differentRequest);
        }

        @Test
        @DisplayName("Should handle payment with QR code")
        void shouldHandlePaymentWithQrCode() {
            // Arrange
            PaymentResponse qrResponse = PaymentResponse.builder()
                    .transactionId("TXN-QR-001")
                    .bookingCode("BK-QR")
                    .status("PENDING")
                    .amount(new BigDecimal("250000"))
                    .paymentMethod("QR_CODE")
                    .qrCodeUrl("https://qr.payment.vn/scan/abc123")
                    .message("Scan QR to pay")
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("QR Code generated")
                    .data(qrResponse)
                    .build();

            when(paymentService.processPayment(testPaymentRequest)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.processPayment(testPaymentRequest);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData().getQrCodeUrl()).isNotNull();
            assertThat(response.getBody().getData().getQrCodeUrl()).contains("qr");
            
            verify(paymentService).processPayment(testPaymentRequest);
        }
    }

    @Nested
    @DisplayName("checkStatus Tests")
    class CheckStatusTests {

        @Test
        @DisplayName("Should return completed payment status")
        void shouldReturnCompletedPaymentStatus() {
            // Arrange
            String transactionId = "TXN-123456";
            
            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Payment status retrieved")
                    .data(testPaymentResponse)
                    .build();

            when(paymentService.checkPaymentStatus(transactionId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.checkStatus(transactionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getTransactionId()).isEqualTo(transactionId);
            assertThat(response.getBody().getData().getStatus()).isEqualTo("COMPLETED");
            
            verify(paymentService).checkPaymentStatus(transactionId);
        }

        @Test
        @DisplayName("Should return pending payment status")
        void shouldReturnPendingPaymentStatus() {
            // Arrange
            String transactionId = "TXN-PENDING-001";
            
            PaymentResponse pendingResponse = PaymentResponse.builder()
                    .transactionId(transactionId)
                    .bookingCode("BK-PENDING")
                    .status("PENDING")
                    .amount(new BigDecimal("300000"))
                    .paymentMethod("VNPAY")
                    .message("Payment pending")
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Payment is pending")
                    .data(pendingResponse)
                    .build();

            when(paymentService.checkPaymentStatus(transactionId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.checkStatus(transactionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData().getStatus()).isEqualTo("PENDING");
            assertThat(response.getBody().getData().getPaidAt()).isNull();
            
            verify(paymentService).checkPaymentStatus(transactionId);
        }

        @Test
        @DisplayName("Should return processing payment status")
        void shouldReturnProcessingPaymentStatus() {
            // Arrange
            String transactionId = "TXN-PROC-001";
            
            PaymentResponse processingResponse = PaymentResponse.builder()
                    .transactionId(transactionId)
                    .bookingCode("BK-PROC")
                    .status("PROCESSING")
                    .amount(new BigDecimal("450000"))
                    .paymentMethod("BANK_TRANSFER")
                    .message("Payment is being processed")
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Payment is processing")
                    .data(processingResponse)
                    .build();

            when(paymentService.checkPaymentStatus(transactionId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.checkStatus(transactionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData().getStatus()).isEqualTo("PROCESSING");
            
            verify(paymentService).checkPaymentStatus(transactionId);
        }

        @Test
        @DisplayName("Should return failed payment status")
        void shouldReturnFailedPaymentStatus() {
            // Arrange
            String transactionId = "TXN-FAILED-001";
            
            PaymentResponse failedResponse = PaymentResponse.builder()
                    .transactionId(transactionId)
                    .bookingCode("BK-FAIL")
                    .status("FAILED")
                    .amount(new BigDecimal("100000"))
                    .paymentMethod("CREDIT_CARD")
                    .message("Payment failed")
                    .errorCode("CARD_DECLINED")
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(false)
                    .message("Payment failed")
                    .data(failedResponse)
                    .build();

            when(paymentService.checkPaymentStatus(transactionId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.checkStatus(transactionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getData().getStatus()).isEqualTo("FAILED");
            assertThat(response.getBody().getData().getErrorCode()).isEqualTo("CARD_DECLINED");
            
            verify(paymentService).checkPaymentStatus(transactionId);
        }

        @Test
        @DisplayName("Should return cancelled payment status")
        void shouldReturnCancelledPaymentStatus() {
            // Arrange
            String transactionId = "TXN-CANCEL-001";
            
            PaymentResponse cancelledResponse = PaymentResponse.builder()
                    .transactionId(transactionId)
                    .bookingCode("BK-CANCEL")
                    .status("CANCELLED")
                    .amount(new BigDecimal("200000"))
                    .paymentMethod("MOMO")
                    .message("Payment cancelled by user")
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(false)
                    .message("Payment was cancelled")
                    .data(cancelledResponse)
                    .build();

            when(paymentService.checkPaymentStatus(transactionId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.checkStatus(transactionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData().getStatus()).isEqualTo("CANCELLED");
            
            verify(paymentService).checkPaymentStatus(transactionId);
        }

        @Test
        @DisplayName("Should handle transaction not found")
        void shouldHandleTransactionNotFound() {
            // Arrange
            String transactionId = "TXN-NOTFOUND";
            
            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(false)
                    .message("Transaction not found")
                    .data(null)
                    .build();

            when(paymentService.checkPaymentStatus(transactionId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.checkStatus(transactionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).isEqualTo("Transaction not found");
            assertThat(response.getBody().getData()).isNull();
            
            verify(paymentService).checkPaymentStatus(transactionId);
        }

        @Test
        @DisplayName("Should check status with different transaction ID formats")
        void shouldCheckStatusWithDifferentTransactionIdFormats() {
            // Arrange
            String transactionId = "VNP-20231215-ABC123";
            
            PaymentResponse vnpayResponse = PaymentResponse.builder()
                    .transactionId(transactionId)
                    .bookingCode("BK-VNP")
                    .status("COMPLETED")
                    .amount(new BigDecimal("175000"))
                    .paymentMethod("VNPAY")
                    .paidAt(Instant.now())
                    .message("Payment completed via VNPAY")
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Payment completed")
                    .data(vnpayResponse)
                    .build();

            when(paymentService.checkPaymentStatus(transactionId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PaymentResponse>> response = 
                    paymentController.checkStatus(transactionId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData().getTransactionId()).isEqualTo(transactionId);
            assertThat(response.getBody().getData().getPaidAt()).isNotNull();
            
            verify(paymentService).checkPaymentStatus(transactionId);
        }
    }

    @Nested
    @DisplayName("Service Interaction Tests")
    class ServiceInteractionTests {

        @Test
        @DisplayName("Should call payment service once for process payment")
        void shouldCallPaymentServiceOnceForProcessPayment() {
            // Arrange
            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Success")
                    .data(testPaymentResponse)
                    .build();

            when(paymentService.processPayment(testPaymentRequest)).thenReturn(expectedResponse);

            // Act
            paymentController.processPayment(testPaymentRequest);

            // Assert
            verify(paymentService, times(1)).processPayment(testPaymentRequest);
            verifyNoMoreInteractions(paymentService);
        }

        @Test
        @DisplayName("Should call payment service once for check status")
        void shouldCallPaymentServiceOnceForCheckStatus() {
            // Arrange
            String transactionId = "TXN-TEST";
            
            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Success")
                    .data(testPaymentResponse)
                    .build();

            when(paymentService.checkPaymentStatus(transactionId)).thenReturn(expectedResponse);

            // Act
            paymentController.checkStatus(transactionId);

            // Assert
            verify(paymentService, times(1)).checkPaymentStatus(transactionId);
            verifyNoMoreInteractions(paymentService);
        }

        @Test
        @DisplayName("Should pass exact request to service")
        void shouldPassExactRequestToService() {
            // Arrange
            PaymentRequest specificRequest = PaymentRequest.builder()
                    .bookingId(42)
                    .build();

            ApiResponse<PaymentResponse> expectedResponse = ApiResponse.<PaymentResponse>builder()
                    .success(true)
                    .message("Success")
                    .data(testPaymentResponse)
                    .build();

            when(paymentService.processPayment(specificRequest)).thenReturn(expectedResponse);

            // Act
            paymentController.processPayment(specificRequest);

            // Assert
            verify(paymentService).processPayment(argThat(request -> 
                request.getBookingId().equals(42)
            ));
        }
    }
}
