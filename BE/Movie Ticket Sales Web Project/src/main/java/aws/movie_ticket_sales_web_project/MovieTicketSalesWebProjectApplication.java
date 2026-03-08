package aws.movie_ticket_sales_web_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MovieTicketSalesWebProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(MovieTicketSalesWebProjectApplication.class, args);
    }
}
