package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.CinemaConcessionItemDTO;
import aws.movie_ticket_sales_web_project.entity.Cinema;
import aws.movie_ticket_sales_web_project.entity.CinemaConcessionItem;
import aws.movie_ticket_sales_web_project.entity.ConcessionItem;
import aws.movie_ticket_sales_web_project.repository.CinemaRepository;
import aws.movie_ticket_sales_web_project.repository.CinemaConcessionItemRepository;
import aws.movie_ticket_sales_web_project.repository.ConcessionItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CinemaConcessionService {

    private final CinemaConcessionItemRepository cinemaConcessionItemRepository;
    private final CinemaRepository cinemaRepository;
    private final ConcessionItemRepository concessionItemRepository;

    /**
     * Lấy tất cả items có bán tại rạp (cho customer)
     */
    @Transactional(readOnly = true)
    public List<CinemaConcessionItemDTO> getAvailableItemsByCinema(Integer cinemaId) {
        List<CinemaConcessionItem> items = cinemaConcessionItemRepository
                .findAvailableItemsByCinemaId(cinemaId);
        
        return items.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy TẤT CẢ items tại rạp, kể cả bị khóa (cho Manager)
     */
    @Transactional(readOnly = true)
    public List<CinemaConcessionItemDTO> getAllItemsByCinema(Integer cinemaId) {
        List<CinemaConcessionItem> items = cinemaConcessionItemRepository
                .findAllByCinemaId(cinemaId);
        
        return items.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy items theo rạp và category
     */
    @Transactional(readOnly = true)
    public List<CinemaConcessionItemDTO> getItemsByCinemaAndCategory(Integer cinemaId, Integer categoryId) {
        List<CinemaConcessionItem> items = cinemaConcessionItemRepository
                .findAvailableItemsByCinemaAndCategory(cinemaId, categoryId);
        
        return items.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin item cụ thể tại rạp
     */
    @Transactional(readOnly = true)
    public CinemaConcessionItemDTO getItemByCinemaAndItemId(Integer cinemaId, Integer itemId) {
        CinemaConcessionItem item = cinemaConcessionItemRepository
                .findByCinemaIdAndItemId(cinemaId, itemId)
                .orElseThrow(() -> new RuntimeException(
                        "Item không có bán tại rạp này hoặc không tồn tại"));
        
        return convertToDTO(item);
    }

    /**
     * Thêm item vào rạp với giá tùy chỉnh
     */
    @Transactional
    public CinemaConcessionItemDTO addItemToCinema(
            Integer cinemaId, 
            Integer itemId, 
            BigDecimal customPrice,
            Integer stockQuantity) {
        
        log.info("=== SERVICE: Looking for cinema with ID: {}", cinemaId);
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new RuntimeException("Rạp không tồn tại với ID: " + cinemaId));
        
        log.info("=== SERVICE: Looking for concession item with ID: {}", itemId);
        ConcessionItem item = concessionItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại với ID: " + itemId));
        
        // Kiểm tra đã tồn tại chưa
        if (cinemaConcessionItemRepository.existsByCinemaIdAndItemId(cinemaId, itemId)) {
            throw new RuntimeException("Item đã được thêm vào rạp này");
        }
        
        CinemaConcessionItem cinemaItem = CinemaConcessionItem.builder()
                .cinema(cinema)
                .item(item)
                .cinemaPrice(customPrice)
                .stockQuantity(stockQuantity != null ? stockQuantity : 0)
                .isAvailable(true)
                .build();
        
        CinemaConcessionItem saved = cinemaConcessionItemRepository.save(cinemaItem);
        log.info("Added item {} to cinema {} with price {}", itemId, cinemaId, customPrice);
        
        return convertToDTO(saved);
    }

    /**
     * Cập nhật giá item tại rạp
     */
    @Transactional
    public CinemaConcessionItemDTO updateItemPrice(
            Integer cinemaId, 
            Integer itemId, 
            BigDecimal newPrice) {
        
        CinemaConcessionItem cinemaItem = cinemaConcessionItemRepository
                .findByCinemaIdAndItemId(cinemaId, itemId)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại tại rạp này"));
        
        cinemaItem.setCinemaPrice(newPrice);
        CinemaConcessionItem updated = cinemaConcessionItemRepository.save(cinemaItem);
        
        log.info("Updated price for item {} at cinema {} to {}", itemId, cinemaId, newPrice);
        return convertToDTO(updated);
    }

    /**
     * Cập nhật tồn kho
     */
    @Transactional
    public CinemaConcessionItemDTO updateStock(
            Integer cinemaId, 
            Integer itemId, 
            Integer newStock) {
        
        CinemaConcessionItem cinemaItem = cinemaConcessionItemRepository
                .findByCinemaIdAndItemId(cinemaId, itemId)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại tại rạp này"));
        
        cinemaItem.setStockQuantity(newStock);
        CinemaConcessionItem updated = cinemaConcessionItemRepository.save(cinemaItem);
        
        log.info("Updated stock for item {} at cinema {} to {}", itemId, cinemaId, newStock);
        return convertToDTO(updated);
    }

    /**
     * Bật/tắt bán item tại rạp
     */
    @Transactional
    public CinemaConcessionItemDTO toggleAvailability(Integer cinemaId, Integer itemId) {
        CinemaConcessionItem cinemaItem = cinemaConcessionItemRepository
                .findByCinemaIdAndItemId(cinemaId, itemId)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại tại rạp này"));
        
        cinemaItem.setIsAvailable(!cinemaItem.getIsAvailable());
        CinemaConcessionItem updated = cinemaConcessionItemRepository.save(cinemaItem);
        
        log.info("Toggled availability for item {} at cinema {} to {}", 
                itemId, cinemaId, updated.getIsAvailable());
        return convertToDTO(updated);
    }

    /**
     * Xóa item khỏi rạp
     */
    @Transactional
    public void removeItemFromCinema(Integer cinemaId, Integer itemId) {
        cinemaConcessionItemRepository.deleteByCinemaIdAndItemId(cinemaId, itemId);
        log.info("Removed item {} from cinema {}", itemId, cinemaId);
    }

    /**
     * Lấy danh sách items có tồn kho thấp
     */
    @Transactional(readOnly = true)
    public List<CinemaConcessionItemDTO> getLowStockItems(Integer cinemaId, Integer threshold) {
        if (threshold == null) {
            threshold = 20;
        }
        
        List<CinemaConcessionItem> items = cinemaConcessionItemRepository
                .findLowStockItems(cinemaId, threshold);
        
        return items.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Đồng bộ tất cả items mặc định vào rạp mới
     */
    @Transactional
    public void syncAllItemsToNewCinema(Integer cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new RuntimeException("Rạp không tồn tại"));
        
        List<ConcessionItem> allItems = concessionItemRepository.findByIsAvailable(true);
        
        for (ConcessionItem item : allItems) {
            if (!cinemaConcessionItemRepository.existsByCinemaIdAndItemId(cinemaId, item.getId())) {
                CinemaConcessionItem cinemaItem = CinemaConcessionItem.builder()
                        .cinema(cinema)
                        .item(item)
                        .cinemaPrice(item.getPrice()) // Dùng giá mặc định
                        .stockQuantity(0)
                        .isAvailable(true)
                        .build();
                
                cinemaConcessionItemRepository.save(cinemaItem);
            }
        }
        
        log.info("Synced {} items to cinema {}", allItems.size(), cinemaId);
    }

    /**
     * Convert entity to DTO
     */
    private CinemaConcessionItemDTO convertToDTO(CinemaConcessionItem entity) {
        ConcessionItem item = entity.getItem();
        
        return CinemaConcessionItemDTO.builder()
                .cinemaItemId(entity.getId())
                .cinemaId(entity.getCinema().getId())
                .cinemaName(entity.getCinema().getCinemaName())
                .itemId(item.getId())
                .itemName(item.getItemName())
                .description(item.getDescription())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getCategoryName())
                .imageUrl(item.getImageUrl())
                .size(item.getSize())
                .calories(item.getCalories())
                .defaultPrice(item.getPrice())
                .cinemaPrice(entity.getCinemaPrice())
                .effectivePrice(entity.getEffectivePrice())
                .cinemaCostPrice(entity.getCinemaCostPrice())
                .stockQuantity(entity.getStockQuantity())
                .isAvailable(entity.getIsAvailable())
                .itemActive(item.getIsAvailable())
                .displayOrder(entity.getDisplayOrder())
                .notes(entity.getNotes())
                .isCombo(item.getIsCombo())
                .build();
    }
}
