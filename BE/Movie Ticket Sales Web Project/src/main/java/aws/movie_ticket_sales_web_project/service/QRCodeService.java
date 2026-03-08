package aws.movie_ticket_sales_web_project.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QRCodeService {
    
    private final S3Client s3Client;
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${aws.s3.region}")
    private String region;
    
    /**
     * Generate QR Code for booking and upload to S3
     */
    public String generateQRCode(String bookingCode) {
        try {
            // Generate QR code as byte array
            byte[] qrCodeBytes = generateQRCodeBytes(bookingCode);
            
            // Generate unique file name
            String fileName = "qr-codes/QR_" + bookingCode + "_" + UUID.randomUUID() + ".png";
            
            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("image/png")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(qrCodeBytes));

            // Return public URL
            String qrCodeUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", 
                bucketName, region, fileName);
            
            log.info("QR Code uploaded to S3 successfully: {}", qrCodeUrl);
            return qrCodeUrl;
            
        } catch (Exception e) {
            log.error("Error generating QR code for booking: {}", bookingCode, e);
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }
    

    
    /**
     * Generate QR Code as byte array (for email attachment)
     */
    public byte[] generateQRCodeBytes(String text) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 300, 300, hints);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        return outputStream.toByteArray();
    }
}
