package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.AssignStaffRequest;
import aws.movie_ticket_sales_web_project.dto.CinemaStaffDTO;
import aws.movie_ticket_sales_web_project.entity.Cinema;
import aws.movie_ticket_sales_web_project.entity.CinemaStaff;
import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.repository.CinemaRepository;
import aws.movie_ticket_sales_web_project.repository.CinemaStaffRepository;
import aws.movie_ticket_sales_web_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service để quản lý nhân viên rạp
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CinemaStaffService {

    private final CinemaStaffRepository cinemaStaffRepository;
    private final UserRepository userRepository;
    private final CinemaRepository cinemaRepository;

    /**
     * Gán nhân viên vào rạp
     */
    @Transactional
    public CinemaStaffDTO assignStaffToCinema(AssignStaffRequest request, Integer assignedById) {
        log.info("Assigning staff {} to cinema {} by user {}", 
                request.getUserId(), request.getCinemaId(), assignedById);
        
        // Validate user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        // Validate cinema exists
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Rạp không tồn tại"));
        
        // Validate assigned_by user exists (if provided)
        User assignedBy = null;
        if (assignedById != null) {
            assignedBy = userRepository.findById(assignedById).orElse(null);
        }
        
        // Check if already assigned to this cinema
        if (cinemaStaffRepository.existsByUserIdAndCinemaId(request.getUserId(), request.getCinemaId())) {
            // Re-activate if exists but inactive
            CinemaStaff existing = cinemaStaffRepository
                    .findByUserIdAndCinemaId(request.getUserId(), request.getCinemaId())
                    .orElseThrow(() -> new RuntimeException("Lỗi hệ thống"));
            
            if (existing.getIsActive()) {
                throw new RuntimeException("Nhân viên đã được gán vào rạp này");
            }
            
            existing.setIsActive(true);
            existing.setEndDate(null);
            existing.setPosition(request.getPosition());
            existing.setNotes(request.getNotes());
            existing.setAssignedBy(assignedBy);
            
            CinemaStaff saved = cinemaStaffRepository.save(existing);
            log.info("Reactivated staff {} at cinema {}", request.getUserId(), request.getCinemaId());
            return convertToDTO(saved);
        }
        
        // Check if assigned to another active cinema
        Optional<CinemaStaff> activeAssignment = cinemaStaffRepository.findByUserId(request.getUserId());
        if (activeAssignment.isPresent()) {
            throw new RuntimeException("Nhân viên đang làm việc tại rạp " 
                    + activeAssignment.get().getCinema().getCinemaName() 
                    + ". Vui lòng kết thúc hợp đồng trước.");
        }
        
        // Create new assignment
        CinemaStaff cinemaStaff = CinemaStaff.builder()
                .user(user)
                .cinema(cinema)
                .position(request.getPosition())
                .notes(request.getNotes())
                .isActive(true)
                .startDate(Instant.now())
                .assignedBy(assignedBy)
                .build();
        
        CinemaStaff saved = cinemaStaffRepository.save(cinemaStaff);
        log.info("Successfully assigned staff {} to cinema {}", request.getUserId(), request.getCinemaId());
        
        return convertToDTO(saved);
    }

    /**
     * Lấy danh sách nhân viên của rạp
     */
    @Transactional(readOnly = true)
    public List<CinemaStaffDTO> getStaffByCinema(Integer cinemaId) {
        log.info("Getting staff list for cinema {}", cinemaId);
        List<CinemaStaff> staffList = cinemaStaffRepository.findByCinemaId(cinemaId);
        return staffList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin rạp của staff
     */
    @Transactional(readOnly = true)
    public CinemaStaffDTO getStaffCinema(Integer userId) {
        log.info("Getting cinema info for staff {}", userId);
        
        CinemaStaff cinemaStaff = cinemaStaffRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Nhân viên chưa được gán vào rạp nào"));
        
        return convertToDTO(cinemaStaff);
    }

    /**
     * Cho nhân viên nghỉ việc tại rạp
     */
    @Transactional
    public CinemaStaffDTO removeStaffFromCinema(Integer userId, Integer cinemaId) {
        log.info("Removing staff {} from cinema {}", userId, cinemaId);
        
        CinemaStaff cinemaStaff = cinemaStaffRepository.findByUserIdAndCinemaId(userId, cinemaId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên này tại rạp"));
        
        cinemaStaff.setIsActive(false);
        cinemaStaff.setEndDate(Instant.now());
        
        CinemaStaff saved = cinemaStaffRepository.save(cinemaStaff);
        log.info("Staff {} removed from cinema {}", userId, cinemaId);
        
        return convertToDTO(saved);
    }

    /**
     * Kiểm tra xem staff có thuộc cinema không
     */
    public boolean isStaffOfCinema(Integer userId, Integer cinemaId) {
        return cinemaStaffRepository.isStaffOfCinema(userId, cinemaId);
    }

    /**
     * Lấy cinema ID của staff
     */
    public Optional<Integer> getStaffCinemaId(Integer userId) {
        return cinemaStaffRepository.getCinemaIdByStaffUserId(userId);
    }

    /**
     * Convert entity to DTO
     */
    private CinemaStaffDTO convertToDTO(CinemaStaff cinemaStaff) {
        return CinemaStaffDTO.builder()
                .id(cinemaStaff.getId())
                .userId(cinemaStaff.getUser().getId())
                .fullName(cinemaStaff.getUser().getFullName())
                .email(cinemaStaff.getUser().getEmail())
                .phoneNumber(cinemaStaff.getUser().getPhoneNumber())
                .cinemaId(cinemaStaff.getCinema().getId())
                .cinemaName(cinemaStaff.getCinema().getCinemaName())
                .cinemaAddress(cinemaStaff.getCinema().getAddress())
                .position(cinemaStaff.getPosition())
                .isActive(cinemaStaff.getIsActive())
                .startDate(cinemaStaff.getStartDate())
                .endDate(cinemaStaff.getEndDate())
                .assignedById(cinemaStaff.getAssignedBy() != null ? cinemaStaff.getAssignedBy().getId() : null)
                .assignedByName(cinemaStaff.getAssignedBy() != null ? cinemaStaff.getAssignedBy().getFullName() : null)
                .notes(cinemaStaff.getNotes())
                .createdAt(cinemaStaff.getCreatedAt())
                .updatedAt(cinemaStaff.getUpdatedAt())
                .build();
    }
}
