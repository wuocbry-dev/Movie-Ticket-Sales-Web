package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.dashboard.*;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public DashboardSummaryDTO getSummary() {
        Instant now = Instant.now();
        Instant startOfToday = now.truncatedTo(ChronoUnit.DAYS);
        Instant startOfYesterday = startOfToday.minus(1, ChronoUnit.DAYS);

        // Today's metrics
        BigDecimal revenueToday = bookingRepository.sumRevenueByDateRange(startOfToday, now);
        if (revenueToday == null) revenueToday = BigDecimal.ZERO;
        
        Long ticketsToday = bookingRepository.sumTicketsByDateRange(startOfToday, now);
        if (ticketsToday == null) ticketsToday = 0L;
        
        Long bookingsToday = bookingRepository.countBookingsByDateRange(startOfToday, now);
        Long newUsersToday = userRepository.countNewUsersByDateRange(startOfToday, now);
        Long activeShowtimes = showtimeRepository.countActiveShowtimesByDate(java.time.LocalDate.now());
        Long activeMovies = movieRepository.countMoviesByStatus(MovieStatus.NOW_SHOWING);

        // Yesterday's metrics for trends
        BigDecimal revenueYesterday = bookingRepository.sumRevenueByDateRange(startOfYesterday, startOfToday);
        if (revenueYesterday == null) revenueYesterday = BigDecimal.ZERO;
        
        Long ticketsYesterday = bookingRepository.sumTicketsByDateRange(startOfYesterday, startOfToday);
        if (ticketsYesterday == null) ticketsYesterday = 0L;
        
        Long bookingsYesterday = bookingRepository.countBookingsByDateRange(startOfYesterday, startOfToday);

        // Payments
        List<Object[]> paymentStats = bookingRepository.countBookingsByPaymentStatus(startOfToday, now);
        long successfulPayments = 0, failedPayments = 0, pendingPayments = 0;
        for (Object[] row : paymentStats) {
            PaymentStatus status = (PaymentStatus) row[0];
            Long count = (Long) row[1];
            if (status == PaymentStatus.COMPLETED) successfulPayments = count;
            else if (status == PaymentStatus.FAILED) failedPayments = count;
            else pendingPayments += count;
        }

        return DashboardSummaryDTO.builder()
                .revenue(revenueToday)
                .revTrend(calculateTrend(revenueToday, revenueYesterday))
                .tickets(ticketsToday.intValue())
                .tktTrend(calculateTrend(new BigDecimal(ticketsToday), new BigDecimal(ticketsYesterday)))
                .bookings(bookingsToday)
                .bkgTrend(calculateTrend(new BigDecimal(bookingsToday), new BigDecimal(bookingsYesterday)))
                .occupancy(0.0) // Requires complex calculation with seats, mocked for now
                .occTrend(0.0)
                .activeMovies(activeMovies)
                .todayShowtimes(activeShowtimes)
                .newUsers(newUsersToday)
                .successfulPayments(successfulPayments)
                .failedPayments(failedPayments)
                .pendingPayments(pendingPayments)
                .build();
    }

    private Double calculateTrend(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        BigDecimal diff = current.subtract(previous);
        return diff.divide(previous, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue();
    }

    public List<RevenuePointDTO> getRevenueTrend(String mode, int days, Integer year, String month) {
        if ("CUSTOM".equals(mode) && year != null) {
            if ("ALL".equals(month) || month == null) {
                // Doanh thu theo từng tháng trong 1 năm
                List<Object[]> results = bookingRepository.sumRevenueGroupedByMonthNative(year);
                return results.stream()
                        .map(row -> new RevenuePointDTO("Tháng " + row[0].toString(), (BigDecimal) row[1]))
                        .collect(Collectors.toList());
            } else {
                // Doanh thu theo từng ngày trong 1 tháng cụ thể của năm
                int monthInt = Integer.parseInt(month);
                List<Object[]> results = bookingRepository.sumRevenueGroupedByDateForMonthNative(year, monthInt);
                return results.stream()
                        .map(row -> new RevenuePointDTO(row[0].toString(), (BigDecimal) row[1]))
                        .collect(Collectors.toList());
            }
        } else if ("ALL_TIME".equals(mode)) {
            List<Object[]> results = bookingRepository.sumRevenueGroupedByYearNative();
            return results.stream()
                    .map(row -> new RevenuePointDTO("Năm " + row[0].toString(), (BigDecimal) row[1]))
                    .collect(Collectors.toList());
        } else {
            // RECENT (Mặc định)
            Instant startDate = Instant.now().truncatedTo(ChronoUnit.DAYS).minus(days, ChronoUnit.DAYS);
            List<Object[]> results = bookingRepository.sumRevenueGroupedByDateNative(startDate);
            return results.stream()
                    .map(row -> new RevenuePointDTO(row[0].toString(), (BigDecimal) row[1]))
                    .collect(Collectors.toList());
        }
    }

    public List<TopMovieDTO> getTopMovies() {
        List<Object[]> results = bookingRepository.findTopMoviesByTicketsSold(PageRequest.of(0, 5));
        return results.stream()
                .map(row -> new TopMovieDTO((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    public List<RecentBookingDTO> getRecentBookings() {
        return bookingRepository.findAll(PageRequest.of(0, 5, org.springframework.data.domain.Sort.by("bookingDate").descending()))
                .stream()
                .map(b -> RecentBookingDTO.builder()
                        .id(b.getBookingCode())
                        .user(b.getCustomerName() != null ? b.getCustomerName() : b.getUser().getFullName())
                        .movie(b.getShowtime().getMovie().getTitle())
                        .amount(b.getTotalAmount())
                        .status(b.getPaymentStatus() != null ? b.getPaymentStatus().name() : "PENDING")
                        .time(b.getBookingDate().toString()) // Simplified format
                        .build())
                .collect(Collectors.toList());
    }
    
    public List<PaymentStatsDTO> getPaymentStats() {
        Instant startOfToday = Instant.now().truncatedTo(ChronoUnit.DAYS);
        List<Object[]> paymentStats = bookingRepository.countBookingsByPaymentStatus(startOfToday, Instant.now());
        List<PaymentStatsDTO> dtos = new ArrayList<>();
        long successful = 0, failed = 0, pending = 0;
        for (Object[] row : paymentStats) {
            PaymentStatus status = (PaymentStatus) row[0];
            Long count = (Long) row[1];
            if (status == PaymentStatus.COMPLETED) successful = count;
            else if (status == PaymentStatus.FAILED) failed = count;
            else pending += count;
        }
        dtos.add(new PaymentStatsDTO("Thành công", successful, "#38a169"));
        dtos.add(new PaymentStatsDTO("Thất bại", failed, "#e53e3e"));
        dtos.add(new PaymentStatsDTO("Đang xử lý", pending, "#f6ad55"));
        return dtos;
    }
}
