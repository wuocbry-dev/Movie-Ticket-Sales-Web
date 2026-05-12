package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.chatbot.ChatbotOrchestrator;
import aws.movie_ticket_sales_web_project.chatbot.dto.ChatbotRequest;
import aws.movie_ticket_sales_web_project.chatbot.dto.ChatbotResponse;
import aws.movie_ticket_sales_web_project.dto.ChatRequest;
import aws.movie_ticket_sales_web_project.dto.ChatResponse;
import aws.movie_ticket_sales_web_project.security.CustomUserDetails;
import aws.movie_ticket_sales_web_project.service.GeminiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * ChatController — API endpoint cho chatbot.
 * 
 * Endpoint mới: POST /api/chatbot/message (multi-node pipeline)
 * Endpoint cũ:  POST /api/chat (backward compatible, gợi ý phim cũ)
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final GeminiChatService geminiChatService;
    private final ChatbotOrchestrator chatbotOrchestrator;

    // ==================== ENDPOINT MỚI: Multi-Node Chatbot ====================

    /**
     * Chatbot API mới với kiến trúc multi-node.
     * POST /api/chatbot/message
     * 
     * - Nếu có JWT → lấy userId, email, role từ token
     * - Nếu không có JWT → Guest mode
     */
    @PostMapping("/api/chatbot/message")
    public ResponseEntity<ChatbotResponse> sendMessage(@RequestBody ChatbotRequest request) {
        log.info("💬 Chatbot request: message='{}'", truncate(request.getMessage(), 50));

        try {
            // Trích xuất thông tin user từ SecurityContext (JWT đã parse)
            Integer userId = null;
            String userEmail = null;
            String systemRole = null;

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
                userId = userDetails.getId();
                userEmail = userDetails.getEmail();
                // Lấy role đầu tiên (role cao nhất)
                systemRole = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .map(role -> role.replace("ROLE_", ""))
                    .findFirst()
                    .orElse(null);
            }

            log.info("🔐 User info: userId={}, email={}, role={}", userId, userEmail, systemRole);

            // Chạy pipeline chatbot
            ChatbotResponse response = chatbotOrchestrator.processMessage(
                request, userId, userEmail, systemRole
            );

            log.info("✅ Chatbot response: intent={}, actionType={}",
                response.getIntent(), response.getActionType());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error processing chatbot message", e);
            return ResponseEntity.ok(ChatbotResponse.builder()
                .message("Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau! 😊")
                .build());
        }
    }

    // ==================== ENDPOINT CŨ: Backward Compatible ====================

    /**
     * Chat endpoint cũ — gợi ý phim (giữ nguyên để không phá frontend cũ).
     * POST /api/chat
     */
    @PostMapping("/api/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        log.info("💬 Chat request (legacy): userId={}, message={}", request.getUserId(), request.getMessage());

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

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() > maxLen ? text.substring(0, maxLen) + "..." : text;
    }
}
