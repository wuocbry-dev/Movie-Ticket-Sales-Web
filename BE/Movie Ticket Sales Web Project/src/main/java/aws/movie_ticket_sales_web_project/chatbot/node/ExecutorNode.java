package aws.movie_ticket_sales_web_project.chatbot.node;

import aws.movie_ticket_sales_web_project.chatbot.dto.ChatAction;
import aws.movie_ticket_sales_web_project.chatbot.dto.ChatContext;
import aws.movie_ticket_sales_web_project.entity.Movie;
import aws.movie_ticket_sales_web_project.entity.Promotion;
import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.entity.Showtime;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import aws.movie_ticket_sales_web_project.repository.MovieRepository;
import aws.movie_ticket_sales_web_project.repository.PromotionRepository;
import aws.movie_ticket_sales_web_project.repository.BookingRepository;
import aws.movie_ticket_sales_web_project.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ExecutorNode — Node 5: Gọi service thật trong Spring Boot.
 *
 * Chức năng:
 * - Nhận action từ AssistantNode
 * - Gọi repository/service thật để lấy dữ liệu
 * - Trả về dữ liệu đã format (không lộ entity chi tiết)
 * - AssistantNode KHÔNG biết chi tiết database/repository
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ExecutorNode {

    private final MovieRepository movieRepository;
    private final PromotionRepository promotionRepository;
    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;

    /**
     * Thực hiện action và trả về kết quả.
     */
    public ChatContext execute(ChatContext context) {
        String action = context.getActionToExecute();

        if (action == null || action.isBlank()) {
            log.info("📌 ExecutorNode: No action to execute");
            return context;
        }

        try {
            ChatAction result = switch (action) {
                case "SEARCH_MOVIES" -> searchMovies(context);
                case "GET_SHOWTIMES" -> getShowtimes(context);
                case "CHECK_SEATS" -> checkSeats(context);
                case "GET_PROMOTIONS" -> getPromotions();
                case "GET_TICKET_PRICE" -> getTicketPrice();
                case "GET_CINEMA_INFO" -> getCinemaInfo();
                case "VIEW_MY_BOOKINGS" -> viewMyBookings(context);
                case "CANCEL_BOOKING_INFO" -> cancelBookingInfo(context);
                case "BOOK_TICKET_INFO" -> bookTicketInfo(context);
                case "GET_MY_POINTS" -> getMyPoints(context);
                case "STAFF_CHECK_IN" -> staffCheckIn(context);
                case "STAFF_LOOKUP_BOOKING" -> staffLookupBooking(context);
                case "VIEW_REVENUE_STATS" -> viewRevenueStats();
                default -> ChatAction.builder()
                    .actionType(action)
                    .success(false)
                    .message("Action không được hỗ trợ.")
                    .build();
            };

            context.setExecutorResult(result);
            log.info("✅ ExecutorNode: Executed action={}, success={}, results={}",
                action, result.isSuccess(), result.getResultCount());

        } catch (Exception e) {
            log.error("❌ ExecutorNode: Error executing action={}", action, e);
            context.setExecutorResult(ChatAction.builder()
                .actionType(action)
                .success(false)
                .message("Lỗi khi truy xuất dữ liệu. Vui lòng thử lại sau.")
                .build());
        }

        return context;
    }

    // ==================== ACTION IMPLEMENTATIONS ====================

    private ChatAction searchMovies(ChatContext context) {
        List<Movie> movies = movieRepository.findByStatus(MovieStatus.NOW_SHOWING);

        List<Map<String, Object>> movieData = movies.stream()
            .limit(10)
            .map(this::movieToMap)
            .collect(Collectors.toList());

        return ChatAction.builder()
            .actionType("SEARCH_MOVIES")
            .success(true)
            .message("Tìm thấy " + movieData.size() + " phim đang chiếu.")
            .data(movieData)
            .resultCount(movieData.size())
            .build();
    }

    private ChatAction getShowtimes(ChatContext context) {
        // Lấy suất chiếu hôm nay
        LocalDate today = LocalDate.now();

        List<Showtime> showtimes;
        try {
            // Lấy tất cả phim đang chiếu, rồi lấy suất chiếu theo ngày
            List<Movie> nowShowing = movieRepository.findByStatus(MovieStatus.NOW_SHOWING);
            showtimes = new ArrayList<>();
            for (Movie movie : nowShowing) {
                List<Showtime> movieShowtimes = showtimeRepository.findByMovieId(movie.getId());
                showtimes.addAll(movieShowtimes.stream()
                    .filter(s -> s.getShowDate() != null && !s.getShowDate().isBefore(today))
                    .limit(3)
                    .toList());
            }
        } catch (Exception e) {
            showtimes = new ArrayList<>();
        }

        List<Map<String, Object>> showtimeData = showtimes.stream()
            .limit(15)
            .map(this::showtimeToMap)
            .collect(Collectors.toList());

        return ChatAction.builder()
            .actionType("GET_SHOWTIMES")
            .success(true)
            .message("Tìm thấy " + showtimeData.size() + " suất chiếu.")
            .data(showtimeData)
            .resultCount(showtimeData.size())
            .build();
    }

    private ChatAction checkSeats(ChatContext context) {
        return ChatAction.builder()
            .actionType("CHECK_SEATS")
            .success(true)
            .message("Để kiểm tra ghế trống, vui lòng cho tôi biết bạn muốn xem suất chiếu nào. " +
                     "Bạn có thể chọn phim và suất chiếu trên trang đặt vé để xem sơ đồ ghế chi tiết.")
            .data(null)
            .resultCount(0)
            .build();
    }

    private ChatAction getPromotions() {
        List<Promotion> promotions = promotionRepository.findAll();

        List<Map<String, Object>> promoData = promotions.stream()
            .limit(10)
            .map(this::promotionToMap)
            .collect(Collectors.toList());

        return ChatAction.builder()
            .actionType("GET_PROMOTIONS")
            .success(true)
            .message("Tìm thấy " + promoData.size() + " khuyến mãi.")
            .data(promoData)
            .resultCount(promoData.size())
            .build();
    }

    private ChatAction getTicketPrice() {
        Map<String, Object> priceInfo = new LinkedHashMap<>();
        priceInfo.put("standard", "Ghế thường: 70,000 - 90,000 VND");
        priceInfo.put("vip", "Ghế VIP: 100,000 - 130,000 VND");
        priceInfo.put("couple", "Ghế đôi: 180,000 - 220,000 VND");
        priceInfo.put("note", "Giá vé có thể thay đổi theo suất chiếu và ngày trong tuần.");

        return ChatAction.builder()
            .actionType("GET_TICKET_PRICE")
            .success(true)
            .message("Bảng giá vé tham khảo.")
            .data(priceInfo)
            .resultCount(1)
            .build();
    }

    private ChatAction getCinemaInfo() {
        Map<String, Object> cinemaInfo = new LinkedHashMap<>();
        cinemaInfo.put("name", "Q Cinema");
        cinemaInfo.put("description", "Hệ thống rạp chiếu phim hiện đại với trải nghiệm điện ảnh tuyệt vời.");
        cinemaInfo.put("features", List.of("Âm thanh Dolby Atmos", "Ghế ngồi cao cấp", "Combo bắp nước đa dạng", "Đặt vé online tiện lợi"));

        return ChatAction.builder()
            .actionType("GET_CINEMA_INFO")
            .success(true)
            .message("Thông tin rạp Q Cinema.")
            .data(cinemaInfo)
            .resultCount(1)
            .build();
    }

    private ChatAction viewMyBookings(ChatContext context) {
        if (context.getUserId() == null) {
            return ChatAction.builder()
                .actionType("VIEW_MY_BOOKINGS")
                .success(false)
                .message("Cần đăng nhập để xem vé.")
                .build();
        }

        List<Booking> bookings = bookingRepository.findByUserId(context.getUserId());

        // Sắp xếp theo bookingDate giảm dần
        bookings.sort((a, b) -> {
            if (a.getBookingDate() == null) return 1;
            if (b.getBookingDate() == null) return -1;
            return b.getBookingDate().compareTo(a.getBookingDate());
        });

        List<Map<String, Object>> bookingData = bookings.stream()
            .limit(10)
            .map(this::bookingToMap)
            .collect(Collectors.toList());

        return ChatAction.builder()
            .actionType("VIEW_MY_BOOKINGS")
            .success(true)
            .message("Bạn có " + bookingData.size() + " vé đã đặt.")
            .data(bookingData)
            .resultCount(bookingData.size())
            .build();
    }

    private ChatAction cancelBookingInfo(ChatContext context) {
        return ChatAction.builder()
            .actionType("CANCEL_BOOKING_INFO")
            .success(true)
            .message("Để hủy vé, vui lòng vào mục 'Vé của tôi' trong tài khoản và chọn vé cần hủy. " +
                     "Lưu ý: Vé chỉ có thể hủy trước giờ chiếu ít nhất 1 giờ.")
            .data(null)
            .resultCount(0)
            .build();
    }

    private ChatAction bookTicketInfo(ChatContext context) {
        List<Movie> movies = movieRepository.findByStatus(MovieStatus.NOW_SHOWING);

        List<Map<String, Object>> movieData = movies.stream()
            .limit(5)
            .map(this::movieToMap)
            .collect(Collectors.toList());

        return ChatAction.builder()
            .actionType("BOOK_TICKET_INFO")
            .success(true)
            .message("Để đặt vé, bạn hãy chọn phim → chọn suất chiếu → chọn ghế → thanh toán.")
            .data(movieData)
            .resultCount(movieData.size())
            .build();
    }

    private ChatAction getMyPoints(ChatContext context) {
        return ChatAction.builder()
            .actionType("GET_MY_POINTS")
            .success(true)
            .message("Để xem điểm thưởng, vui lòng vào trang 'Tài khoản' → 'Điểm thưởng'.")
            .data(null)
            .resultCount(0)
            .build();
    }

    private ChatAction staffCheckIn(ChatContext context) {
        return ChatAction.builder()
            .actionType("STAFF_CHECK_IN")
            .success(true)
            .message("Để check-in vé, vui lòng sử dụng trang quản lý Staff → Check-in. " +
                     "Quét mã QR trên vé hoặc nhập mã booking.")
            .data(null)
            .resultCount(0)
            .build();
    }

    private ChatAction staffLookupBooking(ChatContext context) {
        return ChatAction.builder()
            .actionType("STAFF_LOOKUP_BOOKING")
            .success(true)
            .message("Để tra cứu booking, vui lòng vào trang Staff → nhập mã booking hoặc tên khách hàng.")
            .data(null)
            .resultCount(0)
            .build();
    }

    private ChatAction viewRevenueStats() {
        return ChatAction.builder()
            .actionType("VIEW_REVENUE_STATS")
            .success(true)
            .message("Để xem thống kê doanh thu chi tiết, vui lòng truy cập Dashboard Admin → Thống kê.")
            .data(null)
            .resultCount(0)
            .build();
    }

    // ==================== ENTITY → MAP CONVERTERS ====================

    private Map<String, Object> movieToMap(Movie movie) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("movieId", movie.getId());
        map.put("title", movie.getTitle());
        map.put("durationMinutes", movie.getDurationMinutes());
        map.put("rating", movie.getImdbRating());
        map.put("posterUrl", movie.getPosterUrl());
        map.put("synopsis", movie.getSynopsis() != null && movie.getSynopsis().length() > 150
            ? movie.getSynopsis().substring(0, 150) + "..." : movie.getSynopsis());
        return map;
    }

    private Map<String, Object> showtimeToMap(Showtime showtime) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("showtimeId", showtime.getId());
        map.put("showDate", showtime.getShowDate() != null ? showtime.getShowDate().toString() : null);
        map.put("startTime", showtime.getStartTime() != null ? showtime.getStartTime().toString() : null);
        map.put("endTime", showtime.getEndTime() != null ? showtime.getEndTime().toString() : null);
        map.put("basePrice", showtime.getBasePrice());
        if (showtime.getMovie() != null) {
            map.put("movieTitle", showtime.getMovie().getTitle());
        }
        if (showtime.getHall() != null) {
            map.put("hallName", showtime.getHall().getHallName());
        }
        return map;
    }

    private Map<String, Object> bookingToMap(Booking booking) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("bookingId", booking.getId());
        map.put("bookingCode", booking.getBookingCode());
        map.put("status", booking.getStatus() != null ? booking.getStatus().name() : null);
        map.put("totalAmount", booking.getTotalAmount());
        map.put("bookingDate", booking.getBookingDate() != null ? booking.getBookingDate().toString() : null);
        // Safely access nested lazy-loaded entities
        try {
            if (booking.getShowtime() != null && booking.getShowtime().getMovie() != null) {
                map.put("movieTitle", booking.getShowtime().getMovie().getTitle());
            }
        } catch (Exception e) {
            // Lazy loading exception - skip movie title
        }
        return map;
    }

    private Map<String, Object> promotionToMap(Promotion promotion) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("promotionId", promotion.getId());
        map.put("title", promotion.getPromotionName());
        map.put("description", promotion.getDescription());
        map.put("discountType", promotion.getPromotionType() != null ? promotion.getPromotionType().name() : null);
        map.put("discountPercentage", promotion.getDiscountPercentage());
        map.put("discountAmount", promotion.getDiscountAmount());
        return map;
    }
}
