package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.PointsTransactionDTO;
import aws.movie_ticket_sales_web_project.entity.Membership;
import aws.movie_ticket_sales_web_project.entity.PointsTransaction;
import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.enums.SourceType;
import aws.movie_ticket_sales_web_project.enums.TransactionType;
import aws.movie_ticket_sales_web_project.repository.MembershipRepository;
import aws.movie_ticket_sales_web_project.repository.PointsTransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("LoyaltyPointsController Unit Tests")
class LoyaltyPointsControllerTest {

    @Mock
    private PointsTransactionRepository pointsTransactionRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @InjectMocks
    private LoyaltyPointsController loyaltyPointsController;

    private static final Integer USER_ID = 10;
    private static final Integer AVAILABLE_POINTS = 500;

    private PointsTransaction createTestTransaction(Integer id, Integer amount, TransactionType type) {
        User user = new User();
        user.setId(USER_ID);
        
        PointsTransaction transaction = new PointsTransaction();
        transaction.setId(id);
        transaction.setUser(user);
        transaction.setPointsAmount(amount);
        transaction.setTransactionType(type);
        transaction.setSourceType(SourceType.BOOKING);
        transaction.setSourceId(100);
        transaction.setDescription("Test transaction");
        transaction.setBalanceBefore(1000);
        transaction.setBalanceAfter(1000 + amount);
        transaction.setCreatedAt(Instant.now());
        transaction.setExpiresAt(LocalDate.now().plusYears(1));
        return transaction;
    }

    private Membership createTestMembership() {
        User user = new User();
        user.setId(USER_ID);
        
        Membership membership = new Membership();
        membership.setId(1);
        membership.setUser(user);
        membership.setAvailablePoints(AVAILABLE_POINTS);
        return membership;
    }

    @Nested
    @DisplayName("getPointsHistory Tests")
    class GetPointsHistoryTests {

        @Test
        @DisplayName("Should return points history successfully")
        void shouldReturnPointsHistorySuccessfully() {
            // Arrange
            List<PointsTransaction> transactions = Arrays.asList(
                    createTestTransaction(1, 100, TransactionType.EARN),
                    createTestTransaction(2, -50, TransactionType.REDEEM)
            );
            when(pointsTransactionRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(transactions);

            // Act
            ResponseEntity<ApiResponse<List<PointsTransactionDTO>>> response = 
                    loyaltyPointsController.getPointsHistory(USER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getMessage()).isEqualTo("Lịch sử điểm thưởng");
            assertThat(response.getBody().getData()).hasSize(2);
            
            verify(pointsTransactionRepository).findByUserIdOrderByCreatedAtDesc(USER_ID);
        }

        @Test
        @DisplayName("Should return empty list when no transactions")
        void shouldReturnEmptyListWhenNoTransactions() {
            // Arrange
            when(pointsTransactionRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(Collections.emptyList());

            // Act
            ResponseEntity<ApiResponse<List<PointsTransactionDTO>>> response = 
                    loyaltyPointsController.getPointsHistory(USER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).isEmpty();
        }

        @Test
        @DisplayName("Should handle exception when fetching history")
        void shouldHandleExceptionWhenFetchingHistory() {
            // Arrange
            when(pointsTransactionRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<ApiResponse<List<PointsTransactionDTO>>> response = 
                    loyaltyPointsController.getPointsHistory(USER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Database error");
        }
    }

    @Nested
    @DisplayName("getPointsBalance Tests")
    class GetPointsBalanceTests {

        @Test
        @DisplayName("Should return points balance successfully")
        void shouldReturnPointsBalanceSuccessfully() {
            // Arrange
            Membership membership = createTestMembership();
            when(membershipRepository.findByUserId(USER_ID)).thenReturn(Optional.of(membership));
            
            List<PointsTransaction> transactions = Arrays.asList(
                    createTestTransaction(1, 300, TransactionType.EARN),
                    createTestTransaction(2, 200, TransactionType.EARN),
                    createTestTransaction(3, -100, TransactionType.REDEEM),
                    createTestTransaction(4, -50, TransactionType.REDEEM)
            );
            when(pointsTransactionRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(transactions);

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.getPointsBalance(USER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getMessage()).isEqualTo("Số dư điểm");
            
            Map<String, Object> data = response.getBody().getData();
            assertThat(data.get("userId")).isEqualTo(USER_ID);
            assertThat(data.get("availablePoints")).isEqualTo(AVAILABLE_POINTS);
            assertThat(data.get("totalEarned")).isEqualTo(500);
            assertThat(data.get("totalRedeemed")).isEqualTo(150);
            assertThat(data.get("pointsToVndRate")).isEqualTo(1000);
            
            verify(membershipRepository).findByUserId(USER_ID);
            verify(pointsTransactionRepository).findByUserIdOrderByCreatedAtDesc(USER_ID);
        }

        @Test
        @DisplayName("Should return zero balance when no membership found")
        void shouldReturnZeroBalanceWhenNoMembershipFound() {
            // Arrange
            when(membershipRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.getPointsBalance(USER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            
            Map<String, Object> data = response.getBody().getData();
            assertThat(data.get("userId")).isEqualTo(USER_ID);
            assertThat(data.get("availablePoints")).isEqualTo(0);
            assertThat(data.get("totalEarned")).isEqualTo(0);
            assertThat(data.get("totalRedeemed")).isEqualTo(0);
            
            verify(membershipRepository).findByUserId(USER_ID);
            verify(pointsTransactionRepository, never()).findByUserIdOrderByCreatedAtDesc(anyInt());
        }

        @Test
        @DisplayName("Should handle null available points")
        void shouldHandleNullAvailablePoints() {
            // Arrange
            Membership membership = createTestMembership();
            membership.setAvailablePoints(null);
            when(membershipRepository.findByUserId(USER_ID)).thenReturn(Optional.of(membership));
            when(pointsTransactionRepository.findByUserIdOrderByCreatedAtDesc(USER_ID))
                    .thenReturn(Collections.emptyList());

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.getPointsBalance(USER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            
            Map<String, Object> data = response.getBody().getData();
            assertThat(data.get("availablePoints")).isEqualTo(0);
        }

        @Test
        @DisplayName("Should handle exception when fetching balance")
        void shouldHandleExceptionWhenFetchingBalance() {
            // Arrange
            when(membershipRepository.findByUserId(USER_ID))
                    .thenThrow(new RuntimeException("Database error"));

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.getPointsBalance(USER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Database error");
        }
    }

    @Nested
    @DisplayName("previewPointsDiscount Tests")
    class PreviewPointsDiscountTests {

        @Test
        @DisplayName("Should preview discount successfully with points under limit")
        void shouldPreviewDiscountSuccessfullyWithPointsUnderLimit() {
            // Arrange
            Membership membership = createTestMembership();
            membership.setAvailablePoints(500);
            when(membershipRepository.findByUserId(USER_ID)).thenReturn(Optional.of(membership));
            
            Integer pointsToUse = 200;
            BigDecimal totalAmount = new BigDecimal("1000000");

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.previewPointsDiscount(USER_ID, pointsToUse, totalAmount);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            
            Map<String, Object> data = response.getBody().getData();
            assertThat(data.get("availablePoints")).isEqualTo(500);
            assertThat(data.get("requestedPoints")).isEqualTo(200);
            assertThat(data.get("actualPointsUsed")).isEqualTo(200);
            assertThat(data.get("maxDiscountPercentage")).isEqualTo(50);
            
            verify(membershipRepository).findByUserId(USER_ID);
        }

        @Test
        @DisplayName("Should limit discount to 50% of total amount")
        void shouldLimitDiscountTo50Percent() {
            // Arrange
            Membership membership = createTestMembership();
            membership.setAvailablePoints(1000);
            when(membershipRepository.findByUserId(USER_ID)).thenReturn(Optional.of(membership));
            
            Integer pointsToUse = 800;
            BigDecimal totalAmount = new BigDecimal("1000000");

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.previewPointsDiscount(USER_ID, pointsToUse, totalAmount);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            Map<String, Object> data = response.getBody().getData();
            assertThat(data.get("actualPointsUsed")).isEqualTo(500);
        }

        @Test
        @DisplayName("Should limit discount to available points")
        void shouldLimitDiscountToAvailablePoints() {
            // Arrange
            Membership membership = createTestMembership();
            membership.setAvailablePoints(100);
            when(membershipRepository.findByUserId(USER_ID)).thenReturn(Optional.of(membership));
            
            Integer pointsToUse = 300;
            BigDecimal totalAmount = new BigDecimal("1000000");

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.previewPointsDiscount(USER_ID, pointsToUse, totalAmount);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            Map<String, Object> data = response.getBody().getData();
            assertThat(data.get("actualPointsUsed")).isEqualTo(100);
        }

        @Test
        @DisplayName("Should handle zero available points")
        void shouldHandleZeroAvailablePoints() {
            // Arrange
            Membership membership = createTestMembership();
            membership.setAvailablePoints(0);
            when(membershipRepository.findByUserId(USER_ID)).thenReturn(Optional.of(membership));
            
            Integer pointsToUse = 100;
            BigDecimal totalAmount = new BigDecimal("500000");

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.previewPointsDiscount(USER_ID, pointsToUse, totalAmount);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            Map<String, Object> data = response.getBody().getData();
            assertThat(data.get("actualPointsUsed")).isEqualTo(0);
        }

        @Test
        @DisplayName("Should handle null available points")
        void shouldHandleNullAvailablePointsInPreview() {
            // Arrange
            Membership membership = createTestMembership();
            membership.setAvailablePoints(null);
            when(membershipRepository.findByUserId(USER_ID)).thenReturn(Optional.of(membership));
            
            Integer pointsToUse = 100;
            BigDecimal totalAmount = new BigDecimal("500000");

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.previewPointsDiscount(USER_ID, pointsToUse, totalAmount);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            Map<String, Object> data = response.getBody().getData();
            assertThat(data.get("actualPointsUsed")).isEqualTo(0);
        }

        @Test
        @DisplayName("Should return error when membership not found")
        void shouldReturnErrorWhenMembershipNotFound() {
            // Arrange
            when(membershipRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
            
            Integer pointsToUse = 100;
            BigDecimal totalAmount = new BigDecimal("500000");

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.previewPointsDiscount(USER_ID, pointsToUse, totalAmount);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).isEqualTo("Không tìm thấy thông tin thành viên");
            assertThat(response.getBody().getData()).isNull();
        }

        @Test
        @DisplayName("Should handle exception when previewing discount")
        void shouldHandleExceptionWhenPreviewingDiscount() {
            // Arrange
            when(membershipRepository.findByUserId(USER_ID))
                    .thenThrow(new RuntimeException("Database error"));
            
            Integer pointsToUse = 100;
            BigDecimal totalAmount = new BigDecimal("500000");

            // Act
            ResponseEntity<ApiResponse<Map<String, Object>>> response = 
                    loyaltyPointsController.previewPointsDiscount(USER_ID, pointsToUse, totalAmount);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Database error");
        }
    }
}
