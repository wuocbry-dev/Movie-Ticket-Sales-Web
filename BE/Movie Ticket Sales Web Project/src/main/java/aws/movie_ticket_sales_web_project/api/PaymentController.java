package aws.movie_ticket_sales_web_project.api;


import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Process payment
     * POST /api/payments/process
     */
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @Valid @RequestBody PaymentRequest request) {
        log.info("Processing payment for booking: {}", request.getBookingId());
        ApiResponse<PaymentResponse> response = paymentService.processPayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Check payment status
     * GET /api/payments/status/{transactionId}
     */
    @GetMapping("/status/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> checkStatus(
            @PathVariable String transactionId) {
        ApiResponse<PaymentResponse> response = paymentService.checkPaymentStatus(transactionId);
        return ResponseEntity.ok(response);
    }
}
