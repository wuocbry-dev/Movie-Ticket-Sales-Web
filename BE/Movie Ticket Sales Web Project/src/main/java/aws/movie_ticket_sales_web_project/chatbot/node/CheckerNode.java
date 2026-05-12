package aws.movie_ticket_sales_web_project.chatbot.node;

import aws.movie_ticket_sales_web_project.chatbot.dto.ChatContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * CheckerNode — Node 6: Kiểm tra response cuối cùng trước khi trả cho user.
 *
 * Chức năng:
 * - Đảm bảo không lộ thông tin nhạy cảm
 * - Loại bỏ SQL query, API key, password hash nếu AI vô tình trả ra
 * - Đảm bảo không trả dữ liệu vượt quyền
 */
@Component
@Slf4j
public class CheckerNode {

    // Patterns cho thông tin nhạy cảm cần loại bỏ
    private static final List<Pattern> SENSITIVE_PATTERNS = List.of(
        // SQL queries
        Pattern.compile("(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\\s+.*?(FROM|INTO|TABLE|SET)\\s+", Pattern.CASE_INSENSITIVE),
        // API keys (dạng AIza..., sk-...)
        Pattern.compile("(AIza[a-zA-Z0-9_-]{30,}|sk-[a-zA-Z0-9]{20,})", Pattern.CASE_INSENSITIVE),
        // Password hashes ($2a$, $2b$, bcrypt)
        Pattern.compile("\\$2[aby]?\\$\\d{2}\\$[./a-zA-Z0-9]{53}"),
        // JWT tokens
        Pattern.compile("eyJ[a-zA-Z0-9_-]*\\.eyJ[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*"),
        // Connection strings
        Pattern.compile("(jdbc:|mongodb:|redis://|mysql://|postgresql://)[^\\s]+", Pattern.CASE_INSENSITIVE),
        // Internal class/package names
        Pattern.compile("(aws\\.movie_ticket_sales_web_project\\.[a-zA-Z.]+)", Pattern.CASE_INSENSITIVE),
        // Spring Boot config
        Pattern.compile("(spring\\.[a-z.]+\\s*=\\s*[^\\s]+)", Pattern.CASE_INSENSITIVE)
    );

    // Keywords nhạy cảm
    private static final List<String> SENSITIVE_KEYWORDS = List.of(
        "password_hash", "secret_key", "private_key", "access_token",
        "jdbc:", "hibernate.", "javax.persistence", "@Entity", "@Repository",
        "application.properties", "application.yml"
    );

    /**
     * Kiểm tra và làm sạch response trước khi trả cho user.
     */
    public ChatContext verify(ChatContext context) {
        String response = context.getAssistantResponse();

        if (response == null || response.isBlank()) {
            context.setFinalResponse("Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại! 😊");
            return context;
        }

        String cleanedResponse = response;

        // 1. Loại bỏ theo regex patterns
        for (Pattern pattern : SENSITIVE_PATTERNS) {
            cleanedResponse = pattern.matcher(cleanedResponse).replaceAll("[thông tin đã ẩn]");
        }

        // 2. Loại bỏ theo keywords
        for (String keyword : SENSITIVE_KEYWORDS) {
            if (cleanedResponse.toLowerCase().contains(keyword.toLowerCase())) {
                cleanedResponse = cleanedResponse.replaceAll(
                    "(?i)" + Pattern.quote(keyword) + "[^\\n]*", 
                    "[thông tin đã ẩn]"
                );
                log.warn("⚠️ CheckerNode: Removed sensitive keyword: {}", keyword);
            }
        }

        // 3. Kiểm tra xem response có bị thay đổi nhiều không
        if (!cleanedResponse.equals(response)) {
            log.warn("⚠️ CheckerNode: Response was sanitized (sensitive content removed)");
        }

        // 4. Set final response
        context.setFinalResponse(cleanedResponse);

        // 5. Copy action data (nếu có)
        context.setFinalActionData(context.getExecutorResult());

        log.info("✅ CheckerNode: Response verified and cleaned");
        return context;
    }
}
