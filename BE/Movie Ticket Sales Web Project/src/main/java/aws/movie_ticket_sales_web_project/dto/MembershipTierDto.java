package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipTierDto {
    private Integer tierId;
    private String tierName;
    private String tierNameDisplay;
    private Integer tierLevel;
    private BigDecimal minAnnualSpending;
    private BigDecimal pointsEarnRate;
    private Integer freeTicketsPerYear;
    private String birthdayGiftDescription;
}
