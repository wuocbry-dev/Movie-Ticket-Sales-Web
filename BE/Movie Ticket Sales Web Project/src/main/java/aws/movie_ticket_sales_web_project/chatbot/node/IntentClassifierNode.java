package aws.movie_ticket_sales_web_project.chatbot.node;

import aws.movie_ticket_sales_web_project.chatbot.config.ChatbotPromptConfig;
import aws.movie_ticket_sales_web_project.chatbot.dto.ChatContext;
import aws.movie_ticket_sales_web_project.chatbot.enums.ChatIntent;
import aws.movie_ticket_sales_web_project.service.GeminiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * IntentClassifierNode — Node 3: Phân loại ý định người dùng.
 *
 * Gọi Gemini API với prompt ngắn để xác định intent từ message.
 * Trả về ChatIntent enum.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IntentClassifierNode {

    private final GeminiChatService geminiChatService;

    /**
     * Phân loại intent từ message user.
     * @return ChatContext đã cập nhật intent
     */
    public ChatContext classify(ChatContext context) {
        try {
            String prompt = ChatbotPromptConfig.INTENT_CLASSIFICATION_PROMPT
                .replace("%s", context.getUserMessage());

            String response = geminiChatService.callGeminiForText(prompt);
            String intentStr = response.trim().toUpperCase().replaceAll("[^A-Z_]", "");

            ChatIntent intent = parseIntent(intentStr);
            context.setIntent(intent);

            log.info("🎯 IntentClassifierNode: Classified intent = {} for message: '{}'",
                intent, truncate(context.getUserMessage(), 50));

        } catch (Exception e) {
            log.error("❌ IntentClassifierNode: Error classifying intent", e);
            context.setIntent(ChatIntent.GENERAL_CHAT); // Fallback
        }

        return context;
    }

    /**
     * Parse string thành ChatIntent enum, fallback GENERAL_CHAT nếu không match.
     */
    private ChatIntent parseIntent(String intentStr) {
        try {
            return ChatIntent.valueOf(intentStr);
        } catch (IllegalArgumentException e) {
            // Thử fuzzy match
            for (ChatIntent intent : ChatIntent.values()) {
                if (intentStr.contains(intent.name())) {
                    return intent;
                }
            }
            log.warn("⚠️ IntentClassifierNode: Unknown intent '{}', fallback to GENERAL_CHAT", intentStr);
            return ChatIntent.GENERAL_CHAT;
        }
    }

    private String truncate(String text, int maxLen) {
        return text.length() > maxLen ? text.substring(0, maxLen) + "..." : text;
    }
}
