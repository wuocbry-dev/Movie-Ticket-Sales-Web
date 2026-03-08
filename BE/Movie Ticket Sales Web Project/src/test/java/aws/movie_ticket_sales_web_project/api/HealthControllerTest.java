package aws.movie_ticket_sales_web_project.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketResponse;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.Map;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("HealthController Unit Tests")
class HealthControllerTest {

    @Mock
    private S3Client s3Client;

    @InjectMocks
    private HealthController healthController;

    private static final String BUCKET_NAME = "test-movie-bucket";
    private static final String REGION = "us-east-1";

    @Nested
    @DisplayName("checkS3Health Tests")
    class CheckS3HealthTests {

        @Test
        @DisplayName("Should return healthy status when S3 is accessible")
        void shouldReturnHealthyStatusWhenS3IsAccessible() {
            // Arrange
            ReflectionTestUtils.setField(healthController, "bucketName", BUCKET_NAME);
            ReflectionTestUtils.setField(healthController, "region", REGION);

            // Mock successful headBucket call
            HeadBucketResponse mockResponse = HeadBucketResponse.builder().build();
            when(s3Client.headBucket(any(Consumer.class))).thenReturn(mockResponse);

            // Act
            ResponseEntity<Map<String, Object>> response = healthController.checkS3Health();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = response.getBody();
            assertThat(body.get("s3ClientInitialized")).isEqualTo(true);
            assertThat(body.get("bucketName")).isEqualTo(BUCKET_NAME);
            assertThat(body.get("region")).isEqualTo(REGION);
            assertThat(body.get("bucketAccessible")).isEqualTo(true);
            assertThat(body).doesNotContainKey("bucketError");
            
            verify(s3Client).headBucket(any(Consumer.class));
        }

        @Test
        @DisplayName("Should return bucket not accessible when NoSuchBucketException occurs")
        void shouldReturnBucketNotAccessibleWhenNoSuchBucketException() {
            // Arrange
            ReflectionTestUtils.setField(healthController, "bucketName", BUCKET_NAME);
            ReflectionTestUtils.setField(healthController, "region", REGION);

            NoSuchBucketException exception = (NoSuchBucketException) NoSuchBucketException.builder()
                    .message("The specified bucket does not exist")
                    .build();
            
            doThrow(exception).when(s3Client).headBucket(any(Consumer.class));

            // Act
            ResponseEntity<Map<String, Object>> response = healthController.checkS3Health();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = response.getBody();
            assertThat(body.get("s3ClientInitialized")).isEqualTo(true);
            assertThat(body.get("bucketName")).isEqualTo(BUCKET_NAME);
            assertThat(body.get("region")).isEqualTo(REGION);
            assertThat(body.get("bucketAccessible")).isEqualTo(false);
            assertThat(body.get("bucketError")).isEqualTo("The specified bucket does not exist");
            
            verify(s3Client).headBucket(any(Consumer.class));
        }

        @Test
        @DisplayName("Should return bucket not accessible when S3Exception occurs")
        void shouldReturnBucketNotAccessibleWhenS3Exception() {
            // Arrange
            ReflectionTestUtils.setField(healthController, "bucketName", BUCKET_NAME);
            ReflectionTestUtils.setField(healthController, "region", REGION);

            S3Exception exception = (S3Exception) S3Exception.builder()
                    .message("Access Denied")
                    .statusCode(403)
                    .build();
            
            doThrow(exception).when(s3Client).headBucket(any(Consumer.class));

            // Act
            ResponseEntity<Map<String, Object>> response = healthController.checkS3Health();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = response.getBody();
            assertThat(body.get("s3ClientInitialized")).isEqualTo(true);
            assertThat(body.get("bucketName")).isEqualTo(BUCKET_NAME);
            assertThat(body.get("region")).isEqualTo(REGION);
            assertThat(body.get("bucketAccessible")).isEqualTo(false);
            assertThat(body.get("bucketError")).isEqualTo("Access Denied");
            
            verify(s3Client).headBucket(any(Consumer.class));
        }

        @Test
        @DisplayName("Should return bucket not accessible when generic exception occurs during bucket check")
        void shouldReturnBucketNotAccessibleWhenGenericException() {
            // Arrange
            ReflectionTestUtils.setField(healthController, "bucketName", BUCKET_NAME);
            ReflectionTestUtils.setField(healthController, "region", REGION);

            RuntimeException exception = new RuntimeException("Network timeout");
            doThrow(exception).when(s3Client).headBucket(any(Consumer.class));

            // Act
            ResponseEntity<Map<String, Object>> response = healthController.checkS3Health();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = response.getBody();
            assertThat(body.get("s3ClientInitialized")).isEqualTo(true);
            assertThat(body.get("bucketName")).isEqualTo(BUCKET_NAME);
            assertThat(body.get("region")).isEqualTo(REGION);
            assertThat(body.get("bucketAccessible")).isEqualTo(false);
            assertThat(body.get("bucketError")).isEqualTo("Network timeout");
            
            verify(s3Client).headBucket(any(Consumer.class));
        }

        @Test
        @DisplayName("Should handle null S3 client")
        void shouldHandleNullS3Client() {
            // Arrange - Create a new instance with null S3Client
            HealthController faultyController = new HealthController(null);
            ReflectionTestUtils.setField(faultyController, "bucketName", BUCKET_NAME);
            ReflectionTestUtils.setField(faultyController, "region", REGION);

            // Act
            ResponseEntity<Map<String, Object>> response = faultyController.checkS3Health();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = response.getBody();
            assertThat(body.get("s3ClientInitialized")).isEqualTo(false);
            assertThat(body.get("bucketName")).isEqualTo(BUCKET_NAME);
            assertThat(body.get("region")).isEqualTo(REGION);
        }

        @Test
        @DisplayName("Should handle empty bucket name")
        void shouldHandleEmptyBucketName() {
            // Arrange
            ReflectionTestUtils.setField(healthController, "bucketName", "");
            ReflectionTestUtils.setField(healthController, "region", REGION);

            HeadBucketResponse mockResponse = HeadBucketResponse.builder().build();
            when(s3Client.headBucket(any(Consumer.class))).thenReturn(mockResponse);

            // Act
            ResponseEntity<Map<String, Object>> response = healthController.checkS3Health();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = response.getBody();
            assertThat(body.get("s3ClientInitialized")).isEqualTo(true);
            assertThat(body.get("bucketName")).isEqualTo("");
            assertThat(body.get("region")).isEqualTo(REGION);
        }

        @Test
        @DisplayName("Should handle null bucket name")
        void shouldHandleNullBucketName() {
            // Arrange
            ReflectionTestUtils.setField(healthController, "bucketName", null);
            ReflectionTestUtils.setField(healthController, "region", REGION);

            HeadBucketResponse mockResponse = HeadBucketResponse.builder().build();
            when(s3Client.headBucket(any(Consumer.class))).thenReturn(mockResponse);

            // Act
            ResponseEntity<Map<String, Object>> response = healthController.checkS3Health();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            
            Map<String, Object> body = response.getBody();
            assertThat(body.get("s3ClientInitialized")).isEqualTo(true);
            assertThat(body.get("bucketName")).isNull();
            assertThat(body.get("region")).isEqualTo(REGION);
        }
    }
}
