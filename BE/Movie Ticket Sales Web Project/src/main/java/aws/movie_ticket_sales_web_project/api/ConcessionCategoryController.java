package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.entity.ConcessionCategory;
import aws.movie_ticket_sales_web_project.repository.ConcessionCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * API quản lý danh mục bắp nước
 * Ví dụ: Combo, Bắp rang, Nước ngọt, Snacks
 */
@RestController
@RequestMapping("/api/concessions/categories")
@RequiredArgsConstructor
@Slf4j
public class ConcessionCategoryController {

    private final ConcessionCategoryRepository categoryRepository;

    /**
     * Lấy tất cả categories (có sắp xếp)
     * GET /api/concessions/categories
     */
    @GetMapping
    public ResponseEntity<List<ConcessionCategory>> getAllCategories() {
        log.info("Fetching all concession categories");
        List<ConcessionCategory> categories = categoryRepository
                .findByIsActiveTrueOrderByDisplayOrderAsc();
        return ResponseEntity.ok(categories);
    }

    /**
     * Lấy category theo ID
     * GET /api/concessions/categories/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<ConcessionCategory> getCategoryById(@PathVariable Integer id) {
        log.info("Fetching category: {}", id);
        ConcessionCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
        return ResponseEntity.ok(category);
    }

    /**
     * Tạo category mới (Admin only)
     * POST /api/concessions/categories
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<ConcessionCategory> createCategory(
            @RequestBody ConcessionCategory category) {
        
        log.info("Creating new category: {}", category.getCategoryName());
        
        // Check tên đã tồn tại chưa
        if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
            throw new RuntimeException("Tên category đã tồn tại");
        }
        
        category.setCreatedAt(Instant.now());
        category.setUpdatedAt(Instant.now());
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        
        ConcessionCategory saved = categoryRepository.save(category);
        return ResponseEntity.ok(saved);
    }

    /**
     * Cập nhật category (Admin only)
     * PUT /api/concessions/categories/1
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<ConcessionCategory> updateCategory(
            @PathVariable Integer id,
            @RequestBody ConcessionCategory categoryData) {
        
        log.info("Updating category: {}", id);
        
        ConcessionCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
        
        // Check tên trùng (trừ chính nó)
        if (!category.getCategoryName().equals(categoryData.getCategoryName()) 
            && categoryRepository.existsByCategoryName(categoryData.getCategoryName())) {
            throw new RuntimeException("Tên category đã tồn tại");
        }
        
        category.setCategoryName(categoryData.getCategoryName());
        category.setDescription(categoryData.getDescription());
        category.setDisplayOrder(categoryData.getDisplayOrder());
        category.setIsActive(categoryData.getIsActive());
        category.setUpdatedAt(Instant.now());
        
        ConcessionCategory updated = categoryRepository.save(category);
        return ResponseEntity.ok(updated);
    }

    /**
     * Xóa category (Admin only)
     * DELETE /api/concessions/categories/1
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Integer id) {
        log.info("Deleting category: {}", id);
        
        ConcessionCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
        
        // Soft delete: set is_active = false
        category.setIsActive(false);
        categoryRepository.save(category);
        
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }

    /**
     * Bật/tắt category (Admin only)
     * PUT /api/concessions/categories/1/toggle
     */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<ConcessionCategory> toggleCategory(@PathVariable Integer id) {
        log.info("Toggling category: {}", id);
        
        ConcessionCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
        
        category.setIsActive(!category.getIsActive());
        category.setUpdatedAt(Instant.now());
        
        ConcessionCategory updated = categoryRepository.save(category);
        return ResponseEntity.ok(updated);
    }

    /**
     * Cập nhật thứ tự hiển thị (Admin only)
     * PUT /api/concessions/categories/reorder
     */
    @PutMapping("/reorder")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<Map<String, String>> reorderCategories(
            @RequestBody List<Map<String, Integer>> orders) {
        
        log.info("Reordering categories");
        
        for (Map<String, Integer> order : orders) {
            Integer id = order.get("id");
            Integer displayOrder = order.get("displayOrder");
            
            categoryRepository.findById(id).ifPresent(category -> {
                category.setDisplayOrder(displayOrder);
                category.setUpdatedAt(Instant.now());
                categoryRepository.save(category);
            });
        }
        
        return ResponseEntity.ok(Map.of("message", "Categories reordered successfully"));
    }
}
