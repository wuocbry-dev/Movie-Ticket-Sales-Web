package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private Integer userId;
    private String email;
    private String fullName;
    private Boolean isEmailVerified;
    private String membershipNumber;
    private String tierName;
    private List<String> roles;
}
