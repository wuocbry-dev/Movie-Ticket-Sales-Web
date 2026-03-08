package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.EmailRequest;
import aws.movie_ticket_sales_web_project.entity.Booking;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

/**
 * Email Service using SNS -> Lambda -> SES architecture
 * Instead of sending emails directly via SMTP, this service publishes messages to SNS
 * A Lambda function subscribes to the SNS topic and sends emails via SES
 */
@Service
@Slf4j
public class EmailService {
    
    private SnsClient snsClient;
    private final ObjectMapper objectMapper;
    
    @Value("${aws.sns.email-topic-arn:}")
    private String emailTopicArn;
    
    @Value("${aws.region:ap-southeast-1}")
    private String awsRegion;
    
    @Value("${spring.mail.username:noreply@movieticket.com}")
    private String fromEmail;
    
    @Value("${email.service.enabled:true}")
    private boolean emailServiceEnabled;
    
    public EmailService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    @PostConstruct
    public void init() {
        if (emailServiceEnabled && emailTopicArn != null && !emailTopicArn.isEmpty()) {
            try {
                this.snsClient = SnsClient.builder()
                        .region(Region.of(awsRegion))
                        .build();
                log.info("SNS Client initialized for email service. Topic ARN: {}", emailTopicArn);
            } catch (Exception e) {
                log.warn("Failed to initialize SNS Client. Email service will be disabled. Error: {}", e.getMessage());
                this.emailServiceEnabled = false;
            }
        } else {
            log.warn("Email service is disabled or SNS Topic ARN is not configured");
        }
    }
    
    /**
     * Send booking confirmation email (async)
     * Publishes message to SNS Topic for Lambda to process
     */
    @Async
    public void sendBookingConfirmation(Booking booking) {
        if (!emailServiceEnabled) {
            log.warn("Email service is disabled. Skipping booking confirmation for: {}", booking.getBookingCode());
            return;
        }
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("customerName", booking.getCustomerName());
            templateData.put("customerEmail", booking.getCustomerEmail());
            templateData.put("bookingCode", booking.getBookingCode());
            templateData.put("movieTitle", booking.getShowtime().getMovie().getTitle());
            templateData.put("cinemaName", booking.getShowtime().getHall().getCinema().getCinemaName());
            templateData.put("hallName", booking.getShowtime().getHall().getHallName());
            templateData.put("showDate", booking.getShowtime().getShowDate().toString());
            templateData.put("startTime", booking.getShowtime().getStartTime().toString());
            templateData.put("totalSeats", booking.getTotalSeats());
            templateData.put("totalAmount", booking.getTotalAmount().longValue());
            templateData.put("qrCodeUrl", booking.getQrCode());
            
            EmailRequest emailRequest = EmailRequest.builder()
                    .emailType(EmailRequest.EmailType.BOOKING_CONFIRMATION)
                    .toEmail(booking.getCustomerEmail())
                    .subject("🎬 Xác nhận đặt vé - " + booking.getBookingCode())
                    .templateData(templateData)
                    .build();
            
            publishToSns(emailRequest);
            log.info("Booking confirmation email request published to SNS for: {}", booking.getCustomerEmail());
            
        } catch (Exception e) {
            log.error("Error publishing booking confirmation to SNS for booking: {}", booking.getBookingCode(), e);
        }
    }
    
    /**
     * Send refund confirmation email
     */
    @Async
    public void sendRefundConfirmation(Booking booking) {
        if (!emailServiceEnabled) {
            log.warn("Email service is disabled. Skipping refund confirmation for: {}", booking.getBookingCode());
            return;
        }
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("customerName", booking.getCustomerName());
            templateData.put("customerEmail", booking.getCustomerEmail());
            templateData.put("bookingCode", booking.getBookingCode());
            templateData.put("refundAmount", booking.getTotalAmount().longValue());
            
            EmailRequest emailRequest = EmailRequest.builder()
                    .emailType(EmailRequest.EmailType.REFUND_CONFIRMATION)
                    .toEmail(booking.getCustomerEmail())
                    .subject("Xác nhận hoàn tiền - " + booking.getBookingCode())
                    .templateData(templateData)
                    .build();
            
            publishToSns(emailRequest);
            log.info("Refund confirmation email request published to SNS for: {}", booking.getCustomerEmail());
            
        } catch (Exception e) {
            log.error("Error publishing refund email to SNS for booking: {}", booking.getBookingCode(), e);
        }
    }
    
    /**
     * Gửi email reset password với mã xác nhận
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetCode, String fullName) {
        if (!emailServiceEnabled) {
            log.warn("Email service is disabled. Skipping password reset email for: {}", toEmail);
            throw new RuntimeException("Email service is currently unavailable. Please try again later.");
        }
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("fullName", fullName != null && !fullName.isBlank() ? fullName : "Quý khách");
            templateData.put("resetCode", resetCode);
            templateData.put("email", toEmail);
            
            EmailRequest emailRequest = EmailRequest.builder()
                    .emailType(EmailRequest.EmailType.PASSWORD_RESET)
                    .toEmail(toEmail)
                    .subject("🎬 CineTicket - Mã Xác Nhận Đặt Lại Mật Khẩu")
                    .templateData(templateData)
                    .build();
            
            publishToSns(emailRequest);
            log.info("Password reset email request published to SNS for: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to publish password reset email to SNS for: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }
    
    /**
     * Publish email request to SNS Topic
     */
    private void publishToSns(EmailRequest emailRequest) throws JsonProcessingException {
        if (snsClient == null) {
            throw new RuntimeException("SNS Client is not initialized");
        }
        
        String message = objectMapper.writeValueAsString(emailRequest);
        
        PublishRequest publishRequest = PublishRequest.builder()
                .topicArn(emailTopicArn)
                .message(message)
                .subject("Email Request: " + emailRequest.getEmailType())
                .build();
        
        PublishResponse response = snsClient.publish(publishRequest);
        log.debug("SNS publish response - MessageId: {}", response.messageId());
    }
}
