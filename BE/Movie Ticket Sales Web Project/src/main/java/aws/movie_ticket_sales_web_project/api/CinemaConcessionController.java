package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.CinemaConcessionItemDTO;
import aws.movie_ticket_sales_web_project.service.CinemaConcessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cinemas/{cinemaId}/concessions")
@RequiredArgsConstructor
@Slf4j
public class CinemaConcessionController {

    private final CinemaConcessionService cinemaConcessionService;

    /**
     * Lấy tất cả items có bán tại rạp (cho khách hàng)
     * GET /api/cinemas/1/concessions
     */
    @GetMapping
    public ResponseEntity<List<CinemaConcessionItemDTO>> getAvailableItems(
            @PathVariable Integer cinemaId) {
        
        log.info("Fetching available concession items for cinema: {}", cinemaId);
        List<CinemaConcessionItemDTO> items = cinemaConcessionService
                .getAvailableItemsByCinema(cinemaId);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Lấy TẤT CẢ items tại rạp, kể cả bị khóa (cho Manager)
     * GET /api/cinemas/1/concessions/all
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<CinemaConcessionItemDTO>> getAllItems(
            @PathVariable Integer cinemaId) {
        
        log.info("Fetching ALL concession items (including locked) for cinema: {}", cinemaId);
        List<CinemaConcessionItemDTO> items = cinemaConcessionService
                .getAllItemsByCinema(cinemaId);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Lấy items theo category tại rạp
     * GET /api/cinemas/1/concessions/category/2
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<CinemaConcessionItemDTO>> getItemsByCategory(
            @PathVariable Integer cinemaId,
            @PathVariable Integer categoryId) {
        
        log.info("Fetching items for cinema {} category {}", cinemaId, categoryId);
        List<CinemaConcessionItemDTO> items = cinemaConcessionService
                .getItemsByCinemaAndCategory(cinemaId, categoryId);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Lấy chi tiết item cụ thể tại rạp
     * GET /api/cinemas/1/concessions/items/5
     */
    @GetMapping("/items/{itemId}")
    public ResponseEntity<CinemaConcessionItemDTO> getItemDetails(
            @PathVariable Integer cinemaId,
            @PathVariable Integer itemId) {
        
        CinemaConcessionItemDTO item = cinemaConcessionService
                .getItemByCinemaAndItemId(cinemaId, itemId);
        
        return ResponseEntity.ok(item);
    }

    /**
     * Thêm item vào rạp (Manager only)
     * POST /api/cinemas/1/concessions/items
     */
    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<CinemaConcessionItemDTO> addItemToCinema(
            @PathVariable Integer cinemaId,
            @RequestBody Map<String, Object> request) {
        
        log.info("=== ADD ITEM TO CINEMA REQUEST ===");
        log.info("Cinema ID from path: {}", cinemaId);
        log.info("Request body: {}", request);
        
        Integer itemId = (Integer) request.get("itemId");
        BigDecimal customPrice = request.containsKey("customPrice") 
                ? new BigDecimal(request.get("customPrice").toString()) 
                : null;
        Integer stockQuantity = request.containsKey("stockQuantity")
                ? (Integer) request.get("stockQuantity")
                : 0;
        
        log.info("Adding item {} to cinema {} with price {}", itemId, cinemaId, customPrice);
        CinemaConcessionItemDTO result = cinemaConcessionService
                .addItemToCinema(cinemaId, itemId, customPrice, stockQuantity);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Cập nhật giá item tại rạp (Manager only)
     * PUT /api/cinemas/1/concessions/items/5/price
     */
    @PutMapping("/items/{itemId}/price")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<CinemaConcessionItemDTO> updatePrice(
            @PathVariable Integer cinemaId,
            @PathVariable Integer itemId,
            @RequestBody Map<String, BigDecimal> request) {
        
        BigDecimal newPrice = request.get("newPrice");
        log.info("Updating price for item {} at cinema {} to {}", itemId, cinemaId, newPrice);
        
        CinemaConcessionItemDTO result = cinemaConcessionService
                .updateItemPrice(cinemaId, itemId, newPrice);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Cập nhật tồn kho (Manager only)
     * PUT /api/cinemas/1/concessions/items/5/stock
     */
    @PutMapping("/items/{itemId}/stock")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<CinemaConcessionItemDTO> updateStock(
            @PathVariable Integer cinemaId,
            @PathVariable Integer itemId,
            @RequestBody Map<String, Integer> request) {
        
        Integer newStock = request.get("stockQuantity");
        log.info("Updating stock for item {} at cinema {} to {}", itemId, cinemaId, newStock);
        
        CinemaConcessionItemDTO result = cinemaConcessionService
                .updateStock(cinemaId, itemId, newStock);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Bật/tắt bán item (Manager only)
     * PUT /api/cinemas/1/concessions/items/5/toggle
     */
    @PutMapping("/items/{itemId}/toggle")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<CinemaConcessionItemDTO> toggleAvailability(
            @PathVariable Integer cinemaId,
            @PathVariable Integer itemId) {
        
        log.info("Toggling availability for item {} at cinema {}", itemId, cinemaId);
        CinemaConcessionItemDTO result = cinemaConcessionService
                .toggleAvailability(cinemaId, itemId);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Xóa item khỏi rạp (Manager only)
     * DELETE /api/cinemas/1/concessions/items/5
     */
    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<Map<String, String>> removeItem(
            @PathVariable Integer cinemaId,
            @PathVariable Integer itemId) {
        
        log.info("Removing item {} from cinema {}", itemId, cinemaId);
        cinemaConcessionService.removeItemFromCinema(cinemaId, itemId);
        
        return ResponseEntity.ok(Map.of("message", "Item removed successfully"));
    }

    /**
     * Lấy items có tồn kho thấp (Manager only)
     * GET /api/cinemas/1/concessions/low-stock?threshold=20
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<CinemaConcessionItemDTO>> getLowStockItems(
            @PathVariable Integer cinemaId,
            @RequestParam(required = false, defaultValue = "20") Integer threshold) {
        
        log.info("Fetching low stock items for cinema {} (threshold: {})", cinemaId, threshold);
        List<CinemaConcessionItemDTO> items = cinemaConcessionService
                .getLowStockItems(cinemaId, threshold);
        
        return ResponseEntity.ok(items);
    }

    /**
     * Đồng bộ tất cả items vào rạp mới (Admin only)
     * POST /api/cinemas/1/concessions/sync
     */
    @PostMapping("/sync")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<Map<String, String>> syncAllItems(@PathVariable Integer cinemaId) {
        log.info("Syncing all items to cinema {}", cinemaId);
        cinemaConcessionService.syncAllItemsToNewCinema(cinemaId);
        
        return ResponseEntity.ok(Map.of("message", "Items synced successfully"));
    }
}
