package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String phoneNumber;
    private String password;
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private Boolean privacyPolicyAccepted;
    private String privacyPolicyVersion;
    private Boolean termsOfServiceAccepted;
    private String termsOfServiceVersion;
}
