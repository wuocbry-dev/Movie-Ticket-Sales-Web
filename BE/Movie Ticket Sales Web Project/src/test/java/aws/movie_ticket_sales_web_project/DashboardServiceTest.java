package aws.movie_ticket_sales_web_project;

import aws.movie_ticket_sales_web_project.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DashboardServiceTest {

    @Autowired
    private DashboardService dashboardService;

    @Test
    void testDashboardMethods() {
        try {
            System.out.println("TESTING getSummary()");
            dashboardService.getSummary();
            System.out.println("SUCCESS getSummary()");

            System.out.println("TESTING getRevenueTrend()");
            dashboardService.getRevenueTrend("RECENT", 7, null, null);
            System.out.println("SUCCESS getRevenueTrend()");

            System.out.println("TESTING getTopMovies()");
            dashboardService.getTopMovies();
            System.out.println("SUCCESS getTopMovies()");

            System.out.println("TESTING getRecentBookings()");
            dashboardService.getRecentBookings();
            System.out.println("SUCCESS getRecentBookings()");

            System.out.println("TESTING getPaymentStats()");
            dashboardService.getPaymentStats();
            System.out.println("SUCCESS getPaymentStats()");
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
