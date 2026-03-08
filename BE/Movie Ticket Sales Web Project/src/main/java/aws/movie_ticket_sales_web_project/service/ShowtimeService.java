package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.Cinema;
import aws.movie_ticket_sales_web_project.entity.CinemaHall;
import aws.movie_ticket_sales_web_project.entity.Movie;
import aws.movie_ticket_sales_web_project.entity.Showtime;
import aws.movie_ticket_sales_web_project.entity.UserRole;
import aws.movie_ticket_sales_web_project.enums.FormatType;
import aws.movie_ticket_sales_web_project.enums.ShowtimeStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final CinemaHallRepository cinemaHallRepository;
    private final CinemaRepository cinemaRepository;
    private final SeatRepository seatRepository;
    private final UserRoleRepository userRoleRepository;

    /**
     * Check if user has SYSTEM_ADMIN or ADMIN role
     */
    private boolean isSystemAdmin(Integer userId) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        return userRoles.stream()
                .anyMatch(userRole -> {
                    String roleName = userRole.getRole().getRoleName();
                    return "SYSTEM_ADMIN".equals(roleName) || "ADMIN".equals(roleName);
                });
    }

    /**
     * Check if user is manager of the cinema
     */
    private boolean isCinemaManager(Integer userId, Integer cinemaId) {
        Optional<Cinema> cinema = cinemaRepository.findById(cinemaId);
        if (cinema.isEmpty()) {
            return false;
        }
        return cinema.get().getManager() != null &&
                cinema.get().getManager().getId().equals(userId);
    }

    /**
     * Normalize formatType string to match enum values
     * Converts "2D" -> "_2D", "3D" -> "_3D", "4DX" -> "_4DX"
     */
    private String normalizeFormatType(String formatType) {
        if (formatType == null) {
            return null;
        }
        // Add underscore prefix for numeric formats
        if (formatType.equals("2D")) {
            return "_2D";
        } else if (formatType.equals("3D")) {
            return "_3D";
        } else if (formatType.equals("4DX")) {
            return "_4DX";
        }
        // Already has underscore or is IMAX/SCREENX
        return formatType;
    }

    /**
     * Get all showtimes with pagination (public)
     */
    public ApiResponse<PagedShowtimeResponse> getAllShowtimes(Integer page, Integer size) {
        log.info("Getting all showtimes, page: {}, size: {}", page, size);

        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "showDate", "startTime"));
            Page<Showtime> showtimePage = showtimeRepository.findAll(pageable);

            List<ShowtimeDto> showtimeDtos = showtimePage.getContent()
                    .stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            PagedShowtimeResponse response = PagedShowtimeResponse.builder()
                    .totalElements(showtimePage.getTotalElements())
                    .totalPages(showtimePage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .hasNext(showtimePage.hasNext())
                    .hasPrevious(showtimePage.hasPrevious())
                    .data(showtimeDtos)
                    .build();

            return ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .message("Lấy danh sách suất chiếu thành công")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error getting showtimes", e);
            return ApiResponse.<PagedShowtimeResponse>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách suất chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get showtimes by movie
     */
    public ApiResponse<List<ShowtimeDto>> getShowtimesByMovie(Integer movieId) {
        log.info("Getting showtimes for movie: {}", movieId);

        try {
            if (!movieRepository.existsById(movieId)) {
                return ApiResponse.<List<ShowtimeDto>>builder()
                        .success(false)
                        .message("Phim không tồn tại")
                        .build();
            }

            // Try to fetch with details first
            List<Showtime> showtimes;
            try {
                showtimes = showtimeRepository.findByMovieIdWithDetails(movieId);
            } catch (Exception e) {
                log.warn("Failed to fetch with details, falling back to simple query", e);
                showtimes = showtimeRepository.findByMovieId(movieId);
            }
            
            // Remove duplicates if any (from JOIN FETCH)
            List<ShowtimeDto> showtimeDtos = showtimes.stream()
                    .distinct()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return ApiResponse.<List<ShowtimeDto>>builder()
                    .success(true)
                    .message("Lấy danh sách suất chiếu thành công")
                    .data(showtimeDtos)
                    .build();

        } catch (Exception e) {
            log.error("Error getting showtimes by movie", e);
            return ApiResponse.<List<ShowtimeDto>>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách suất chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get showtime by ID (with eager loaded relationships)
     */
    public ApiResponse<ShowtimeDto> getShowtimeById(Integer showtimeId) {
        log.info("Getting showtime by ID: {}", showtimeId);

        try {
            // Use custom query with JOIN FETCH to eagerly load hall and cinema
            Optional<Showtime> showtime = showtimeRepository.findByIdWithDetails(showtimeId);
            
            if (showtime.isEmpty()) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Suất chiếu không tồn tại")
                        .build();
            }

            return ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .message("Lấy thông tin suất chiếu thành công")
                    .data(convertToDto(showtime.get()))
                    .build();

        } catch (Exception e) {
            log.error("Error getting showtime by ID", e);
            return ApiResponse.<ShowtimeDto>builder()
                    .success(false)
                    .message("Lỗi khi lấy thông tin suất chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Create showtime (admin only)
     */
    @Transactional
    public ApiResponse<ShowtimeDto> createShowtime(CreateShowtimeRequest request, Integer userId) {
        log.info("Creating showtime for movie: {}, hall: {}, date: {}", 
                request.getMovieId(), request.getHallId(), request.getShowDate());

        try {
            // Validate movie exists
            Optional<Movie> movie = movieRepository.findById(request.getMovieId());
            if (movie.isEmpty()) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Phim không tồn tại")
                        .build();
            }

            // Validate hall exists
            Optional<CinemaHall> hall = cinemaHallRepository.findById(request.getHallId());
            if (hall.isEmpty()) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }

            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, hall.get().getCinema().getId());

            if (!isAdmin && !isManager) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Bạn không có quyền tạo suất chiếu cho rạp này")
                        .build();
            }

            // Validate time
            if (request.getEndTime().isBefore(request.getStartTime())) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Giờ kết thúc phải sau giờ bắt đầu")
                        .build();
            }

            // Create showtime
            Showtime showtime = new Showtime();
            showtime.setMovie(movie.get());
            showtime.setHall(hall.get());
            showtime.setShowDate(request.getShowDate());
            showtime.setStartTime(request.getStartTime());
            showtime.setEndTime(request.getEndTime());
            
            // Set format type
            if (request.getFormatType() != null) {
                try {
                    String normalizedFormat = normalizeFormatType(request.getFormatType());
                    showtime.setFormatType(FormatType.valueOf(normalizedFormat));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid format type: {}, using default", request.getFormatType());
                    showtime.setFormatType(FormatType._2D);
                }
            } else {
                showtime.setFormatType(FormatType._2D);
            }
            
            showtime.setSubtitleLanguage(request.getSubtitleLanguage());
            showtime.setStatus(ShowtimeStatus.SCHEDULED);
            
            // Set available seats from hall
            long seatCount = seatRepository.countByHallId(hall.get().getId());
            showtime.setAvailableSeats((int) seatCount);
            
            showtime.setBasePrice(request.getBasePrice());
            showtime.setCreatedAt(Instant.now());
            showtime.setUpdatedAt(Instant.now());

            Showtime savedShowtime = showtimeRepository.save(showtime);

            log.info("Showtime created successfully with ID: {}", savedShowtime.getId());
            return ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .message("Tạo suất chiếu thành công")
                    .data(convertToDto(savedShowtime))
                    .build();

        } catch (Exception e) {
            log.error("Error creating showtime", e);
            return ApiResponse.<ShowtimeDto>builder()
                    .success(false)
                    .message("Lỗi khi tạo suất chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update showtime (admin only)
     */
    @Transactional
    public ApiResponse<ShowtimeDto> updateShowtime(UpdateShowtimeRequest request, Integer userId) {
        log.info("Updating showtime ID: {}", request.getShowtimeId());

        try {
            Optional<Showtime> existingShowtime = showtimeRepository.findById(request.getShowtimeId());
            
            if (existingShowtime.isEmpty()) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Suất chiếu không tồn tại")
                        .build();
            }

            Showtime showtime = existingShowtime.get();

            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, showtime.getHall().getCinema().getId());

            if (!isAdmin && !isManager) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Bạn không có quyền cập nhật suất chiếu này")
                        .build();
            }

            // Update fields
            if (request.getMovieId() != null) {
                Optional<Movie> movie = movieRepository.findById(request.getMovieId());
                if (movie.isPresent()) {
                    showtime.setMovie(movie.get());
                }
            }

            if (request.getHallId() != null) {
                Optional<CinemaHall> hall = cinemaHallRepository.findById(request.getHallId());
                if (hall.isPresent()) {
                    showtime.setHall(hall.get());
                    // Update available seats if hall changed
                    long seatCount = seatRepository.countByHallId(hall.get().getId());
                    showtime.setAvailableSeats((int) seatCount);
                }
            }

            if (request.getShowDate() != null) {
                showtime.setShowDate(request.getShowDate());
            }

            if (request.getStartTime() != null) {
                showtime.setStartTime(request.getStartTime());
            }

            if (request.getEndTime() != null) {
                showtime.setEndTime(request.getEndTime());
            }

            if (request.getFormatType() != null) {
                try {
                    String normalizedFormat = normalizeFormatType(request.getFormatType());
                    showtime.setFormatType(FormatType.valueOf(normalizedFormat));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid format type: {}, skipping", request.getFormatType());
                }
            }

            if (request.getSubtitleLanguage() != null) {
                showtime.setSubtitleLanguage(request.getSubtitleLanguage());
            }

            if (request.getStatus() != null) {
                try {
                    showtime.setStatus(ShowtimeStatus.valueOf(request.getStatus()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status: {}, skipping", request.getStatus());
                }
            }

            if (request.getBasePrice() != null) {
                showtime.setBasePrice(request.getBasePrice());
            }

            showtime.setUpdatedAt(Instant.now());

            Showtime updatedShowtime = showtimeRepository.save(showtime);

            log.info("Showtime updated successfully with ID: {}", updatedShowtime.getId());
            return ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .message("Cập nhật suất chiếu thành công")
                    .data(convertToDto(updatedShowtime))
                    .build();

        } catch (Exception e) {
            log.error("Error updating showtime", e);
            return ApiResponse.<ShowtimeDto>builder()
                    .success(false)
                    .message("Lỗi khi cập nhật suất chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete showtime (admin only)
     */
    @Transactional
    public ApiResponse<Void> deleteShowtime(Integer showtimeId, Integer userId) {
        log.info("Deleting showtime ID: {}", showtimeId);

        try {
            Optional<Showtime> showtime = showtimeRepository.findById(showtimeId);
            
            if (showtime.isEmpty()) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Suất chiếu không tồn tại")
                        .build();
            }

            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, showtime.get().getHall().getCinema().getId());

            if (!isAdmin && !isManager) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Bạn không có quyền xóa suất chiếu này")
                        .build();
            }

            showtimeRepository.delete(showtime.get());

            log.info("Showtime deleted successfully with ID: {}", showtimeId);
            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Xóa suất chiếu thành công")
                    .build();

        } catch (Exception e) {
            log.error("Error deleting showtime", e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Lỗi khi xóa suất chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Convert Showtime entity to DTO
     */
    private ShowtimeDto convertToDto(Showtime showtime) {
        return ShowtimeDto.builder()
                .showtimeId(showtime.getId())
                .movieId(showtime.getMovie().getId())
                .movieTitle(showtime.getMovie().getTitle())
                .moviePosterUrl(showtime.getMovie().getPosterUrl())
                .hallId(showtime.getHall().getId())
                .hallName(showtime.getHall().getHallName())
                .cinemaId(showtime.getHall().getCinema().getId())
                .cinemaName(showtime.getHall().getCinema().getCinemaName())
                .showDate(showtime.getShowDate())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .formatType(showtime.getFormatType() != null ? showtime.getFormatType().name() : null)
                .subtitleLanguage(showtime.getSubtitleLanguage())
                .status(showtime.getStatus() != null ? showtime.getStatus().name() : null)
                .availableSeats(showtime.getAvailableSeats())
                .basePrice(showtime.getBasePrice())
                .createdAt(showtime.getCreatedAt())
                .updatedAt(showtime.getUpdatedAt())
                .build();
    }

    /**
     * Get showtimes for cinema manager's cinemas
     */
    public ApiResponse<PagedShowtimeResponse> getShowtimesForManager(Integer managerId, Integer cinemaId, Integer page, Integer size) {
        log.info("Getting showtimes for manager: {}, cinemaId: {}, page: {}, size: {}", managerId, cinemaId, page, size);

        try {
            // Check if user is CINEMA_MANAGER
            List<UserRole> userRoles = userRoleRepository.findByUserId(managerId);
            boolean isCinemaManager = userRoles.stream()
                    .anyMatch(userRole -> "CINEMA_MANAGER".equals(userRole.getRole().getRoleName()));

            if (!isCinemaManager && !isSystemAdmin(managerId)) {
                return ApiResponse.<PagedShowtimeResponse>builder()
                        .success(false)
                        .message("Bạn không có quyền truy cập chức năng này")
                        .build();
            }

            page = (page != null) ? page : 0;
            size = (size != null) ? size : 10;
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "showDate", "startTime"));

            Page<Showtime> showtimePage;

            if (cinemaId != null) {
                // Get showtimes for specific cinema
                showtimePage = showtimeRepository.findByHallCinemaId(cinemaId, pageable);
                
                // Verify manager owns this cinema
                if (isCinemaManager && !isSystemAdmin(managerId)) {
                    Optional<Showtime> firstShowtime = showtimePage.getContent().stream().findFirst();
                    if (firstShowtime.isPresent()) {
                        Integer ownerId = firstShowtime.get().getHall().getCinema().getManager() != null 
                                ? firstShowtime.get().getHall().getCinema().getManager().getId() 
                                : null;
                        if (ownerId == null || !ownerId.equals(managerId)) {
                            return ApiResponse.<PagedShowtimeResponse>builder()
                                    .success(false)
                                    .message("Bạn không có quyền quản lý rạp này")
                                    .build();
                        }
                    }
                }
            } else {
                // Get showtimes for all cinemas managed by this manager
                if (isSystemAdmin(managerId)) {
                    // SYSTEM_ADMIN sees all
                    showtimePage = showtimeRepository.findAll(pageable);
                } else {
                    // CINEMA_MANAGER sees only their cinemas
                    showtimePage = showtimeRepository.findByHallCinemaManagerId(managerId, pageable);
                }
            }

            List<ShowtimeDto> showtimeDtos = showtimePage.getContent()
                    .stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            PagedShowtimeResponse response = PagedShowtimeResponse.builder()
                    .totalElements(showtimePage.getTotalElements())
                    .totalPages(showtimePage.getTotalPages())
                    .currentPage(showtimePage.getNumber())
                    .pageSize(showtimePage.getSize())
                    .hasNext(showtimePage.hasNext())
                    .hasPrevious(showtimePage.hasPrevious())
                    .data(showtimeDtos)
                    .build();

            return ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .message("Lấy danh sách suất chiếu thành công")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error getting showtimes for manager", e);
            return ApiResponse.<PagedShowtimeResponse>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách suất chiếu: " + e.getMessage())
                    .build();
        }
    }
}
