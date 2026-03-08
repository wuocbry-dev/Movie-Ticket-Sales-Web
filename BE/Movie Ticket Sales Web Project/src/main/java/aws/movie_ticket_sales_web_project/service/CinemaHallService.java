package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.Cinema;
import aws.movie_ticket_sales_web_project.entity.CinemaHall;
import aws.movie_ticket_sales_web_project.entity.Seat;
import aws.movie_ticket_sales_web_project.entity.UserRole;
import aws.movie_ticket_sales_web_project.enums.SeatType;
import aws.movie_ticket_sales_web_project.repository.CinemaHallRepository;
import aws.movie_ticket_sales_web_project.repository.CinemaRepository;
import aws.movie_ticket_sales_web_project.repository.SeatRepository;
import aws.movie_ticket_sales_web_project.repository.UserRoleRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class CinemaHallService {

    private final CinemaHallRepository cinemaHallRepository;
    private final CinemaRepository cinemaRepository;
    private final UserRoleRepository userRoleRepository;
    private final SeatRepository seatRepository;

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
        Cinema c = cinema.get();
        return c.getManager() != null && c.getManager().getId().equals(userId);
    }

    /**
     * Get cinema hall by ID (public - active only)
     */
    public ApiResponse<CinemaHallDto> getHallById(Integer hallId) {
        log.info("Getting cinema hall by ID: {}", hallId);

        try {
            Optional<CinemaHall> hallOptional = cinemaHallRepository.findById(hallId);
            
            if (hallOptional.isEmpty()) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }

            CinemaHall hall = hallOptional.get();

            // Only return active halls for public access
            if (!hall.getIsActive()) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Phòng chiếu không hoạt động")
                        .build();
            }

            return ApiResponse.<CinemaHallDto>builder()
                    .success(true)
                    .message("Lấy thông tin phòng chiếu thành công")
                    .data(convertToCinemaHallDto(hall))
                    .build();

        } catch (Exception e) {
            log.error("Error getting cinema hall by ID: {}", hallId, e);
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Lỗi khi lấy thông tin phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all halls in a cinema (public - active only)
     */
    public ApiResponse<PagedCinemaHallResponse> getAllHallsByCinema(Integer cinemaId, Integer page, Integer size, String search) {
        log.info("Getting all halls for cinema: {}, page: {}, size: {}, search: {}", cinemaId, page, size, search);

        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        try {
            // Verify cinema exists
            if (!cinemaRepository.existsById(cinemaId)) {
                return ApiResponse.<PagedCinemaHallResponse>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<CinemaHall> hallPage;

            if (search != null && !search.isEmpty()) {
                log.debug("Searching halls in cinema {} with term: {}", cinemaId, search);
                hallPage = cinemaHallRepository.searchActiveByNameInCinema(cinemaId, search, pageable);
            } else {
                log.debug("Getting all active halls in cinema: {}", cinemaId);
                hallPage = cinemaHallRepository.findByCinemaIdAndIsActiveTrue(cinemaId, pageable);
            }

            List<CinemaHallDto> hallDtos = hallPage.getContent()
                    .stream()
                    .map(this::convertToCinemaHallDto)
                    .collect(Collectors.toList());

            PagedCinemaHallResponse response = PagedCinemaHallResponse.builder()
                    .totalElements(hallPage.getTotalElements())
                    .totalPages(hallPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .hasNext(hallPage.hasNext())
                    .hasPrevious(hallPage.hasPrevious())
                    .data(hallDtos)
                    .build();

            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(true)
                    .message("Lấy danh sách phòng chiếu thành công")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error getting halls by cinema", e);
            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all halls in a cinema for manager (admin - all including inactive)
     */
    public ApiResponse<PagedCinemaHallResponse> getAllHallsByCinemaAdmin(Integer cinemaId, Integer page, Integer size, String search, Integer userId) {
        log.info("Admin getting all halls for cinema: {}, page: {}, size: {}, search: {}", cinemaId, page, size, search);

        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        // Log authorization check
        boolean isAdmin = isSystemAdmin(userId);
        boolean isManager = isCinemaManager(userId, cinemaId);
        log.info("Authorization check - User ID: {}, Is System Admin: {}, Is Cinema Manager: {}", userId, isAdmin, isManager);

        if (!isAdmin && !isManager) {
            log.warn("User {} does not have permission to view halls for cinema {}", userId, cinemaId);
            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(false)
                    .message("Bạn không có quyền xem phòng chiếu của rạp này")
                    .build();
        }

        try {
            // Verify cinema exists
            if (!cinemaRepository.existsById(cinemaId)) {
                return ApiResponse.<PagedCinemaHallResponse>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<CinemaHall> hallPage;

            if (search != null && !search.isEmpty()) {
                log.debug("Manager searching halls in cinema {} with term: {}", cinemaId, search);
                hallPage = cinemaHallRepository.searchByNameInCinema(cinemaId, search, pageable);
            } else {
                log.debug("Manager getting all halls in cinema: {}", cinemaId);
                hallPage = cinemaHallRepository.findByCinemaId(cinemaId, pageable);
            }

            List<CinemaHallDto> hallDtos = hallPage.getContent()
                    .stream()
                    .map(this::convertToCinemaHallDto)
                    .collect(Collectors.toList());

            PagedCinemaHallResponse response = PagedCinemaHallResponse.builder()
                    .totalElements(hallPage.getTotalElements())
                    .totalPages(hallPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .hasNext(hallPage.hasNext())
                    .hasPrevious(hallPage.hasPrevious())
                    .data(hallDtos)
                    .build();

            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(true)
                    .message("Lấy danh sách phòng chiếu thành công")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error getting halls by cinema for admin", e);
            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get halls for manager's cinemas
     */
    public ApiResponse<PagedCinemaHallResponse> getHallsForManager(Integer managerId, Integer cinemaId, Integer page, Integer size, String search) {
        log.info("Manager {} getting halls for cinema: {}, page: {}, size: {}, search: {}", managerId, cinemaId, page, size, search);

        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        try {
            // Check if user is CINEMA_MANAGER
            boolean isCinemaManager = isCinemaManager(managerId, cinemaId);
            boolean isSystemAdmin = isSystemAdmin(managerId);

            if (!isCinemaManager && !isSystemAdmin) {
                return ApiResponse.<PagedCinemaHallResponse>builder()
                        .success(false)
                        .message("Bạn không có quyền truy cập phòng chiếu của rạp này")
                        .build();
            }

            // Verify cinema exists
            if (!cinemaRepository.existsById(cinemaId)) {
                return ApiResponse.<PagedCinemaHallResponse>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "hallName"));
            Page<CinemaHall> hallPage;

            if (search != null && !search.isEmpty()) {
                hallPage = cinemaHallRepository.searchByNameInCinema(cinemaId, search, pageable);
            } else {
                hallPage = cinemaHallRepository.findByCinemaId(cinemaId, pageable);
            }

            List<CinemaHallDto> hallDtos = hallPage.getContent()
                    .stream()
                    .map(this::convertToCinemaHallDto)
                    .collect(Collectors.toList());

            PagedCinemaHallResponse response = PagedCinemaHallResponse.builder()
                    .totalElements(hallPage.getTotalElements())
                    .totalPages(hallPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .hasNext(hallPage.hasNext())
                    .hasPrevious(hallPage.hasPrevious())
                    .data(hallDtos)
                    .build();

            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(true)
                    .message("Lấy danh sách phòng chiếu thành công")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error getting halls for manager", e);
            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Create cinema hall
     */
    @Transactional
    public ApiResponse<CinemaHallDto> createCinemaHall(CreateCinemaHallRequest request, Integer userId) {
        log.info("Creating cinema hall: {} for cinema: {}, requested by: {}", request.getHallName(), request.getCinemaId(), userId);

        // Validate request first
        if (request.getCinemaId() == null) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Mã rạp không được để trống")
                    .build();
        }

        // Check authorization - SYSTEM_ADMIN or cinema manager
        boolean isAdmin = isSystemAdmin(userId);
        boolean isManager = isCinemaManager(userId, request.getCinemaId());

        if (!isAdmin && !isManager) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Bạn không có quyền tạo phòng chiếu cho rạp này")
                    .build();
        }

        // Validate request
        if (request.getCinemaId() == null || request.getHallName() == null || request.getHallName().isEmpty()) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Mã rạp và tên phòng chiếu không được để trống")
                    .build();
        }

        if (request.getTotalSeats() == null || request.getTotalSeats() <= 0) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Số ghế phải lớn hơn 0")
                    .build();
        }

        try {
            // Verify cinema exists
            Optional<Cinema> cinema = cinemaRepository.findById(request.getCinemaId());
            if (cinema.isEmpty()) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }

            // Check if hall name already exists in this cinema
            if (cinemaHallRepository.existsByHallNameInCinema(request.getCinemaId(), request.getHallName())) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Phòng chiếu với tên này đã tồn tại")
                        .build();
            }

            CinemaHall hall = new CinemaHall();
            hall.setCinema(cinema.get());
            hall.setHallName(request.getHallName());
            if (request.getHallType() != null) {
                try {
                    hall.setHallType(aws.movie_ticket_sales_web_project.enums.HallType.valueOf(request.getHallType()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid hall type: {}, using default", request.getHallType());
                }
            }
            hall.setTotalSeats(request.getTotalSeats());
            hall.setRowsCount(request.getRowsCount());
            hall.setSeatsPerRow(request.getSeatsPerRow());
            hall.setScreenType(request.getScreenType());
            hall.setSoundSystem(request.getSoundSystem());
            hall.setSeatLayout(request.getSeatLayout());
            hall.setIsActive(true);
            hall.setCreatedAt(Instant.now());
            hall.setUpdatedAt(Instant.now());

            CinemaHall savedHall = cinemaHallRepository.save(hall);
            
            // Generate seats for the newly created hall
            try {
                generateSeatsForHall(savedHall);
                log.info("Cinema hall created successfully with ID: {} and seats generated", savedHall.getId());
            } catch (Exception seatException) {
                log.error("Error generating seats for hall {}, but hall was created", savedHall.getId(), seatException);
                // Hall is still created, just seats generation failed
            }

            return ApiResponse.<CinemaHallDto>builder()
                    .success(true)
                    .message("Tạo phòng chiếu thành công")
                    .data(convertToCinemaHallDto(savedHall))
                    .build();

        } catch (Exception e) {
            log.error("Error creating cinema hall", e);
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Lỗi khi tạo phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update cinema hall
     */
    @Transactional
    public ApiResponse<CinemaHallDto> updateCinemaHall(UpdateCinemaHallRequest request, Integer userId) {
        log.info("Updating cinema hall ID: {} for cinema: {}, requested by: {}", request.getHallId(), request.getCinemaId(), userId);

        // Validate request
        if (request.getHallId() == null || request.getCinemaId() == null) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Mã phòng chiếu và mã rạp không được để trống")
                    .build();
        }

        try {
            Optional<CinemaHall> existingHall = cinemaHallRepository.findByIdAndCinemaId(request.getHallId(), request.getCinemaId());

            if (existingHall.isEmpty()) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }

            CinemaHall hall = existingHall.get();

            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, request.getCinemaId());

            if (!isAdmin && !isManager) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Bạn không có quyền cập nhật phòng chiếu này")
                        .build();
            }

            // Check if new name already exists (excluding current hall)
            if (request.getHallName() != null && !request.getHallName().isEmpty() &&
                    !request.getHallName().equals(hall.getHallName())) {
                if (cinemaHallRepository.existsByHallNameInCinemaExcludingId(request.getCinemaId(), request.getHallName(), request.getHallId())) {
                    return ApiResponse.<CinemaHallDto>builder()
                            .success(false)
                            .message("Phòng chiếu với tên này đã tồn tại")
                            .build();
                }
                hall.setHallName(request.getHallName());
            }

            // Track if seat regeneration is needed
            boolean needRegenerateSeats = false;
            Integer oldRowsCount = hall.getRowsCount();
            Integer oldSeatsPerRow = hall.getSeatsPerRow();
            
            if (request.getHallType() != null) {
                try {
                    hall.setHallType(aws.movie_ticket_sales_web_project.enums.HallType.valueOf(request.getHallType()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid hall type: {}, skipping update", request.getHallType());
                }
            }
            if (request.getTotalSeats() != null && request.getTotalSeats() > 0) {
                hall.setTotalSeats(request.getTotalSeats());
            }
            if (request.getRowsCount() != null && !request.getRowsCount().equals(oldRowsCount)) {
                hall.setRowsCount(request.getRowsCount());
                needRegenerateSeats = true;
            }
            if (request.getSeatsPerRow() != null && !request.getSeatsPerRow().equals(oldSeatsPerRow)) {
                hall.setSeatsPerRow(request.getSeatsPerRow());
                needRegenerateSeats = true;
            }
            if (request.getScreenType() != null) {
                hall.setScreenType(request.getScreenType());
            }
            if (request.getSoundSystem() != null) {
                hall.setSoundSystem(request.getSoundSystem());
            }
            if (request.getSeatLayout() != null) {
                hall.setSeatLayout(request.getSeatLayout());
                // Regenerate seats if seat layout changes
                needRegenerateSeats = true;
            }
            if (request.getIsActive() != null) {
                hall.setIsActive(request.getIsActive());
            }

            hall.setUpdatedAt(Instant.now());

            CinemaHall updatedHall = cinemaHallRepository.save(hall);
            
            // Regenerate seats if needed
            if (needRegenerateSeats) {
                try {
                    log.info("Regenerating seats for hall ID: {} due to configuration changes", updatedHall.getId());
                    // Delete existing seats
                    seatRepository.deleteByHallId(updatedHall.getId());
                    // Generate new seats
                    generateSeatsForHall(updatedHall);
                } catch (Exception seatException) {
                    log.error("Error regenerating seats for hall {}, but hall was updated", updatedHall.getId(), seatException);
                    // Hall is still updated, just seats regeneration failed
                }
            }

            log.info("Cinema hall updated successfully with ID: {}", updatedHall.getId());
            return ApiResponse.<CinemaHallDto>builder()
                    .success(true)
                    .message("Cập nhật phòng chiếu thành công")
                    .data(convertToCinemaHallDto(updatedHall))
                    .build();

        } catch (Exception e) {
            log.error("Error updating cinema hall", e);
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Lỗi khi cập nhật phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete cinema hall (soft delete)
     */
    @Transactional
    public ApiResponse<Void> deleteCinemaHall(Integer cinemaId, Integer hallId, Integer userId) {
        log.info("Deleting cinema hall ID: {} for cinema: {}, requested by: {}", hallId, cinemaId, userId);

        try {
            Optional<CinemaHall> existingHall = cinemaHallRepository.findByIdAndCinemaId(hallId, cinemaId);

            if (existingHall.isEmpty()) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }

            CinemaHall hall = existingHall.get();

            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, cinemaId);

            if (!isAdmin && !isManager) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Bạn không có quyền xóa phòng chiếu này")
                        .build();
            }

            hall.setIsActive(false);
            hall.setUpdatedAt(Instant.now());

            cinemaHallRepository.save(hall);

            log.info("Cinema hall deleted successfully with ID: {}", hallId);
            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Xóa phòng chiếu thành công")
                    .build();

        } catch (Exception e) {
            log.error("Error deleting cinema hall", e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Lỗi khi xóa phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Generate seats for a cinema hall
     */
    private void generateSeatsForHall(CinemaHall hall) {
        log.info("Generating seats for hall ID: {}", hall.getId());
        
        List<Seat> seats = new ArrayList<>();
        Integer rowsCount = hall.getRowsCount();
        Integer seatsPerRow = hall.getSeatsPerRow();
        Map<String, Object> seatLayout = hall.getSeatLayout();
        
        if (rowsCount == null || seatsPerRow == null || rowsCount <= 0 || seatsPerRow <= 0) {
            log.warn("Invalid rowsCount or seatsPerRow for hall ID: {}", hall.getId());
            return;
        }
        
        // Generate seats based on rowsCount and seatsPerRow
        for (int row = 0; row < rowsCount; row++) {
            // Convert row number to letter (0->A, 1->B, etc.)
            String rowLetter = String.valueOf((char) ('A' + row));
            
            for (int seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                Seat seat = new Seat();
                seat.setHall(hall);
                seat.setSeatRow(rowLetter);
                seat.setSeatNumber(seatNum);
                
                // Determine seat type based on seatLayout
                SeatType seatType = determineSeatType(rowLetter, seatNum, seatLayout);
                seat.setSeatType(seatType);
                
                seat.setPositionX(seatNum);
                seat.setPositionY(row + 1);
                seat.setIsActive(true);
                
                seats.add(seat);
            }
        }
        
        // Save all seats in batch
        if (!seats.isEmpty()) {
            seatRepository.saveAll(seats);
            log.info("Successfully generated {} seats for hall ID: {}", seats.size(), hall.getId());
        }
    }
    
    /**
     * Determine seat type based on seatLayout configuration
     */
    private SeatType determineSeatType(String rowLetter, Integer seatNumber, Map<String, Object> seatLayout) {
        if (seatLayout == null || seatLayout.isEmpty()) {
            // Default logic: First 2 rows (A, B) are VIP
            if ("A".equals(rowLetter) || "B".equals(rowLetter)) {
                return SeatType.VIP;
            }
            return SeatType.STANDARD;
        }
        
        // Priority 1: Check specific seat configuration (e.g., "A1": "VIP", "B5": "COUPLE")
        String seatKey = rowLetter + seatNumber;
        if (seatLayout.containsKey(seatKey)) {
            String seatTypeStr = String.valueOf(seatLayout.get(seatKey)).toUpperCase();
            try {
                // Map layout values to SeatType enum
                switch (seatTypeStr) {
                    case "PREMIUM":
                    case "VIP":
                        return SeatType.VIP;
                    case "COUPLE":
                        return SeatType.COUPLE;
                    case "WHEELCHAIR":
                        return SeatType.WHEELCHAIR;
                    case "STANDARD":
                        return SeatType.STANDARD;
                    default:
                        log.warn("Unknown seat type in layout: {}, defaulting to STANDARD", seatTypeStr);
                        return SeatType.STANDARD;
                }
            } catch (Exception e) {
                log.warn("Invalid seat type in layout: {}", seatTypeStr, e);
            }
        }
        
        // Priority 2: Check VIP_Rows array
        if (seatLayout.containsKey("VIP_Rows")) {
            try {
                Object vipRowsObj = seatLayout.get("VIP_Rows");
                if (vipRowsObj instanceof java.util.List) {
                    java.util.List<?> vipRows = (java.util.List<?>) vipRowsObj;
                    for (Object rowObj : vipRows) {
                        if (rowLetter.equals(String.valueOf(rowObj))) {
                            return SeatType.VIP;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Error processing VIP_Rows from seatLayout", e);
            }
        }
        
        // Priority 3: Check COUPLE_Rows array
        if (seatLayout.containsKey("COUPLE_Rows")) {
            try {
                Object coupleRowsObj = seatLayout.get("COUPLE_Rows");
                if (coupleRowsObj instanceof java.util.List) {
                    java.util.List<?> coupleRows = (java.util.List<?>) coupleRowsObj;
                    for (Object rowObj : coupleRows) {
                        if (rowLetter.equals(String.valueOf(rowObj))) {
                            return SeatType.COUPLE;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Error processing COUPLE_Rows from seatLayout", e);
            }
        }
        
        // Priority 4: Check WHEELCHAIR_Rows array
        if (seatLayout.containsKey("WHEELCHAIR_Rows")) {
            try {
                Object wheelchairRowsObj = seatLayout.get("WHEELCHAIR_Rows");
                if (wheelchairRowsObj instanceof java.util.List) {
                    java.util.List<?> wheelchairRows = (java.util.List<?>) wheelchairRowsObj;
                    for (Object rowObj : wheelchairRows) {
                        if (rowLetter.equals(String.valueOf(rowObj))) {
                            return SeatType.WHEELCHAIR;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Error processing WHEELCHAIR_Rows from seatLayout", e);
            }
        }
        
        // Priority 5: Fallback default - First 2 rows (A, B) are VIP
        if ("A".equals(rowLetter) || "B".equals(rowLetter)) {
            return SeatType.VIP;
        }
        
        return SeatType.STANDARD;
    }

    /**
     * Regenerate seats for a specific hall (admin only)
     */
    @Transactional
    public ApiResponse<String> regenerateSeatsForHall(Integer hallId, Integer userId) {
        log.info("Regenerating seats for hall ID: {}, requested by user: {}", hallId, userId);
        
        try {
            Optional<CinemaHall> hallOpt = cinemaHallRepository.findById(hallId);
            if (hallOpt.isEmpty()) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }
            
            CinemaHall hall = hallOpt.get();
            
            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, hall.getCinema().getId());
            
            if (!isAdmin && !isManager) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Bạn không có quyền tạo lại ghế cho phòng chiếu này")
                        .build();
            }
            
            // Delete existing seats
            seatRepository.deleteByHallId(hallId);
            log.info("Deleted existing seats for hall ID: {}", hallId);
            
            // Generate new seats
            generateSeatsForHall(hall);
            
            long seatCount = seatRepository.countByHallId(hallId);
            
            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Tạo lại ghế thành công")
                    .data("Đã tạo " + seatCount + " ghế cho phòng chiếu " + hall.getHallName())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error regenerating seats for hall", e);
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi khi tạo lại ghế: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Regenerate seats for all halls in a cinema (admin only)
     */
    @Transactional
    public ApiResponse<String> regenerateSeatsForAllHalls(Integer cinemaId, Integer userId) {
        log.info("Regenerating seats for all halls in cinema ID: {}, requested by user: {}", cinemaId, userId);
        
        try {
            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, cinemaId);
            
            if (!isAdmin && !isManager) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Bạn không có quyền tạo lại ghế cho rạp này")
                        .build();
            }
            
            List<CinemaHall> halls = cinemaHallRepository.findByCinemaId(cinemaId);
            
            if (halls.isEmpty()) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Không tìm thấy phòng chiếu nào trong rạp này")
                        .build();
            }
            
            int totalSeatsGenerated = 0;
            int hallsProcessed = 0;
            
            for (CinemaHall hall : halls) {
                if (hall.getRowsCount() != null && hall.getSeatsPerRow() != null) {
                    // Delete existing seats
                    seatRepository.deleteByHallId(hall.getId());
                    
                    // Generate new seats
                    generateSeatsForHall(hall);
                    
                    long seatCount = seatRepository.countByHallId(hall.getId());
                    totalSeatsGenerated += seatCount;
                    hallsProcessed++;
                    
                    log.info("Regenerated {} seats for hall: {}", seatCount, hall.getHallName());
                }
            }
            
            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Tạo lại ghế thành công")
                    .data("Đã tạo " + totalSeatsGenerated + " ghế cho " + hallsProcessed + " phòng chiếu")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error regenerating seats for all halls", e);
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi khi tạo lại ghế: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete all seats in a specific hall (admin only)
     */
    @Transactional
    public ApiResponse<String> deleteAllSeatsInHall(Integer hallId, Integer userId) {
        log.info("Deleting all seats for hall ID: {}, requested by user: {}", hallId, userId);
        
        try {
            Optional<CinemaHall> hallOpt = cinemaHallRepository.findById(hallId);
            if (hallOpt.isEmpty()) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }
            
            CinemaHall hall = hallOpt.get();
            
            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, hall.getCinema().getId());
            
            if (!isAdmin && !isManager) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Bạn không có quyền xóa ghế của phòng chiếu này")
                        .build();
            }
            
            // Count seats before deleting
            long seatCount = seatRepository.countByHallId(hallId);
            
            if (seatCount == 0) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Phòng chiếu không có ghế nào để xóa")
                        .build();
            }
            
            // Delete all seats
            seatRepository.deleteByHallId(hallId);
            log.info("Deleted {} seats from hall: {}", seatCount, hall.getHallName());
            
            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Xóa ghế thành công")
                    .data("Đã xóa " + seatCount + " ghế khỏi phòng chiếu " + hall.getHallName())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error deleting seats for hall", e);
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi khi xóa ghế: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Delete all seats in all halls of a cinema (admin only)
     */
    @Transactional
    public ApiResponse<String> deleteAllSeatsInCinema(Integer cinemaId, Integer userId) {
        log.info("Deleting all seats for cinema ID: {}, requested by user: {}", cinemaId, userId);
        
        try {
            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, cinemaId);
            
            if (!isAdmin && !isManager) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Bạn không có quyền xóa ghế của rạp này")
                        .build();
            }
            
            // Verify cinema exists
            if (!cinemaRepository.existsById(cinemaId)) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }
            
            List<CinemaHall> halls = cinemaHallRepository.findByCinemaId(cinemaId);
            
            if (halls.isEmpty()) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Rạp không có phòng chiếu nào")
                        .build();
            }
            
            int totalSeatsDeleted = 0;
            int hallsProcessed = 0;
            
            for (CinemaHall hall : halls) {
                long seatCount = seatRepository.countByHallId(hall.getId());
                if (seatCount > 0) {
                    seatRepository.deleteByHallId(hall.getId());
                    totalSeatsDeleted += seatCount;
                    hallsProcessed++;
                    log.info("Deleted {} seats from hall: {}", seatCount, hall.getHallName());
                }
            }
            
            if (totalSeatsDeleted == 0) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Không có ghế nào để xóa")
                        .build();
            }
            
            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Xóa ghế thành công")
                    .data("Đã xóa " + totalSeatsDeleted + " ghế từ " + hallsProcessed + " phòng chiếu")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error deleting seats for cinema", e);
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi khi xóa ghế: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Convert CinemaHall entity to DTO
     */
    private CinemaHallDto convertToCinemaHallDto(CinemaHall hall) {
        return CinemaHallDto.builder()
                .hallId(hall.getId())
                .cinemaId(hall.getCinema().getId())
                .cinemaName(hall.getCinema().getCinemaName())
                .hallName(hall.getHallName())
                .hallType(hall.getHallType() != null ? hall.getHallType().toString() : null)
                .totalSeats(hall.getTotalSeats())
                .rowsCount(hall.getRowsCount())
                .seatsPerRow(hall.getSeatsPerRow())
                .screenType(hall.getScreenType())
                .soundSystem(hall.getSoundSystem())
                .seatLayout(hall.getSeatLayout())
                .isActive(hall.getIsActive())
                .createdAt(hall.getCreatedAt())
                .updatedAt(hall.getUpdatedAt())
                .build();
    }
}
