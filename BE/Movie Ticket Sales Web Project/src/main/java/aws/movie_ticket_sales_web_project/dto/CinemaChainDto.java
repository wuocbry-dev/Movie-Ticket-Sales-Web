package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CinemaChainDto {
    private Integer chainId;
    private String chainName;
    private String logoUrl;
    private String website;
    private String description;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
