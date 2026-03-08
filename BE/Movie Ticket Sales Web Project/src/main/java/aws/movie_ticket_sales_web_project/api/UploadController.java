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
}
