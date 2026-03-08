package aws.movie_ticket_sales_web_project.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.s3.S3Client;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HealthController {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    @GetMapping("/s3")
    public ResponseEntity<Map<String, Object>> checkS3Health() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            response.put("s3ClientInitialized", s3Client != null);
            response.put("bucketName", bucketName);
            response.put("region", region);
            
            // Try to check if bucket exists
            try {
                s3Client.headBucket(builder -> builder.bucket(bucketName));
                response.put("bucketAccessible", true);
            } catch (Exception e) {
                response.put("bucketAccessible", false);
                response.put("bucketError", e.getMessage());
                log.error("Cannot access S3 bucket: {}", e.getMessage());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getName());
            log.error("Error checking S3 health", e);
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
