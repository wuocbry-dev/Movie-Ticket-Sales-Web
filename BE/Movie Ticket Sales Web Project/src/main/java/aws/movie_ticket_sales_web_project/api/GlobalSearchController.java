package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.GlobalSearchDto;
import aws.movie_ticket_sales_web_project.service.GlobalSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class GlobalSearchController {

    private final GlobalSearchService globalSearchService;

    /**
     * Search movies, promotions, and concession items by keyword
     * GET /api/search?q={keyword}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<GlobalSearchDto>> globalSearch(@RequestParam(name = "q", defaultValue = "") String query) {
        log.info("GET /api/search?q={}", query);
        
        GlobalSearchDto result = globalSearchService.searchAll(query);
        
        return ResponseEntity.ok(ApiResponse.<GlobalSearchDto>builder()
                .success(true)
                .message("Tìm kiếm thành công")
                .data(result)
                .build());
    }
}
