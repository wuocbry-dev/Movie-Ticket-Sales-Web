package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.entity.Promotion;
import aws.movie_ticket_sales_web_project.service.PromotionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@Slf4j
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<List<Promotion>> getAllActive() {
        return ResponseEntity.ok(promotionService.getAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getById(@PathVariable Integer id) {
        return promotionService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<Promotion>> getAllForAdmin() {
        return ResponseEntity.ok(promotionService.getAllForAdmin());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<Promotion> create(@RequestBody Promotion promotion) {
        return ResponseEntity.ok(promotionService.create(promotion));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<Promotion> update(@PathVariable Integer id, @RequestBody Promotion promotion) {
        return ResponseEntity.ok(promotionService.update(id, promotion));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        promotionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
