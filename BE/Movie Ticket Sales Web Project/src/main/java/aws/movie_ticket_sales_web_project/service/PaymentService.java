package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.PaymentRequest;
import aws.movie_ticket_sales_web_project.dto.PaymentResponse;
import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.entity.Ticket;
import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import aws.movie_ticket_sales_web_project.repository.BookingRepository;
import aws.movie_ticket_sales_web_project.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final QRCodeService qrCodeService;
    private final EmailService emailService;
    private final LoyaltyPointsService loyaltyPointsService;
    
    /**
     * Process payment for a booking
     */
    @Transactional
    public ApiResponse<PaymentResponse> processPayment(PaymentRequest request) {
        try {
            // Find booking
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Validate booking status
            if (booking.getStatus() != StatusBooking.PENDING && booking.getStatus() != StatusBooking.CONFIRMED) {
                return ApiResponse.<PaymentResponse>builder()
                        .success(false)
                        .message("Booking is not available for payment")
                        .build();
            }
            
            // Check if already paid
            if (booking.getPaymentStatus() == PaymentStatus.COMPLETED) {
                return ApiResponse.<PaymentResponse>builder()
                        .success(false)
                        .message("Booking has already been paid")
                        .build();
            }
            
            // Check if booking is expired
            if (booking.getHoldExpiresAt() != null && Instant.now().isAfter(booking.getHoldExpiresAt())) {
                return ApiResponse.<PaymentResponse>builder()
                        .success(false)
                        .message("Booking has expired")
                        .build();
            }
            
            // Generate transaction ID
            String transactionId = "TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            // Assume payment is successful (for bank transfer, payment is confirmed manually)
            boolean paymentSuccess = true;
            
            if (paymentSuccess) {
                // Update booking status
                booking.setStatus(StatusBooking.PAID);
                booking.setPaymentStatus(PaymentStatus.COMPLETED);
                booking.setPaidAt(Instant.now());
                booking.setPaymentReference(transactionId);
                // Use existing payment method from booking
                if (booking.getPaymentMethod() == null) {
                    booking.setPaymentMethod("BANK_TRANSFER");
                }
                booking.setUpdatedAt(Instant.now());
                
                // Update ticket status
                List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
                tickets.forEach(ticket -> ticket.setStatus(TicketStatus.PAID));
                ticketRepository.saveAll(tickets);
                
                bookingRepository.save(booking);
                
                // Generate QR Code
                String qrCodeUrl = null;
                try {
                    qrCodeUrl = qrCodeService.generateQRCode(booking.getBookingCode());
                    booking.setQrCode(qrCodeUrl);
                    log.info("QR Code URL set for booking {}: {}", booking.getBookingCode(), qrCodeUrl);
                } catch (Exception e) {
                    log.error("Failed to generate QR code for booking: {}", booking.getBookingCode(), e);
                    // Continue with payment even if QR generation fails
                }
                
                // Generate Invoice
                String invoiceNumber = "INV" + Instant.now().toEpochMilli();
                booking.setInvoiceNumber(invoiceNumber);
                booking.setInvoiceIssuedAt(Instant.now());
                bookingRepository.save(booking);
                
                // Send confirmation email (async) - don't fail payment if email fails
                try {
                    emailService.sendBookingConfirmation(booking);
                } catch (Exception e) {
                    log.warn("Failed to send confirmation email for booking: {}. Payment was successful.", booking.getBookingCode(), e);
                }
                
                // Tích điểm cho user
                try {
                    Integer earnedPoints = loyaltyPointsService.earnPointsFromBooking(booking);
                    log.info("💎 User earned {} loyalty points from booking {}", earnedPoints, booking.getBookingCode());
                } catch (Exception e) {
                    log.error("Failed to earn loyalty points for booking: {}. Payment was successful.", booking.getBookingCode(), e);
                }
                
                log.info("Payment processed successfully for booking: {}", booking.getBookingCode());
                
                PaymentResponse paymentResponse = PaymentResponse.builder()
                        .transactionId(transactionId)
                        .bookingCode(booking.getBookingCode())
                        .status("COMPLETED")
                        .amount(booking.getTotalAmount())
                        .paymentMethod(booking.getPaymentMethod())
                        .qrCodeUrl(qrCodeUrl)
                        .paidAt(Instant.now())
                        .message("Payment successful")
                        .build();
                
                return ApiResponse.<PaymentResponse>builder()
                        .success(true)
                        .message("Payment processed successfully")
                        .data(paymentResponse)
                        .build();
                
            } else {
                // Payment failed
                booking.setPaymentStatus(PaymentStatus.FAILED);
                booking.setUpdatedAt(Instant.now());
                bookingRepository.save(booking);
                
                PaymentResponse paymentResponse = PaymentResponse.builder()
                        .transactionId(transactionId)
                        .bookingCode(booking.getBookingCode())
                        .status("FAILED")
                        .amount(booking.getTotalAmount())
                        .message("Payment failed")
                        .errorCode("PAYMENT_GATEWAY_ERROR")
                        .build();
                
                return ApiResponse.<PaymentResponse>builder()
                        .success(false)
                        .message("Payment failed")
                        .data(paymentResponse)
                        .build();
            }
            
        } catch (Exception e) {
            log.error("Error processing payment", e);
            return ApiResponse.<PaymentResponse>builder()
                    .success(false)
                    .message("Failed to process payment: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Check payment status
     */
    public ApiResponse<PaymentResponse> checkPaymentStatus(String transactionId) {
        // In production: Query payment gateway for transaction status
        // For now, return mock response
        return ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment status retrieved")
                .data(PaymentResponse.builder()
                        .transactionId(transactionId)
                        .status("COMPLETED")
                        .build())
                .build();
    }
}
