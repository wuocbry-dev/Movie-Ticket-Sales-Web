package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.ChatResponse;
import aws.movie_ticket_sales_web_project.entity.Movie;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import aws.movie_ticket_sales_web_project.repository.MovieRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiChatService {

    private final MovieRepository movieRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    /**
     * Chat with Gemini AI and get movie recommendations
     */
    public ChatResponse chatWithGemini(String userMessage, Integer userId) {
        try {
            // Get available movies
            List<Movie> availableMovies = movieRepository.findByStatus(MovieStatus.NOW_SHOWING);
            
            if (availableMovies.isEmpty()) {
                return ChatResponse.builder()
                    .message("Hiện tại chưa có phim nào đang chiếu.")
                    .recommendations(new ArrayList<>())
                    .build();
            }

            // Build context for Gemini
            String moviesContext = buildMoviesContext(availableMovies);
            
            // Create prompt for Gemini
            String prompt = buildPrompt(userMessage, moviesContext);
            
            // Call Gemini API
            String geminiResponse = callGeminiAPI(prompt);
            
            // Parse response and extract movie recommendations
            return parseGeminiResponse(geminiResponse, availableMovies);
            
        } catch (Exception e) {
            log.error("Error chatting with Gemini", e);
            return ChatResponse.builder()
                .message("Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại!")
                .recommendations(new ArrayList<>())
                .build();
        }
    }

    /**
     * Build movies context for Gemini
     */
    private String buildMoviesContext(List<Movie> movies) {
        StringBuilder context = new StringBuilder("Danh sách phim đang chiếu:\n\n");
        
        for (int i = 0; i < Math.min(movies.size(), 20); i++) {
            Movie movie = movies.get(i);
            context.append(String.format("[%d] %s\n", i + 1, movie.getTitle()));
            context.append(String.format("   - Thể loại: %s\n", "Đang cập nhật"));
            context.append(String.format("   - Thời lượng: %d phút\n", movie.getDurationMinutes()));
            context.append(String.format("   - Đánh giá: %s/10\n", movie.getImdbRating() != null ? movie.getImdbRating() : "N/A"));
            context.append(String.format("   - Mô tả: %s\n\n", 
                movie.getSynopsis() != null && movie.getSynopsis().length() > 100 
                    ? movie.getSynopsis().substring(0, 100) + "..." 
                    : movie.getSynopsis()));
        }
        
        return context.toString();
    }

    /**
     * Build prompt for Gemini
     */
    private String buildPrompt(String userMessage, String moviesContext) {
        return String.format("""
            ... (giữ nguyên TÍNH CÁCH VÀ CÁCH TRẢ LỜI THÂN THIỆN)
            
            %s
            
            Câu hỏi của khách hàng: "%s"
            
            CÁCH TRẢ LỜI THÂN THIỆN:
            - ...
            - Giải thích lý do gợi ý phải phong phú (nhắc đến diễn viên, đạo diễn, cảm xúc xem, hoặc tình huống chill hợp với phim).
            - ...
            
            Định dạng trả lời CHÍNH XÁC như sau (quan trọng: phải có số thứ tú [1], [2], [3] để parse):
            
            [Lời nhắn]
            Chào hỏi + phân tích tâm trạng/nhu cầu của khách (2-4 câu, có emoji, thân thiện, phải thật sự thấu hiểu)
            
            [Gợi ý phim]
            [1] Tên phim 1
            Lý do: Giải thích chi tiết và thân thiện tại sao phim này phù hợp (phải thật sự cá nhân hóa cho khách)
            
            [2] Tên phim 2
            Lý do: Giải thích chi tiết và thân thiện tại sao phim này phù hợp
            
            [3] Tên phim 3
            Lý do: Giải thích chi tiết và thân thiện tại sao phim này phù hợp
            
            ... (giữ nguyên VÍ DỤ CÁCH NÓI THÂN THIỆN)
            
            LƯU Ý:
            - LƯU Ý QUAN TRỌNG: CHỈ GỢI Ý DUY NHẤT 1 PHIM THEO ĐỊNH DẠNG CÓ NỘI DUNG THỂ LOẠI NHƯ TRÊN.
            - CHỈ gợi ý phim có trong danh sách
            - Phân tích kỹ tâm trạng, hoàn cảnh của khách (đi một mình? đi cùng ai? buồn? vui?)
            - ...
            """, moviesContext, userMessage);
    }

    /**
     * Call Gemini API
     */
    private String callGeminiAPI(String prompt) throws Exception {
        String url = GEMINI_API_URL + "?key=" + geminiApiKey;
        
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);
        
        content.put("parts", Collections.singletonList(part));
        requestBody.put("contents", Collections.singletonList(content));
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            request,
            String.class
        );
        
        if (response.getStatusCode() == HttpStatus.OK) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode content_node = candidates.get(0).path("content");
                JsonNode parts = content_node.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
        }
        
        throw new RuntimeException("Failed to get response from Gemini");
    }

    /**
     * Parse Gemini response and extract recommendations
     */
    private ChatResponse parseGeminiResponse(String geminiResponse, List<Movie> availableMovies) {
        log.info("Gemini response: {}", geminiResponse);
        
        try {
            // Extract message part
            String[] parts = geminiResponse.split("\\[Gợi ý phim\\]");
            String message = parts.length > 0 ? parts[0].replace("[Lời nhắn]", "").trim() : geminiResponse;
            
            // Extract recommendations
            List<ChatResponse.MovieRecommendation> recommendations = new ArrayList<>();
            
            if (parts.length > 1) {
                String recommendationsPart = parts[1];
                
                // Parse each movie recommendation [1], [2], [3]
                String[] movieBlocks = recommendationsPart.split("\\[\\d+\\]");
                
                for (int i = 1; i < movieBlocks.length && recommendations.size() < 4; i++) {
                    String block = movieBlocks[i].trim();
                    if (block.isEmpty()) continue;
                    
                    // Extract movie title (first line)
                    String[] lines = block.split("\n");
                    if (lines.length == 0) continue;
                    
                    String movieTitle = lines[0].trim();
                    String reason = "";
                    
                    // Extract reason
                    for (int j = 1; j < lines.length; j++) {
                        String line = lines[j].trim();
                        if (line.toLowerCase().startsWith("lý do:")) {
                            reason = line.substring(7).trim();
                            break;
                        }
                    }
                    
                    // Find matching movie
                    Movie matchedMovie = findMovieByTitle(movieTitle, availableMovies);
                    
                    if (matchedMovie != null) {
                        recommendations.add(ChatResponse.MovieRecommendation.builder()
                            .movieId(matchedMovie.getId())
                            .title(matchedMovie.getTitle())
                            .posterUrl(matchedMovie.getPosterUrl())
                            .rating(matchedMovie.getImdbRating() != null ? matchedMovie.getImdbRating().doubleValue() : null)
                            .durationMinutes(matchedMovie.getDurationMinutes())
                            .reason(reason.isEmpty() ? "Phim hay, đáng xem!" : reason)
                            .build());
                    }
                }
            }
            
            // If no recommendations parsed, return top rated movies
            if (recommendations.isEmpty()) {
                recommendations = availableMovies.stream()
                    .sorted((a, b) -> {
                        Double ratingA = a.getImdbRating() != null ? a.getImdbRating().doubleValue() : 0.0;
                        Double ratingB = b.getImdbRating() != null ? b.getImdbRating().doubleValue() : 0.0;
                        return Double.compare(ratingB, ratingA);
                    })
                    .limit(3)
                    .map(movie -> ChatResponse.MovieRecommendation.builder()
                        .movieId(movie.getId())
                        .title(movie.getTitle())
                        .posterUrl(movie.getPosterUrl())
                        .rating(movie.getImdbRating() != null ? movie.getImdbRating().doubleValue() : null)
                        .durationMinutes(movie.getDurationMinutes())
                        .reason("Phim đánh giá cao!")
                        .build())
                    .collect(Collectors.toList());
            }
            
            return ChatResponse.builder()
                .message(message)
                .recommendations(recommendations)
                .build();
                
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
            
            // Fallback: return message and top movies
            return ChatResponse.builder()
                .message(geminiResponse.length() > 500 ? geminiResponse.substring(0, 500) + "..." : geminiResponse)
                .recommendations(availableMovies.stream()
                    .limit(3)
                    .map(movie -> ChatResponse.MovieRecommendation.builder()
                        .movieId(movie.getId())
                        .title(movie.getTitle())
                        .posterUrl(movie.getPosterUrl())
                        .rating(movie.getImdbRating() != null ? movie.getImdbRating().doubleValue() : null)
                        .durationMinutes(movie.getDurationMinutes())
                        .reason("Gợi ý cho bạn")
                        .build())
                    .collect(Collectors.toList()))
                .build();
        }
    }

    /**
     * Find movie by title (fuzzy matching)
     */
    private Movie findMovieByTitle(String title, List<Movie> movies) {
        String normalizedTitle = title.toLowerCase().trim();
        
        // Exact match
        for (Movie movie : movies) {
            if (movie.getTitle().toLowerCase().equals(normalizedTitle)) {
                return movie;
            }
        }
        
        // Partial match
        for (Movie movie : movies) {
            if (movie.getTitle().toLowerCase().contains(normalizedTitle) ||
                normalizedTitle.contains(movie.getTitle().toLowerCase())) {
                return movie;
            }
        }
        
        return null;
    }
}
