package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CinemaDto {
    private Integer cinemaId;
    private Integer chainId;
    private String chainName;
    private Integer managerId;
    private String managerName;
    private String managerEmail;
    private String cinemaName;
    private String address;
    private String city;
    private String district;
    private String phoneNumber;
    private String email;
    private String taxCode;
    private String legalName;
    private Double latitude;
    private Double longitude;
    private Map<String, Object> openingHours;
    private Map<String, Object> facilities;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
