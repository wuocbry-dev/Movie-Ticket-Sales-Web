package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.CinemaConcessionItemDTO;
import aws.movie_ticket_sales_web_project.service.CinemaConcessionService;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CinemaConcessionController Unit Tests")
class CinemaConcessionControllerTest {

    @Mock
    private CinemaConcessionService cinemaConcessionService;

    @InjectMocks
    private CinemaConcessionController cinemaConcessionController;

    private static final Integer CINEMA_ID = 1;
    private static final Integer ITEM_ID = 5;
    private static final Integer CATEGORY_ID = 2;
    private static final Integer CINEMA_ITEM_ID = 10;

    private CinemaConcessionItemDTO createTestConcessionItem() {
        return CinemaConcessionItemDTO.builder()
                .cinemaItemId(CINEMA_ITEM_ID)
                .cinemaId(CINEMA_ID)
                .cinemaName("Test Cinema")
                .itemId(ITEM_ID)
                .itemName("Popcorn")
                .description("Large popcorn")
                .categoryId(CATEGORY_ID)
                .categoryName("Snacks")
                .imageUrl("https://example.com/popcorn.jpg")
                .size("Large")
                .calories(500)
                .defaultPrice(new BigDecimal("50000"))
                .cinemaPrice(new BigDecimal("55000"))
                .effectivePrice(new BigDecimal("55000"))
                .cinemaCostPrice(new BigDecimal("30000"))
                .stockQuantity(100)
                .isAvailable(true)
                .itemActive(true)
                .displayOrder(1)
                .notes("Popular item")
                .isCombo(false)
                .build();
    }

    @Nested
    @DisplayName("getAvailableItems Tests")
    class GetAvailableItemsTests {

        @Test
        @DisplayName("Should return available concession items for cinema successfully")
        void shouldReturnAvailableItemsSuccessfully() {
            // Arrange
            List<CinemaConcessionItemDTO> expectedItems = Arrays.asList(
                    createTestConcessionItem(),
                    CinemaConcessionItemDTO.builder()
                            .cinemaItemId(11)
                            .itemName("Soda")
                            .isAvailable(true)
                            .build()
            );

            when(cinemaConcessionService.getAvailableItemsByCinema(CINEMA_ID))
                    .thenReturn(expectedItems);

            // Act
            ResponseEntity<List<CinemaConcessionItemDTO>> response = 
                    cinemaConcessionController.getAvailableItems(CINEMA_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).hasSize(2);
            assertThat(response.getBody().get(0).getItemName()).isEqualTo("Popcorn");
            verify(cinemaConcessionService).getAvailableItemsByCinema(CINEMA_ID);
        }

        @Test
        @DisplayName("Should return empty list when no items available")
        void shouldReturnEmptyListWhenNoItemsAvailable() {
            // Arrange
            when(cinemaConcessionService.getAvailableItemsByCinema(CINEMA_ID))
                    .thenReturn(Arrays.asList());

            // Act
            ResponseEntity<List<CinemaConcessionItemDTO>> response = 
                    cinemaConcessionController.getAvailableItems(CINEMA_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getAllItems Tests")
    class GetAllItemsTests {

        @Test
        @DisplayName("Should return all items including locked ones for manager")
        void shouldReturnAllItemsIncludingLocked() {
            // Arrange
            List<CinemaConcessionItemDTO> expectedItems = Arrays.asList(
                    createTestConcessionItem(),
                    CinemaConcessionItemDTO.builder()
                            .cinemaItemId(12)
                            .itemName("Locked Item")
                            .isAvailable(false)
                            .build()
            );

            when(cinemaConcessionService.getAllItemsByCinema(CINEMA_ID))
                    .thenReturn(expectedItems);

            // Act
            ResponseEntity<List<CinemaConcessionItemDTO>> response = 
                    cinemaConcessionController.getAllItems(CINEMA_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).hasSize(2);
            verify(cinemaConcessionService).getAllItemsByCinema(CINEMA_ID);
        }

        @Test
        @DisplayName("Should return empty list when cinema has no items")
        void shouldReturnEmptyListWhenNoItems() {
            // Arrange
            when(cinemaConcessionService.getAllItemsByCinema(CINEMA_ID))
                    .thenReturn(Arrays.asList());

            // Act
            ResponseEntity<List<CinemaConcessionItemDTO>> response = 
                    cinemaConcessionController.getAllItems(CINEMA_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getItemsByCategory Tests")
    class GetItemsByCategoryTests {

        @Test
        @DisplayName("Should return items filtered by category successfully")
        void shouldReturnItemsByCategory() {
            // Arrange
            List<CinemaConcessionItemDTO> expectedItems = Arrays.asList(
                    createTestConcessionItem()
            );

            when(cinemaConcessionService.getItemsByCinemaAndCategory(CINEMA_ID, CATEGORY_ID))
                    .thenReturn(expectedItems);

            // Act
            ResponseEntity<List<CinemaConcessionItemDTO>> response = 
                    cinemaConcessionController.getItemsByCategory(CINEMA_ID, CATEGORY_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).hasSize(1);
            assertThat(response.getBody().get(0).getCategoryId()).isEqualTo(CATEGORY_ID);
            verify(cinemaConcessionService).getItemsByCinemaAndCategory(CINEMA_ID, CATEGORY_ID);
        }

        @Test
        @DisplayName("Should return empty list when category has no items")
        void shouldReturnEmptyListWhenCategoryHasNoItems() {
            // Arrange
            when(cinemaConcessionService.getItemsByCinemaAndCategory(CINEMA_ID, 999))
                    .thenReturn(Arrays.asList());

            // Act
            ResponseEntity<List<CinemaConcessionItemDTO>> response = 
                    cinemaConcessionController.getItemsByCategory(CINEMA_ID, 999);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getItemDetails Tests")
    class GetItemDetailsTests {

        @Test
        @DisplayName("Should return item details successfully")
        void shouldReturnItemDetailsSuccessfully() {
            // Arrange
            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();

            when(cinemaConcessionService.getItemByCinemaAndItemId(CINEMA_ID, ITEM_ID))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.getItemDetails(CINEMA_ID, ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getItemId()).isEqualTo(ITEM_ID);
            assertThat(response.getBody().getCinemaId()).isEqualTo(CINEMA_ID);
            verify(cinemaConcessionService).getItemByCinemaAndItemId(CINEMA_ID, ITEM_ID);
        }

        @Test
        @DisplayName("Should handle when item not found at cinema")
        void shouldHandleItemNotFoundAtCinema() {
            // Arrange
            when(cinemaConcessionService.getItemByCinemaAndItemId(CINEMA_ID, 999))
                    .thenReturn(null);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.getItemDetails(CINEMA_ID, 999);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNull();
        }
    }

    @Nested
    @DisplayName("addItemToCinema Tests")
    class AddItemToCinemaTests {

        @Test
        @DisplayName("Should add item to cinema with custom price successfully")
        void shouldAddItemWithCustomPriceSuccessfully() {
            // Arrange
            Map<String, Object> request = new HashMap<>();
            request.put("itemId", ITEM_ID);
            request.put("customPrice", "55000");
            request.put("stockQuantity", 100);

            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();

            when(cinemaConcessionService.addItemToCinema(
                    eq(CINEMA_ID), 
                    eq(ITEM_ID), 
                    eq(new BigDecimal("55000")), 
                    eq(100)))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.addItemToCinema(CINEMA_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getCinemaPrice()).isEqualTo(new BigDecimal("55000"));
            verify(cinemaConcessionService).addItemToCinema(
                    CINEMA_ID, ITEM_ID, new BigDecimal("55000"), 100);
        }

        @Test
        @DisplayName("Should add item to cinema without custom price")
        void shouldAddItemWithoutCustomPrice() {
            // Arrange
            Map<String, Object> request = new HashMap<>();
            request.put("itemId", ITEM_ID);
            request.put("stockQuantity", 50);

            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();
            expectedItem.setCinemaPrice(null);

            when(cinemaConcessionService.addItemToCinema(CINEMA_ID, ITEM_ID, null, 50))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.addItemToCinema(CINEMA_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            verify(cinemaConcessionService).addItemToCinema(CINEMA_ID, ITEM_ID, null, 50);
        }

        @Test
        @DisplayName("Should add item with default stock when not provided")
        void shouldAddItemWithDefaultStock() {
            // Arrange
            Map<String, Object> request = new HashMap<>();
            request.put("itemId", ITEM_ID);

            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();

            when(cinemaConcessionService.addItemToCinema(CINEMA_ID, ITEM_ID, null, 0))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.addItemToCinema(CINEMA_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(cinemaConcessionService).addItemToCinema(CINEMA_ID, ITEM_ID, null, 0);
        }
    }

    @Nested
    @DisplayName("updatePrice Tests")
    class UpdatePriceTests {

        @Test
        @DisplayName("Should update item price successfully")
        void shouldUpdatePriceSuccessfully() {
            // Arrange
            Map<String, BigDecimal> request = new HashMap<>();
            BigDecimal newPrice = new BigDecimal("60000");
            request.put("newPrice", newPrice);

            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();
            expectedItem.setCinemaPrice(newPrice);
            expectedItem.setEffectivePrice(newPrice);

            when(cinemaConcessionService.updateItemPrice(CINEMA_ID, ITEM_ID, newPrice))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.updatePrice(CINEMA_ID, ITEM_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getCinemaPrice()).isEqualTo(newPrice);
            verify(cinemaConcessionService).updateItemPrice(CINEMA_ID, ITEM_ID, newPrice);
        }

        @Test
        @DisplayName("Should handle updating price to zero")
        void shouldHandleUpdatingPriceToZero() {
            // Arrange
            Map<String, BigDecimal> request = new HashMap<>();
            BigDecimal newPrice = BigDecimal.ZERO;
            request.put("newPrice", newPrice);

            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();
            expectedItem.setCinemaPrice(newPrice);

            when(cinemaConcessionService.updateItemPrice(CINEMA_ID, ITEM_ID, newPrice))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.updatePrice(CINEMA_ID, ITEM_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getCinemaPrice()).isEqualTo(newPrice);
        }
    }

    @Nested
    @DisplayName("updateStock Tests")
    class UpdateStockTests {

        @Test
        @DisplayName("Should update stock quantity successfully")
        void shouldUpdateStockSuccessfully() {
            // Arrange
            Map<String, Integer> request = new HashMap<>();
            Integer newStock = 200;
            request.put("stockQuantity", newStock);

            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();
            expectedItem.setStockQuantity(newStock);

            when(cinemaConcessionService.updateStock(CINEMA_ID, ITEM_ID, newStock))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.updateStock(CINEMA_ID, ITEM_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStockQuantity()).isEqualTo(newStock);
            verify(cinemaConcessionService).updateStock(CINEMA_ID, ITEM_ID, newStock);
        }

        @Test
        @DisplayName("Should update stock to zero")
        void shouldUpdateStockToZero() {
            // Arrange
            Map<String, Integer> request = new HashMap<>();
            Integer newStock = 0;
            request.put("stockQuantity", newStock);

            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();
            expectedItem.setStockQuantity(newStock);

            when(cinemaConcessionService.updateStock(CINEMA_ID, ITEM_ID, newStock))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.updateStock(CINEMA_ID, ITEM_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getStockQuantity()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("toggleAvailability Tests")
    class ToggleAvailabilityTests {

        @Test
        @DisplayName("Should toggle availability from true to false")
        void shouldToggleAvailabilityToFalse() {
            // Arrange
            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();
            expectedItem.setIsAvailable(false);

            when(cinemaConcessionService.toggleAvailability(CINEMA_ID, ITEM_ID))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.toggleAvailability(CINEMA_ID, ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getIsAvailable()).isFalse();
            verify(cinemaConcessionService).toggleAvailability(CINEMA_ID, ITEM_ID);
        }

        @Test
        @DisplayName("Should toggle availability from false to true")
        void shouldToggleAvailabilityToTrue() {
            // Arrange
            CinemaConcessionItemDTO expectedItem = createTestConcessionItem();
            expectedItem.setIsAvailable(true);

            when(cinemaConcessionService.toggleAvailability(CINEMA_ID, ITEM_ID))
                    .thenReturn(expectedItem);

            // Act
            ResponseEntity<CinemaConcessionItemDTO> response = 
                    cinemaConcessionController.toggleAvailability(CINEMA_ID, ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getIsAvailable()).isTrue();
        }
    }

    @Nested
    @DisplayName("removeItem Tests")
    class RemoveItemTests {

        @Test
        @DisplayName("Should remove item from cinema successfully")
        void shouldRemoveItemSuccessfully() {
            // Arrange
            doNothing().when(cinemaConcessionService)
                    .removeItemFromCinema(CINEMA_ID, ITEM_ID);

            // Act
            ResponseEntity<Map<String, String>> response = 
                    cinemaConcessionController.removeItem(CINEMA_ID, ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().get("message")).isEqualTo("Item removed successfully");
            verify(cinemaConcessionService).removeItemFromCinema(CINEMA_ID, ITEM_ID);
        }

        @Test
        @DisplayName("Should handle removing non-existent item")
        void shouldHandleRemovingNonExistentItem() {
            // Arrange
            doThrow(new RuntimeException("Item not found"))
                    .when(cinemaConcessionService)
                    .removeItemFromCinema(CINEMA_ID, 999);

            // Act & Assert
            try {
                cinemaConcessionController.removeItem(CINEMA_ID, 999);
            } catch (RuntimeException e) {
                assertThat(e.getMessage()).isEqualTo("Item not found");
            }

            verify(cinemaConcessionService).removeItemFromCinema(CINEMA_ID, 999);
        }
    }

    @Nested
    @DisplayName("getLowStockItems Tests")
    class GetLowStockItemsTests {

        @Test
        @DisplayName("Should return low stock items with default threshold")
        void shouldReturnLowStockItemsWithDefaultThreshold() {
            // Arrange
            List<CinemaConcessionItemDTO> lowStockItems = Arrays.asList(
                    CinemaConcessionItemDTO.builder()
                            .itemName("Low Stock Item 1")
                            .stockQuantity(10)
                            .build(),
                    CinemaConcessionItemDTO.builder()
                            .itemName("Low Stock Item 2")
                            .stockQuantity(15)
                            .build()
            );

            when(cinemaConcessionService.getLowStockItems(CINEMA_ID, 20))
                    .thenReturn(lowStockItems);

            // Act
            ResponseEntity<List<CinemaConcessionItemDTO>> response = 
                    cinemaConcessionController.getLowStockItems(CINEMA_ID, 20);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).hasSize(2);
            assertThat(response.getBody().get(0).getStockQuantity()).isLessThan(20);
            verify(cinemaConcessionService).getLowStockItems(CINEMA_ID, 20);
        }

        @Test
        @DisplayName("Should return low stock items with custom threshold")
        void shouldReturnLowStockItemsWithCustomThreshold() {
            // Arrange
            Integer customThreshold = 50;
            List<CinemaConcessionItemDTO> lowStockItems = Arrays.asList(
                    CinemaConcessionItemDTO.builder()
                            .itemName("Low Stock Item")
                            .stockQuantity(30)
                            .build()
            );

            when(cinemaConcessionService.getLowStockItems(CINEMA_ID, customThreshold))
                    .thenReturn(lowStockItems);

            // Act
            ResponseEntity<List<CinemaConcessionItemDTO>> response = 
                    cinemaConcessionController.getLowStockItems(CINEMA_ID, customThreshold);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(1);
            verify(cinemaConcessionService).getLowStockItems(CINEMA_ID, customThreshold);
        }

        @Test
        @DisplayName("Should return empty list when no low stock items")
        void shouldReturnEmptyListWhenNoLowStockItems() {
            // Arrange
            when(cinemaConcessionService.getLowStockItems(CINEMA_ID, 20))
                    .thenReturn(Arrays.asList());

            // Act
            ResponseEntity<List<CinemaConcessionItemDTO>> response = 
                    cinemaConcessionController.getLowStockItems(CINEMA_ID, 20);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isEmpty();
        }
    }

    @Nested
    @DisplayName("syncAllItems Tests")
    class SyncAllItemsTests {

        @Test
        @DisplayName("Should sync all items to new cinema successfully")
        void shouldSyncAllItemsSuccessfully() {
            // Arrange
            doNothing().when(cinemaConcessionService)
                    .syncAllItemsToNewCinema(CINEMA_ID);

            // Act
            ResponseEntity<Map<String, String>> response = 
                    cinemaConcessionController.syncAllItems(CINEMA_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().get("message")).isEqualTo("Items synced successfully");
            verify(cinemaConcessionService).syncAllItemsToNewCinema(CINEMA_ID);
        }

        @Test
        @DisplayName("Should handle sync error gracefully")
        void shouldHandleSyncError() {
            // Arrange
            doThrow(new RuntimeException("Sync failed"))
                    .when(cinemaConcessionService)
                    .syncAllItemsToNewCinema(999);

            // Act & Assert
            try {
                cinemaConcessionController.syncAllItems(999);
            } catch (RuntimeException e) {
                assertThat(e.getMessage()).isEqualTo("Sync failed");
            }

            verify(cinemaConcessionService).syncAllItemsToNewCinema(999);
        }
    }
}
