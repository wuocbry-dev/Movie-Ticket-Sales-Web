package aws.movie_ticket_sales_web_project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.cloudfront.domain:}")
    private String cloudfrontDomain;

    /**
     * Upload file to S3 and return the public URL
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Generate unique file name
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : "";
        String fileName = folder + "/" + UUID.randomUUID() + extension;

        try {
            // Upload file to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    // Remove ACL - use bucket policy instead for public access
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            // Return CloudFront URL if configured, otherwise S3 direct URL
            String fileUrl;
            if (cloudfrontDomain != null && !cloudfrontDomain.isEmpty()) {
                fileUrl = String.format("https://%s/%s", cloudfrontDomain, fileName);
            } else {
                fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", 
                    bucketName, region, fileName);
            }
            
            log.info("File uploaded successfully: {}", fileUrl);
            return fileUrl;

        } catch (S3Exception e) {
            log.error("Error uploading file to S3: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    /**
     * Delete file from S3
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extract file key from URL
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted successfully: {}", fileName);

        } catch (S3Exception e) {
            log.error("Error deleting file from S3: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }

    /**
     * Upload movie poster
     */
    public String uploadMoviePoster(MultipartFile file) throws IOException {
        return uploadFile(file, "movies/posters");
    }

    /**
     * Upload movie backdrop
     */
    public String uploadMovieBackdrop(MultipartFile file) throws IOException {
        return uploadFile(file, "movies/backdrops");
    }

    /**
     * Upload concession item image
     */
    public String uploadConcessionImage(MultipartFile file) throws IOException {
        return uploadFile(file, "concessions/items");
    }

    /**
     * Delete file from S3 with full path extraction
     */
    public void deleteFileByUrl(String fileUrl) {
        try {
            // Extract file key from full URL
            // URL format: https://bucket.s3.region.amazonaws.com/folder/filename
            // Or CloudFront: https://d1234.cloudfront.net/folder/filename
            String fileKey;
            String s3BaseUrl = String.format("https://%s.s3.%s.amazonaws.com/", bucketName, region);
            
            if (cloudfrontDomain != null && !cloudfrontDomain.isEmpty() 
                    && fileUrl.contains(cloudfrontDomain)) {
                String cfBaseUrl = String.format("https://%s/", cloudfrontDomain);
                fileKey = fileUrl.replace(cfBaseUrl, "");
            } else {
                fileKey = fileUrl.replace(s3BaseUrl, "");
            }
            
            if (fileKey.isEmpty() || fileKey.equals(fileUrl)) {
                log.warn("Could not extract file key from URL: {}", fileUrl);
                return;
            }

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted successfully: {}", fileKey);

        } catch (S3Exception e) {
            log.error("Error deleting file from S3: {}", e.getMessage(), e);
            // Don't throw exception, just log it
        }
    }
}
