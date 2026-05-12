package aws.movie_ticket_sales_web_project.chatbot;

import aws.movie_ticket_sales_web_project.chatbot.dto.ChatAction;
import aws.movie_ticket_sales_web_project.chatbot.dto.ChatContext;
import aws.movie_ticket_sales_web_project.chatbot.dto.ChatbotRequest;
import aws.movie_ticket_sales_web_project.chatbot.dto.ChatbotResponse;
import aws.movie_ticket_sales_web_project.chatbot.enums.ChatIntent;
import aws.movie_ticket_sales_web_project.chatbot.enums.ChatRole;
import aws.movie_ticket_sales_web_project.chatbot.node.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ChatbotOrchestrator — Điều phối pipeline 6 node.
 *
 * Flow: Request → Filter → IntentClassifier → Permission → Assistant → Executor → Checker → Response
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotOrchestrator {

    private final FilterNode filterNode;
    private final IntentClassifierNode intentClassifierNode;
    private final PermissionNode permissionNode;
    private final AssistantNode assistantNode;
    private final ExecutorNode executorNode;
    private final CheckerNode checkerNode;

    /**
     * Xử lý tin nhắn chatbot qua pipeline 6 node.
     *
     * @param request     Request từ frontend
     * @param userId      User ID từ JWT (null nếu Guest)
     * @param userEmail   Email từ JWT (null nếu Guest)
     * @param systemRole  Role name từ JWT (null nếu Guest)
     * @return ChatbotResponse
     */
    public ChatbotResponse processMessage(ChatbotRequest request, Integer userId, String userEmail, String systemRole) {
        long startTime = System.currentTimeMillis();

        // Tạo conversation ID nếu chưa có
        String conversationId = request.getConversationId();
        if (conversationId == null || conversationId.isBlank()) {
            conversationId = UUID.randomUUID().toString().substring(0, 8);
        }

        // Xây dựng context ban đầu
        ChatContext context = ChatContext.builder()
            .userMessage(request.getMessage())
            .conversationId(conversationId)
            .userId(userId)
            .userEmail(userEmail)
            .chatRole(ChatRole.fromSystemRole(systemRole))
            .build();

        log.info("🚀 Pipeline START: user={}, role={}, message='{}'",
            userId, context.getChatRole(), truncate(request.getMessage(), 50));

        try {
            // ===== NODE 1: FILTER =====
            context = filterNode.filter(context);
            if (context.isFiltered()) {
                log.info("🚫 Pipeline BLOCKED by FilterNode: {}", context.getFilterReason());
                return buildBlockedResponse(context);
            }

            // ===== NODE 2: INTENT CLASSIFIER =====
            context = intentClassifierNode.classify(context);
            if (context.getIntent() == ChatIntent.BLOCKED) {
                return buildBlockedResponse(context);
            }

            // ===== NODE 3: PERMISSION =====
            context = permissionNode.check(context);
            if (!context.isPermissionGranted()) {
                log.info("🔒 Pipeline DENIED by PermissionNode");
                return buildDeniedResponse(context);
            }

            // ===== NODE 4: ASSISTANT (lần 1 - xác định action) =====
            context = assistantNode.process(context);

            // ===== NODE 5: EXECUTOR (nếu cần data) =====
            if (context.getActionToExecute() != null && context.getExecutorResult() == null) {
                context = executorNode.execute(context);

                // ===== NODE 4 bis: ASSISTANT (lần 2 - có data rồi, tạo response) =====
                context = assistantNode.process(context);
            }

            // ===== NODE 6: CHECKER =====
            context = checkerNode.verify(context);

            // Build response
            ChatbotResponse response = buildSuccessResponse(context);

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("✅ Pipeline DONE in {}ms: intent={}, action={}", 
                elapsed, context.getIntent(), context.getActionToExecute());

            return response;

        } catch (Exception e) {
            log.error("❌ Pipeline ERROR", e);
            return ChatbotResponse.builder()
                .message("Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại! 😊")
                .conversationId(conversationId)
                .intent("ERROR")
                .suggestedActions(List.of("Thử hỏi lại", "Xem phim đang chiếu", "Liên hệ hỗ trợ"))
                .build();
        }
    }

    /**
     * Build response khi message bị chặn bởi FilterNode.
     */
    private ChatbotResponse buildBlockedResponse(ChatContext context) {
        return ChatbotResponse.builder()
            .message(context.getFilterReason() != null 
                ? context.getFilterReason() 
                : "Xin lỗi, tôi chỉ có thể hỗ trợ về dịch vụ rạp chiếu phim. 🎬")
            .conversationId(context.getConversationId())
            .intent("BLOCKED")
            .suggestedActions(getDefaultSuggestions(context.getChatRole()))
            .build();
    }

    /**
     * Build response khi bị từ chối quyền.
     */
    private ChatbotResponse buildDeniedResponse(ChatContext context) {
        return ChatbotResponse.builder()
            .message(context.getFinalResponse())
            .conversationId(context.getConversationId())
            .intent(context.getIntent() != null ? context.getIntent().name() : "DENIED")
            .suggestedActions(getDefaultSuggestions(context.getChatRole()))
            .build();
    }

    /**
     * Build response thành công.
     */
    private ChatbotResponse buildSuccessResponse(ChatContext context) {
        ChatbotResponse.ChatbotResponseBuilder builder = ChatbotResponse.builder()
            .message(context.getFinalResponse())
            .conversationId(context.getConversationId())
            .intent(context.getIntent() != null ? context.getIntent().name() : null)
            .suggestedActions(getSuggestionsForIntent(context.getIntent(), context.getChatRole()));

        // Nếu có executor result, đính kèm action data
        if (context.getFinalActionData() instanceof ChatAction actionResult) {
            builder.actionType(actionResult.getActionType());
            builder.actionData(actionResult.getData());

            // Nếu action là SEARCH_MOVIES hoặc BOOK_TICKET_INFO → build recommendations
            if (actionResult.getData() instanceof List<?> dataList && !dataList.isEmpty()) {
                if ("SEARCH_MOVIES".equals(actionResult.getActionType()) 
                    || "BOOK_TICKET_INFO".equals(actionResult.getActionType())) {
                    builder.recommendations(buildMovieRecommendations(dataList));
                }
            }
        }

        return builder.build();
    }

    /**
     * Build movie recommendations từ data list (backward compatible).
     */
    @SuppressWarnings("unchecked")
    private List<ChatbotResponse.MovieRecommendation> buildMovieRecommendations(List<?> dataList) {
        return dataList.stream()
            .filter(item -> item instanceof Map)
            .map(item -> {
                Map<String, Object> map = (Map<String, Object>) item;
                return ChatbotResponse.MovieRecommendation.builder()
                    .movieId(map.get("movieId") instanceof Integer ? (Integer) map.get("movieId") : null)
                    .title(map.get("title") != null ? map.get("title").toString() : null)
                    .posterUrl(map.get("posterUrl") != null ? map.get("posterUrl").toString() : null)
                    .rating(map.get("rating") instanceof Number ? ((Number) map.get("rating")).doubleValue() : null)
                    .durationMinutes(map.get("durationMinutes") instanceof Integer ? (Integer) map.get("durationMinutes") : null)
                    .reason("Gợi ý cho bạn")
                    .build();
            })
            .limit(5)
            .collect(Collectors.toList());
    }

    /**
     * Gợi ý mặc định theo role.
     */
    private List<String> getDefaultSuggestions(ChatRole role) {
        List<String> suggestions = new ArrayList<>(List.of(
            "Phim đang chiếu?",
            "Suất chiếu hôm nay?",
            "Có khuyến mãi gì không?"
        ));

        if (role == ChatRole.USER || role == ChatRole.ADMIN) {
            suggestions.add("Vé của tôi");
        }
        if (role == ChatRole.STAFF) {
            suggestions.add("Check-in vé");
        }
        if (role == ChatRole.ADMIN) {
            suggestions.add("Thống kê doanh thu");
        }

        return suggestions;
    }

    /**
     * Gợi ý tiếp theo dựa trên intent vừa xử lý.
     */
    private List<String> getSuggestionsForIntent(ChatIntent intent, ChatRole role) {
        if (intent == null) return getDefaultSuggestions(role);

        return switch (intent) {
            case SEARCH_MOVIE -> List.of("Xem suất chiếu", "Đặt vé", "Phim sắp chiếu?");
            case VIEW_SHOWTIME -> List.of("Kiểm tra ghế trống", "Đặt vé", "Giá vé bao nhiêu?");
            case CHECK_SEAT -> List.of("Đặt vé ngay", "Xem suất chiếu khác");
            case BOOK_TICKET -> List.of("Xem vé của tôi", "Có khuyến mãi gì không?");
            case VIEW_MY_TICKETS -> List.of("Hủy vé", "Đặt thêm vé", "Xem điểm thưởng");
            case ASK_PROMOTION -> List.of("Đặt vé", "Phim đang chiếu?", "Giá vé?");
            default -> getDefaultSuggestions(role);
        };
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() > maxLen ? text.substring(0, maxLen) + "..." : text;
    }
}
