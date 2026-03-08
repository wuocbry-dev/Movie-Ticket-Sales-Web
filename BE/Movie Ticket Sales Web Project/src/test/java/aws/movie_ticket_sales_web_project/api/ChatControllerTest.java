package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ChatRequest;
import aws.movie_ticket_sales_web_project.dto.ChatResponse;
import aws.movie_ticket_sales_web_project.service.GeminiChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatController Unit Tests")
class ChatControllerTest {

    @Mock
    private GeminiChatService geminiChatService;

    @InjectMocks
    private ChatController chatController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(chatController).build();
        objectMapper = new ObjectMapper();
    }

    private ChatResponse.MovieRecommendation createTestRecommendation(
            Integer movieId, String title, String posterUrl, Double rating, Integer duration, String reason) {
        return ChatResponse.MovieRecommendation.builder()
                .movieId(movieId)
                .title(title)
                .posterUrl(posterUrl)
                .rating(rating)
                .durationMinutes(duration)
                .reason(reason)
                .build();
    }

    private ChatResponse createTestChatResponse(String message, List<ChatResponse.MovieRecommendation> recommendations) {
        return ChatResponse.builder()
                .message(message)
                .recommendations(recommendations)
                .build();
    }

    @Nested
    @DisplayName("chat Tests")
    class ChatTests {

        @Test
        @DisplayName("Should return chat response with movie recommendations successfully")
        void shouldReturnChatResponseWithRecommendationsSuccessfully() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Tôi muốn xem phim hành động")
                    .userId(1)
                    .build();

            List<ChatResponse.MovieRecommendation> recommendations = Arrays.asList(
                    createTestRecommendation(1, "Action Movie 1", "poster1.jpg", 8.5, 120, "Great action scenes"),
                    createTestRecommendation(2, "Action Movie 2", "poster2.jpg", 8.0, 110, "Exciting plot")
            );

            ChatResponse expectedResponse = createTestChatResponse(
                    "Dựa trên sở thích của bạn, tôi đề xuất các phim sau:",
                    recommendations
            );

            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Dựa trên sở thích của bạn, tôi đề xuất các phim sau:");
            assertThat(response.getBody().getRecommendations()).hasSize(2);
            assertThat(response.getBody().getRecommendations().get(0).getTitle()).isEqualTo("Action Movie 1");
            assertThat(response.getBody().getRecommendations().get(1).getTitle()).isEqualTo("Action Movie 2");
            verify(geminiChatService).chatWithGemini("Tôi muốn xem phim hành động", 1);
        }

        @Test
        @DisplayName("Should return chat response without recommendations")
        void shouldReturnChatResponseWithoutRecommendations() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Xin chào")
                    .userId(1)
                    .build();

            ChatResponse expectedResponse = createTestChatResponse(
                    "Xin chào! Tôi có thể giúp gì cho bạn?",
                    null
            );

            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Xin chào! Tôi có thể giúp gì cho bạn?");
            assertThat(response.getBody().getRecommendations()).isNull();
            verify(geminiChatService).chatWithGemini("Xin chào", 1);
        }

        @Test
        @DisplayName("Should handle chat request without userId")
        void shouldHandleChatRequestWithoutUserId() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Giới thiệu phim hài")
                    .userId(null)
                    .build();

            List<ChatResponse.MovieRecommendation> recommendations = Arrays.asList(
                    createTestRecommendation(3, "Comedy Movie", "poster3.jpg", 7.5, 95, "Funny and entertaining")
            );

            ChatResponse expectedResponse = createTestChatResponse(
                    "Đây là một số phim hài hay:",
                    recommendations
            );

            when(geminiChatService.chatWithGemini(anyString(), isNull())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getRecommendations()).hasSize(1);
            verify(geminiChatService).chatWithGemini("Giới thiệu phim hài", null);
        }

        @Test
        @DisplayName("Should return empty recommendations list")
        void shouldReturnEmptyRecommendationsList() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Phim không tồn tại")
                    .userId(1)
                    .build();

            ChatResponse expectedResponse = createTestChatResponse(
                    "Xin lỗi, tôi không tìm thấy phim phù hợp.",
                    Arrays.asList()
            );

            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getRecommendations()).isEmpty();
            verify(geminiChatService).chatWithGemini("Phim không tồn tại", 1);
        }

        @Test
        @DisplayName("Should handle long message")
        void shouldHandleLongMessage() {
            // Arrange
            String longMessage = "Tôi muốn xem một bộ phim hành động với nhiều cảnh quay đẹp, " +
                    "diễn xuất tuyệt vời, kịch bản hấp dẫn và có nhiều twist bất ngờ. " +
                    "Tôi thích các phim có nội dung sâu sắc và ý nghĩa.";
            
            ChatRequest request = ChatRequest.builder()
                    .message(longMessage)
                    .userId(1)
                    .build();

            ChatResponse expectedResponse = createTestChatResponse(
                    "Tôi hiểu yêu cầu của bạn.",
                    null
            );

            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            verify(geminiChatService).chatWithGemini(longMessage, 1);
        }

        @Test
        @DisplayName("Should handle multiple recommendations with different ratings")
        void shouldHandleMultipleRecommendationsWithDifferentRatings() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Top phim hay nhất")
                    .userId(1)
                    .build();

            List<ChatResponse.MovieRecommendation> recommendations = Arrays.asList(
                    createTestRecommendation(1, "Excellent Movie", "poster1.jpg", 9.5, 150, "Masterpiece"),
                    createTestRecommendation(2, "Great Movie", "poster2.jpg", 8.5, 130, "Highly rated"),
                    createTestRecommendation(3, "Good Movie", "poster3.jpg", 7.5, 110, "Worth watching"),
                    createTestRecommendation(4, "Average Movie", "poster4.jpg", 6.0, 90, "Decent film")
            );

            ChatResponse expectedResponse = createTestChatResponse(
                    "Dưới đây là top phim được đánh giá cao:",
                    recommendations
            );

            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getRecommendations()).hasSize(4);
            assertThat(response.getBody().getRecommendations().get(0).getRating()).isEqualTo(9.5);
            assertThat(response.getBody().getRecommendations().get(3).getRating()).isEqualTo(6.0);
            verify(geminiChatService).chatWithGemini("Top phim hay nhất", 1);
        }

        @Test
        @DisplayName("Should handle exception from GeminiChatService")
        void shouldHandleExceptionFromGeminiChatService() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Tôi muốn xem phim")
                    .userId(1)
                    .build();

            when(geminiChatService.chatWithGemini(anyString(), anyInt()))
                    .thenThrow(new RuntimeException("Service unavailable"));

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau!");
            assertThat(response.getBody().getRecommendations()).isNull();
            verify(geminiChatService).chatWithGemini("Tôi muốn xem phim", 1);
        }

        @Test
        @DisplayName("Should handle NullPointerException from GeminiChatService")
        void shouldHandleNullPointerExceptionFromGeminiChatService() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Test message")
                    .userId(1)
                    .build();

            when(geminiChatService.chatWithGemini(anyString(), anyInt()))
                    .thenThrow(new NullPointerException("Null value encountered"));

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau!");
            verify(geminiChatService).chatWithGemini("Test message", 1);
        }

        @Test
        @DisplayName("Should handle IllegalArgumentException from GeminiChatService")
        void shouldHandleIllegalArgumentExceptionFromGeminiChatService() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Invalid request")
                    .userId(1)
                    .build();

            when(geminiChatService.chatWithGemini(anyString(), anyInt()))
                    .thenThrow(new IllegalArgumentException("Invalid argument"));

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau!");
            verify(geminiChatService).chatWithGemini("Invalid request", 1);
        }

        @Test
        @DisplayName("Should handle chat with special characters in message")
        void shouldHandleChatWithSpecialCharactersInMessage() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Phim có ký tự đặc biệt: @#$%^&*()!")
                    .userId(1)
                    .build();

            ChatResponse expectedResponse = createTestChatResponse(
                    "Tôi đã nhận được yêu cầu của bạn.",
                    null
            );

            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            verify(geminiChatService).chatWithGemini("Phim có ký tự đặc biệt: @#$%^&*()!", 1);
        }

        @Test
        @DisplayName("Should handle recommendations with null fields")
        void shouldHandleRecommendationsWithNullFields() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Phim thiếu thông tin")
                    .userId(1)
                    .build();

            List<ChatResponse.MovieRecommendation> recommendations = Arrays.asList(
                    createTestRecommendation(1, "Movie Without Poster", null, 7.0, 120, "Good movie"),
                    createTestRecommendation(2, "Movie Without Rating", "poster2.jpg", null, 100, null)
            );

            ChatResponse expectedResponse = createTestChatResponse(
                    "Các phim được tìm thấy:",
                    recommendations
            );

            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getRecommendations()).hasSize(2);
            assertThat(response.getBody().getRecommendations().get(0).getPosterUrl()).isNull();
            assertThat(response.getBody().getRecommendations().get(1).getRating()).isNull();
            verify(geminiChatService).chatWithGemini("Phim thiếu thông tin", 1);
        }

        @Test
        @DisplayName("Should handle empty message")
        void shouldHandleEmptyMessage() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("")
                    .userId(1)
                    .build();

            ChatResponse expectedResponse = createTestChatResponse(
                    "Bạn có thể nói rõ hơn được không?",
                    null
            );

            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            verify(geminiChatService).chatWithGemini("", 1);
        }

        @Test
        @DisplayName("Should verify service is called exactly once")
        void shouldVerifyServiceIsCalledExactlyOnce() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Test")
                    .userId(1)
                    .build();

            ChatResponse expectedResponse = createTestChatResponse("Response", null);
            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            chatController.chat(request);

            // Assert
            verify(geminiChatService, times(1)).chatWithGemini("Test", 1);
            verifyNoMoreInteractions(geminiChatService);
        }

        @Test
        @DisplayName("Should handle response with detailed movie information")
        void shouldHandleResponseWithDetailedMovieInformation() {
            // Arrange
            ChatRequest request = ChatRequest.builder()
                    .message("Phim chi tiết")
                    .userId(1)
                    .build();

            List<ChatResponse.MovieRecommendation> recommendations = Arrays.asList(
                    createTestRecommendation(
                            100, 
                            "Detailed Action Movie", 
                            "https://example.com/poster.jpg", 
                            9.2, 
                            145, 
                            "This is an excellent action movie with stunning visuals and great story"
                    )
            );

            ChatResponse expectedResponse = createTestChatResponse(
                    "Đây là phim có thông tin đầy đủ:",
                    recommendations
            );

            when(geminiChatService.chatWithGemini(anyString(), anyInt())).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ChatResponse> response = chatController.chat(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getRecommendations()).hasSize(1);
            
            ChatResponse.MovieRecommendation movie = response.getBody().getRecommendations().get(0);
            assertThat(movie.getMovieId()).isEqualTo(100);
            assertThat(movie.getTitle()).isEqualTo("Detailed Action Movie");
            assertThat(movie.getPosterUrl()).isEqualTo("https://example.com/poster.jpg");
            assertThat(movie.getRating()).isEqualTo(9.2);
            assertThat(movie.getDurationMinutes()).isEqualTo(145);
            assertThat(movie.getReason()).contains("excellent action movie");
            
            verify(geminiChatService).chatWithGemini("Phim chi tiết", 1);
        }
    }
}
