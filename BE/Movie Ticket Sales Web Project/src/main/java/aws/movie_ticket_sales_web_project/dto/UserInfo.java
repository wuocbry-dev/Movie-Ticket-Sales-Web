package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfo {
    private Integer userId;
    private String email;
    private String fullName;
    private String phone;
    private String membershipTier;
    private Integer availablePoints;
    private List<String> roles;
    private Boolean isActive;
    private Instant createdAt;
}
