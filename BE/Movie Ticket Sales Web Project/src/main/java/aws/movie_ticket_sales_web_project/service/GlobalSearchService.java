package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.GlobalSearchDto;
import aws.movie_ticket_sales_web_project.dto.GlobalSearchDto.ConcessionSummary;
import aws.movie_ticket_sales_web_project.dto.GlobalSearchDto.MovieSummary;
import aws.movie_ticket_sales_web_project.dto.GlobalSearchDto.PromotionSummary;
import aws.movie_ticket_sales_web_project.entity.ConcessionItem;
import aws.movie_ticket_sales_web_project.entity.Movie;
import aws.movie_ticket_sales_web_project.entity.Promotion;
import aws.movie_ticket_sales_web_project.repository.ConcessionItemRepository;
import aws.movie_ticket_sales_web_project.repository.MovieRepository;
import aws.movie_ticket_sales_web_project.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GlobalSearchService {

    private final MovieRepository movieRepository;
    private final PromotionRepository promotionRepository;
    private final ConcessionItemRepository concessionItemRepository;

    public GlobalSearchDto searchAll(String query) {
        log.info("Searching globally for query: {}", query);
        if (query == null || query.trim().isEmpty()) {
            return GlobalSearchDto.builder().build();
        }

        String keyword = query.trim();
        PageRequest limit5 = PageRequest.of(0, 5);

        // Fetch top 5 movies
        List<Movie> movies = movieRepository.searchByTitle(keyword, limit5);
        List<MovieSummary> movieDtos = movies.stream()
                .map(this::mapMovieToSummaryDto)
                .collect(Collectors.toList());

        // Fetch top 5 promotions
        List<Promotion> promotions = promotionRepository.searchByNameOrCode(keyword, limit5);
        List<PromotionSummary> promotionDtos = promotions.stream()
                .map(this::mapPromotionToDto)
                .collect(Collectors.toList());

        // Fetch top 5 concessions
        List<ConcessionItem> concessions = concessionItemRepository.searchByNameWithPagination(keyword, limit5);
        List<ConcessionSummary> concessionDtos = concessions.stream()
                .map(this::mapConcessionToDto)
                .collect(Collectors.toList());

        return GlobalSearchDto.builder()
                .movies(movieDtos)
                .promotions(promotionDtos)
                .concessions(concessionDtos)
                .build();
    }

    private MovieSummary mapMovieToSummaryDto(Movie movie) {
        return MovieSummary.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .duration(movie.getDurationMinutes())
                .build();
    }

    private PromotionSummary mapPromotionToDto(Promotion promotion) {
        return PromotionSummary.builder()
                .id(promotion.getId())
                .promotionName(promotion.getPromotionName())
                .promotionCode(promotion.getPromotionCode())
                .discountValue(promotion.getDiscountAmount() != null ? promotion.getDiscountAmount() : promotion.getDiscountPercentage())
                .build();
    }

    private ConcessionSummary mapConcessionToDto(ConcessionItem item) {
        return ConcessionSummary.builder()
                .id(item.getId())
                .itemName(item.getItemName())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .build();
    }
}
