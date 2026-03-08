package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.TransactionType;
import aws.movie_ticket_sales_web_project.enums.SourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointsTransactionDTO {
    private Integer transactionId;
    private TransactionType transactionType;
    private Integer pointsAmount;
    private SourceType sourceType;
    private Integer sourceId;
    private String description;
    private Integer balanceBefore;
    private Integer balanceAfter;
    private LocalDate expiresAt;
    private Instant createdAt;
}
