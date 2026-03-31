package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UploadController {

    private final S3Service s3Service;

    /**
     * Upload movie poster
     * POST /api/upload/poster
     */
    @PostMapping("/poster")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPoster(
            @RequestParam("file") MultipartFile file) {
        
        try {
            log.info("Uploading movie poster: {}", file.getOriginalFilename());
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("File is empty")
                        .build()
                );
            }

            // Validate file type (only images)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Only image files are allowed")
                        .build()
                );
            }

            // Upload to S3
            String fileUrl = s3Service.uploadMoviePoster(file);

            Map<String, String> data = new HashMap<>();
            data.put("url", fileUrl);

            return ResponseEntity.ok(
                ApiResponse.<Map<String, String>>builder()
                    .success(true)
                    .message("Poster uploaded successfully")
                    .data(data)
                    .build()
            );

        } catch (Exception e) {
            log.error("Error uploading poster: " + e.getClass().getName() + ": " + e.getMessage(), e);
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = e.getClass().getSimpleName() + " occurred";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message("Failed to upload poster: " + errorMessage)
                    .build()
            );
        }
    }

    /**
     * Upload movie backdrop
     * POST /api/upload/backdrop
     */
    @PostMapping("/backdrop")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadBackdrop(
            @RequestParam("file") MultipartFile file) {
        
        try {
            log.info("Uploading movie backdrop: {}", file.getOriginalFilename());
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("File is empty")
                        .build()
                );
            }

            // Validate file type (only images)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Only image files are allowed")
                        .build()
                );
            }

            // Upload to S3
            String fileUrl = s3Service.uploadMovieBackdrop(file);

            Map<String, String> data = new HashMap<>();
            data.put("url", fileUrl);

            return ResponseEntity.ok(
                ApiResponse.<Map<String, String>>builder()
                    .success(true)
                    .message("Backdrop uploaded successfully")
                    .data(data)
                    .build()
            );

        } catch (Exception e) {
            log.error("Error uploading backdrop: " + e.getClass().getName() + ": " + e.getMessage(), e);
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = e.getClass().getSimpleName() + " occurred";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message("Failed to upload backdrop: " + errorMessage)
                    .build()
            );
        }
    }

    /**
     * Upload promotion image (S3)
     * POST /api/upload/promotion
     */
    @PostMapping("/promotion")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPromotionImage(
            @RequestParam("file") MultipartFile file) {
        try {
            log.info("Uploading promotion image: {}", file.getOriginalFilename());
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("File trống")
                        .build()
                );
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Chỉ chấp nhận file ảnh")
                        .build()
                );
            }
            String fileUrl = s3Service.uploadPromotionImage(file);
            Map<String, String> data = new HashMap<>();
            data.put("url", fileUrl);
            return ResponseEntity.ok(
                ApiResponse.<Map<String, String>>builder()
                    .success(true)
                    .message("Upload ảnh khuyến mãi thành công")
                    .data(data)
                    .build()
            );
        } catch (Exception e) {
            log.error("Error uploading promotion image", e);
            Throwable cause = e.getCause() != null ? e.getCause() : e;
            String msg = cause.getMessage() != null ? cause.getMessage() : e.getMessage();
            if (msg == null) msg = e.getClass().getSimpleName();
            String userMsg = "Upload thất bại: " + msg;
            if (msg.contains("Access Denied") || msg.contains("access")) {
                userMsg = "S3: Không có quyền ghi (kiểm tra AWS key và bucket policy).";
            } else if (msg.contains("bucket") || msg.contains("Bucket")) {
                userMsg = "S3: Sai tên bucket hoặc bucket không tồn tại (kiểm tra aws.s3.bucket-name).";
            } else if (msg.contains("credentials") || msg.contains("Credentials")) {
                userMsg = "S3: Sai access key hoặc secret key (kiểm tra application.properties).";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message(userMsg)
                    .build()
            );
        }
    }
}
