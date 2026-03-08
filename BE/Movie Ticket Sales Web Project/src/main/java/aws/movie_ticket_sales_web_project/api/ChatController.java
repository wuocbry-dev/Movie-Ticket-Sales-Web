package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ChatRequest;
import aws.movie_ticket_sales_web_project.dto.ChatResponse;
import aws.movie_ticket_sales_web_project.service.GeminiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ChatController {

    private final GeminiChatService geminiChatService;

    /**
     * Chat with AI to get movie recommendations
     * POST /api/chat
     */
    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        log.info("💬 Chat request: userId={}, message={}", request.getUserId(), request.getMessage());
        
        try {
            ChatResponse response = geminiChatService.chatWithGemini(
                request.getMessage(), 
                request.getUserId()
            );
            
            log.info("✅ Chat response: {} recommendations", 
                response.getRecommendations() != null ? response.getRecommendations().size() : 0);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Error processing chat", e);
            return ResponseEntity.ok(ChatResponse.builder()
                .message("Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau!")
                .build());
        }
    }
}
