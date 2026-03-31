package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.entity.Promotion;
import aws.movie_ticket_sales_web_project.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public List<Promotion> getAllActive() {
        return promotionRepository.findByIsActiveTrueOrderByStartDateDesc();
    }

    public List<Promotion> getAllForAdmin() {
        return promotionRepository.findAllByOrderByStartDateDesc();
    }

    public Optional<Promotion> getById(Integer id) {
        return promotionRepository.findById(id);
    }

    @Transactional
    public Promotion create(Promotion promotion) {
        if (promotion.getPromotionCode() != null && promotionRepository.existsByPromotionCode(promotion.getPromotionCode())) {
            throw new RuntimeException("Mã khuyến mãi đã tồn tại");
        }
        if (promotion.getIsActive() == null) promotion.setIsActive(true);
        if (promotion.getCurrentUsage() == null) promotion.setCurrentUsage(0);
        promotion.setCreatedAt(Instant.now());
        promotion.setUpdatedAt(Instant.now());
        return promotionRepository.save(promotion);
    }

    @Transactional
    public Promotion update(Integer id, Promotion data) {
        Promotion existing = promotionRepository.findById(id).orElseThrow(() -> new RuntimeException("Khuyến mãi không tồn tại"));
        if (data.getPromotionName() != null) existing.setPromotionName(data.getPromotionName());
        if (data.getPromotionCode() != null) existing.setPromotionCode(data.getPromotionCode());
        if (data.getDescription() != null) existing.setDescription(data.getDescription());
        if (data.getPromotionType() != null) existing.setPromotionType(data.getPromotionType());
        if (data.getDiscountPercentage() != null) existing.setDiscountPercentage(data.getDiscountPercentage());
        if (data.getDiscountAmount() != null) existing.setDiscountAmount(data.getDiscountAmount());
        if (data.getMinPurchaseAmount() != null) existing.setMinPurchaseAmount(data.getMinPurchaseAmount());
        if (data.getMaxDiscountAmount() != null) existing.setMaxDiscountAmount(data.getMaxDiscountAmount());
        if (data.getStartDate() != null) existing.setStartDate(data.getStartDate());
        if (data.getEndDate() != null) existing.setEndDate(data.getEndDate());
        if (data.getMaxUsageTotal() != null) existing.setMaxUsageTotal(data.getMaxUsageTotal());
        if (data.getMaxUsagePerUser() != null) existing.setMaxUsagePerUser(data.getMaxUsagePerUser());
        if (data.getIsActive() != null) existing.setIsActive(data.getIsActive());
        if (data.getApplicableTo() != null) existing.setApplicableTo(data.getApplicableTo());
        if (data.getTargetUserSegments() != null) existing.setTargetUserSegments(data.getTargetUserSegments());
        if (data.getImageUrl() != null) existing.setImageUrl(data.getImageUrl());
        existing.setUpdatedAt(Instant.now());
        return promotionRepository.save(existing);
    }

    @Transactional
    public void delete(Integer id) {
        if (!promotionRepository.existsById(id)) throw new RuntimeException("Khuyến mãi không tồn tại");
        promotionRepository.deleteById(id);
    }
}
