package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.CinemaChain;
import aws.movie_ticket_sales_web_project.entity.UserRole;
import aws.movie_ticket_sales_web_project.repository.CinemaChainRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class CinemaChainService {

    private final CinemaChainRepository cinemaChainRepository;
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
     * Get all cinema chains with pagination and optional search
     */
    public ApiResponse<PagedCinemaChainResponse> getAllCinemaChains(Integer page, Integer size, String search, Integer userId) {
        log.info("Getting all cinema chains - page: {}, size: {}, search: {}, requestedBy: {}", page, size, search, userId);

        // Set defaults
        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<CinemaChain> cinemaChainPage;

            if (search != null && !search.isEmpty()) {
                cinemaChainPage = cinemaChainRepository.searchActiveByChainName(search, pageable);
            } else {
                cinemaChainPage = cinemaChainRepository.findAllByIsActiveTrue(pageable);
            }

            List<CinemaChainDto> chainDtos = cinemaChainPage.getContent()
                    .stream()
                    .map(this::convertToCinemaChainDto)
                    .collect(Collectors.toList());

            PagedCinemaChainResponse response = PagedCinemaChainResponse.builder()
                    .totalElements(cinemaChainPage.getTotalElements())
                    .totalPages(cinemaChainPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .data(chainDtos)
                    .build();

            return ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(true)
                    .message("Cinema chains retrieved successfully")
                    .data(response)
                    .build();
        } catch (Exception e) {
            log.error("Error getting cinema chains", e);
            return ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(false)
                    .message("Error retrieving cinema chains: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all cinema chains (admin only) with pagination and optional search
     */
    public ApiResponse<PagedCinemaChainResponse> getAllCinemaChainsByAdmin(Integer page, Integer size, String search, Integer userId) {
        log.info("Admin getting all cinema chains - page: {}, size: {}, search: {}, requestedBy: {}", page, size, search, userId);

        if (!isSystemAdmin(userId)) {
            return ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(false)
                    .message("Access denied. Only SYSTEM_ADMIN can access this resource.")
                    .build();
        }

        // Set defaults
        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<CinemaChain> cinemaChainPage;

            if (search != null && !search.isEmpty()) {
                cinemaChainPage = cinemaChainRepository.searchByChainName(search, pageable);
            } else {
                cinemaChainPage = cinemaChainRepository.findAll(pageable);
            }

            List<CinemaChainDto> chainDtos = cinemaChainPage.getContent()
                    .stream()
                    .map(this::convertToCinemaChainDto)
                    .collect(Collectors.toList());

            PagedCinemaChainResponse response = PagedCinemaChainResponse.builder()
                    .totalElements(cinemaChainPage.getTotalElements())
                    .totalPages(cinemaChainPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .data(chainDtos)
                    .build();

            return ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(true)
                    .message("Cinema chains retrieved successfully")
                    .data(response)
                    .build();
        } catch (Exception e) {
            log.error("Error getting cinema chains", e);
            return ApiResponse.<PagedCinemaChainResponse>builder()
                    .success(false)
                    .message("Error retrieving cinema chains: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get cinema chain by ID (public)
     */
    public ApiResponse<CinemaChainDto> getCinemaChainById(Integer chainId) {
        log.info("Getting cinema chain by ID: {}", chainId);

        try {
            Optional<CinemaChain> cinemaChain = cinemaChainRepository.findById(chainId);

            if (cinemaChain.isPresent() && cinemaChain.get().getIsActive()) {
                return ApiResponse.<CinemaChainDto>builder()
                        .success(true)
                        .message("Cinema chain retrieved successfully")
                        .data(convertToCinemaChainDto(cinemaChain.get()))
                        .build();
            } else {
                return ApiResponse.<CinemaChainDto>builder()
                        .success(false)
                        .message("Cinema chain not found or is inactive")
                        .build();
            }
        } catch (Exception e) {
            log.error("Error getting cinema chain by ID", e);
            return ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Error retrieving cinema chain: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Create cinema chain (admin only)
     */
    @Transactional
    public ApiResponse<CinemaChainDto> createCinemaChain(CreateCinemaChainRequest request, Integer userId) {
        log.info("Creating cinema chain: {}, requestedBy: {}", request.getChainName(), userId);

        if (!isSystemAdmin(userId)) {
            return ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Access denied. Only SYSTEM_ADMIN can create cinema chains.")
                    .build();
        }

        // Validate request
        if (request.getChainName() == null || request.getChainName().trim().isEmpty()) {
            return ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Cinema chain name is required")
                    .build();
        }

        // Check if name already exists
        if (cinemaChainRepository.existsByChainName(request.getChainName())) {
            return ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Cinema chain with this name already exists")
                    .build();
        }

        try {
            CinemaChain cinemaChain = new CinemaChain();
            cinemaChain.setChainName(request.getChainName());
            cinemaChain.setLogoUrl(request.getLogoUrl());
            cinemaChain.setWebsite(request.getWebsite());
            cinemaChain.setDescription(request.getDescription());
            cinemaChain.setIsActive(true);
            cinemaChain.setCreatedAt(Instant.now());
            cinemaChain.setUpdatedAt(Instant.now());

            CinemaChain savedChain = cinemaChainRepository.save(cinemaChain);

            log.info("Cinema chain created successfully with ID: {}", savedChain.getId());
            return ApiResponse.<CinemaChainDto>builder()
                    .success(true)
                    .message("Cinema chain created successfully")
                    .data(convertToCinemaChainDto(savedChain))
                    .build();
        } catch (Exception e) {
            log.error("Error creating cinema chain", e);
            return ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Error creating cinema chain: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update cinema chain (admin only)
     */
    @Transactional
    public ApiResponse<CinemaChainDto> updateCinemaChain(UpdateCinemaChainRequest request, Integer userId) {
        log.info("Updating cinema chain ID: {}, requestedBy: {}", request.getChainId(), userId);

        if (!isSystemAdmin(userId)) {
            return ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Access denied. Only SYSTEM_ADMIN can update cinema chains.")
                    .build();
        }

        // Validate request
        if (request.getChainId() == null) {
            return ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Cinema chain ID is required")
                    .build();
        }

        try {
            Optional<CinemaChain> existingChain = cinemaChainRepository.findById(request.getChainId());

            if (!existingChain.isPresent()) {
                return ApiResponse.<CinemaChainDto>builder()
                        .success(false)
                        .message("Cinema chain not found")
                        .build();
            }

            CinemaChain cinemaChain = existingChain.get();

            // Check if new name already exists (excluding current chain)
            if (request.getChainName() != null && !request.getChainName().isEmpty() &&
                    !request.getChainName().equals(cinemaChain.getChainName())) {
                if (cinemaChainRepository.existsByChainNameExcludingId(request.getChainName(), request.getChainId())) {
                    return ApiResponse.<CinemaChainDto>builder()
                            .success(false)
                            .message("Cinema chain with this name already exists")
                            .build();
                }
                cinemaChain.setChainName(request.getChainName());
            }

            if (request.getLogoUrl() != null) {
                cinemaChain.setLogoUrl(request.getLogoUrl());
            }

            if (request.getWebsite() != null) {
                cinemaChain.setWebsite(request.getWebsite());
            }

            if (request.getDescription() != null) {
                cinemaChain.setDescription(request.getDescription());
            }

            if (request.getIsActive() != null) {
                cinemaChain.setIsActive(request.getIsActive());
            }

            cinemaChain.setUpdatedAt(Instant.now());

            CinemaChain updatedChain = cinemaChainRepository.save(cinemaChain);

            log.info("Cinema chain updated successfully with ID: {}", updatedChain.getId());
            return ApiResponse.<CinemaChainDto>builder()
                    .success(true)
                    .message("Cinema chain updated successfully")
                    .data(convertToCinemaChainDto(updatedChain))
                    .build();
        } catch (Exception e) {
            log.error("Error updating cinema chain", e);
            return ApiResponse.<CinemaChainDto>builder()
                    .success(false)
                    .message("Error updating cinema chain: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete cinema chain (admin only) - soft delete
     */
    @Transactional
    public ApiResponse<Void> deleteCinemaChain(Integer chainId, Integer userId) {
        log.info("Deleting cinema chain ID: {}, requestedBy: {}", chainId, userId);

        if (!isSystemAdmin(userId)) {
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Access denied. Only SYSTEM_ADMIN can delete cinema chains.")
                    .build();
        }

        // Validate request
        if (chainId == null) {
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Cinema chain ID is required")
                    .build();
        }

        try {
            Optional<CinemaChain> existingChain = cinemaChainRepository.findById(chainId);

            if (!existingChain.isPresent()) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Cinema chain not found")
                        .build();
            }

            CinemaChain cinemaChain = existingChain.get();
            cinemaChain.setIsActive(false);
            cinemaChain.setUpdatedAt(Instant.now());

            cinemaChainRepository.save(cinemaChain);

            log.info("Cinema chain deleted successfully with ID: {}", chainId);
            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Cinema chain deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error deleting cinema chain", e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Error deleting cinema chain: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Permanently delete cinema chain (admin only)
     */
    @Transactional
    public ApiResponse<Void> permanentlyDeleteCinemaChain(Integer chainId, Integer userId) {
        log.info("Permanently deleting cinema chain ID: {}, requestedBy: {}", chainId, userId);

        if (!isSystemAdmin(userId)) {
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Access denied. Only SYSTEM_ADMIN can permanently delete cinema chains.")
                    .build();
        }

        // Validate request
        if (chainId == null) {
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Cinema chain ID is required")
                    .build();
        }

        try {
            Optional<CinemaChain> existingChain = cinemaChainRepository.findById(chainId);

            if (!existingChain.isPresent()) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Cinema chain not found")
                        .build();
            }

            cinemaChainRepository.deleteById(chainId);

            log.info("Cinema chain permanently deleted with ID: {}", chainId);
            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Cinema chain permanently deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error permanently deleting cinema chain", e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Error permanently deleting cinema chain: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Convert CinemaChain entity to DTO
     */
    private CinemaChainDto convertToCinemaChainDto(CinemaChain cinemaChain) {
        return CinemaChainDto.builder()
                .chainId(cinemaChain.getId())
                .chainName(cinemaChain.getChainName())
                .logoUrl(cinemaChain.getLogoUrl())
                .website(cinemaChain.getWebsite())
                .description(cinemaChain.getDescription())
                .isActive(cinemaChain.getIsActive())
                .createdAt(cinemaChain.getCreatedAt())
                .updatedAt(cinemaChain.getUpdatedAt())
                .build();
    }
}
