package aws.movie_ticket_sales_web_project.chatbot.node;

import aws.movie_ticket_sales_web_project.chatbot.dto.ChatContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * FilterNode — Node 2: Chặn prompt injection và yêu cầu nguy hiểm.
 * 
 * Chức năng:
 * - Chặn SQL injection keywords
 * - Chặn yêu cầu lộ database, query, API key, system prompt
 * - Chặn nội dung không liên quan đến rạp phim (dùng keyword check)
 * - Giới hạn độ dài message
 */
@Component
@Slf4j
public class FilterNode {

    private static final int MAX_MESSAGE_LENGTH = 1000;

    // Regex patterns cho prompt injection
    private static final List<Pattern> DANGEROUS_PATTERNS = List.of(
        // SQL injection
        Pattern.compile("(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE\\s+TABLE|TRUNCATE)\\s+", Pattern.CASE_INSENSITIVE),
        // System prompt leak
        Pattern.compile("(system\\s*prompt|ignore\\s*(all\\s*)?previous|forget\\s*(all\\s*)?instructions|disregard\\s*(all\\s*)?rules)", Pattern.CASE_INSENSITIVE),
        // API/secret leak
        Pattern.compile("(api\\s*key|secret\\s*key|private\\s*key|access\\s*token|bearer\\s*token)", Pattern.CASE_INSENSITIVE),
        // Database leak
        Pattern.compile("(database\\s*schema|table\\s*name|column\\s*name|show\\s+tables|describe\\s+table)", Pattern.CASE_INSENSITIVE),
        // Config leak
        Pattern.compile("(application\\.properties|application\\.yml|\\.env|config\\s*file)", Pattern.CASE_INSENSITIVE),
        // Role escalation
        Pattern.compile("(pretend\\s+you\\s+are|act\\s+as\\s+admin|you\\s+are\\s+now|switch\\s+role)", Pattern.CASE_INSENSITIVE)
    );

    // Blacklist keywords (exact match, case insensitive)
    private static final List<String> BLACKLIST_KEYWORDS = List.of(
        "password_hash", "jwt_secret", "repository", "jparepository",
        "springframework", "hibernate", "entitymanager", "@autowired",
        "spring boot", "resttemplate", "application.properties"
    );

    /**
     * Lọc message. Nếu không an toàn, set filtered=true và filterReason.
     * @return ChatContext đã cập nhật
     */
    public ChatContext filter(ChatContext context) {
        String message = context.getUserMessage();

        // 1. Null/empty check
        if (message == null || message.isBlank()) {
            context.setFiltered(true);
            context.setFilterReason("Tin nhắn trống.");
            log.warn("🚫 FilterNode: Empty message");
            return context;
        }

        // 2. Quá dài
        if (message.length() > MAX_MESSAGE_LENGTH) {
            context.setFiltered(true);
            context.setFilterReason("Tin nhắn quá dài. Vui lòng rút gọn dưới " + MAX_MESSAGE_LENGTH + " ký tự.");
            log.warn("🚫 FilterNode: Message too long ({} chars)", message.length());
            return context;
        }

        // 3. Kiểm tra regex patterns
        for (Pattern pattern : DANGEROUS_PATTERNS) {
            if (pattern.matcher(message).find()) {
                context.setFiltered(true);
                context.setFilterReason("Xin lỗi, tôi chỉ có thể hỗ trợ về dịch vụ rạp chiếu phim. 🎬");
                log.warn("🚫 FilterNode: Dangerous pattern detected in message");
                return context;
            }
        }

        // 4. Kiểm tra blacklist keywords
        String messageLower = message.toLowerCase();
        for (String keyword : BLACKLIST_KEYWORDS) {
            if (messageLower.contains(keyword)) {
                context.setFiltered(true);
                context.setFilterReason("Xin lỗi, tôi không thể trả lời câu hỏi này. Hãy hỏi tôi về phim hoặc dịch vụ rạp nhé! 🎬");
                log.warn("🚫 FilterNode: Blacklist keyword detected: {}", keyword);
                return context;
            }
        }

        // 5. Passed all filters
        context.setFiltered(false);
        log.info("✅ FilterNode: Message passed all filters");
        return context;
    }
}
