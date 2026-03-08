package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

/**
 * Simple invoice service
 * For production, use iText PDF or JasperReports
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {
    
    /**
     * Generate invoice PDF
     * This is a simplified version - in production use iText or JasperReports
     */
    public byte[] generateInvoicePdf(Booking booking) {
        try {
            // For now, return empty byte array
            // In production: Use iText PDF library to generate proper invoice
            log.info("Generating invoice for booking: {}", booking.getBookingCode());
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            // Add PDF generation logic here
            
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            log.error("Error generating invoice for booking: {}", booking.getBookingCode(), e);
            return new byte[0];
        }
    }
    
    /**
     * Generate invoice HTML (for email)
     */
    public String generateInvoiceHtml(Booking booking) {
        return String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
                <h2 style="text-align: center; color: #333;">HÓA ĐƠN ĐẶT VÉ</h2>
                <hr>
                <p><strong>Mã đặt vé:</strong> %s</p>
                <p><strong>Mã hóa đơn:</strong> %s</p>
                <p><strong>Ngày đặt:</strong> %s</p>
                <p><strong>Khách hàng:</strong> %s</p>
                <p><strong>Email:</strong> %s</p>
                <p><strong>Điện thoại:</strong> %s</p>
                <hr>
                <h3>Thông tin suất chiếu</h3>
                <p><strong>Phim:</strong> %s</p>
                <p><strong>Rạp:</strong> %s - %s</p>
                <p><strong>Ngày chiếu:</strong> %s</p>
                <p><strong>Giờ chiếu:</strong> %s</p>
                <p><strong>Số ghế:</strong> %d</p>
                <hr>
                <h3>Thành tiền</h3>
                <p><strong>Tạm tính:</strong> %,d VNĐ</p>
                <p><strong>Phí dịch vụ:</strong> %,d VNĐ</p>
                <p><strong>Thuế:</strong> %,d VNĐ</p>
                <p><strong>Giảm giá:</strong> -%,d VNĐ</p>
                <h3 style="color: #d32f2f;"><strong>TỔNG CỘNG:</strong> %,d VNĐ</h3>
                <hr>
                <p style="text-align: center; color: #666; font-size: 12px;">
                    Cảm ơn quý khách đã sử dụng dịch vụ!<br>
                    Vui lòng xuất trình QR Code khi check-in tại rạp.
                </p>
            </div>
            """,
            booking.getBookingCode(),
            booking.getInvoiceNumber(),
            booking.getBookingDate().toString(),
            booking.getCustomerName(),
            booking.getCustomerEmail(),
            booking.getCustomerPhone(),
            booking.getShowtime().getMovie().getTitle(),
            booking.getShowtime().getHall().getCinema().getCinemaName(),
            booking.getShowtime().getHall().getHallName(),
            booking.getShowtime().getShowDate().toString(),
            booking.getShowtime().getStartTime().toString(),
            booking.getTotalSeats(),
            booking.getSubtotal().longValue(),
            booking.getServiceFee().longValue(),
            booking.getTaxAmount().longValue(),
            booking.getDiscountAmount().longValue(),
            booking.getTotalAmount().longValue()
        );
    }
}
