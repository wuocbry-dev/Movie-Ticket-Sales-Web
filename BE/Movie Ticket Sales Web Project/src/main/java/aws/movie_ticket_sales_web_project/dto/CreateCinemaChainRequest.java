package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCinemaChainRequest {
    private String chainName;
    private String logoUrl;
    private String website;
    private String description;
}
