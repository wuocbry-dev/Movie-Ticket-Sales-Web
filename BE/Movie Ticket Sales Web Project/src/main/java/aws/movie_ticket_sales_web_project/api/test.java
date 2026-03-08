package aws.movie_ticket_sales_web_project.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class test {
    @GetMapping("/api/test")
    public String testAPI() {
        return "API is working! 2025";
    }
}
