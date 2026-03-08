package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for updating user profile information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    
    private String fullName;
    
    private String phoneNumber;
    
    private LocalDate dateOfBirth;
    
    private Gender gender;
    
    private String avatarUrl;
    
    // Marketing preferences
    private Boolean marketingEmailConsent;
    
    private Boolean marketingSmsConsent;
}
