package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.entity.ConcessionCategory;
import aws.movie_ticket_sales_web_project.entity.ConcessionItem;
import aws.movie_ticket_sales_web_project.repository.ConcessionCategoryRepository;
import aws.movie_ticket_sales_web_project.repository.ConcessionItemRepository;
import aws.movie_ticket_sales_web_project.service.S3Service;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ConcessionItemController Unit Tests")
class ConcessionItemControllerTest {

    @Mock
    private ConcessionItemRepository itemRepository;

    @Mock
    private ConcessionCategoryRepository categoryRepository;

    @Mock
    private S3Service s3Service;

    @InjectMocks
    private ConcessionItemController concessionItemController;

    private static final Integer ITEM_ID = 1;
    private static final Integer CATEGORY_ID = 1;

    private ConcessionCategory createTestCategory() {
        ConcessionCategory category = new ConcessionCategory();
        category.setId(CATEGORY_ID);
        category.setCategoryName("Combo");
        category.setIsActive(true);
        return category;
    }

    private ConcessionItem createTestItem() {
        ConcessionItem item = new ConcessionItem();
        item.setId(ITEM_ID);
        item.setCategory(createTestCategory());
        item.setItemName("Combo Popcorn");
        item.setDescription("Large popcorn with drink");
        item.setImageUrl("https://example.com/image.jpg");
        item.setPrice(new BigDecimal("100000"));
        item.setCostPrice(new BigDecimal("50000"));
        item.setSize("Large");
        item.setCalories(500);
        item.setIngredients("Corn, butter, salt");
        item.setStockQuantity(100);
        item.setLowStockThreshold(10);
        item.setIsCombo(true);
        item.setIsAvailable(true);
        item.setDisplayOrder(1);
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        return item;
    }

    @Nested
    @DisplayName("getAllItems Tests")
    class GetAllItemsTests {

        @Test
        @DisplayName("Should return all available items")
        void shouldReturnAllAvailableItems() {
            // Arrange
            List<ConcessionItem> items = Arrays.asList(createTestItem(), createTestItem());
            when(itemRepository.findAllAvailableItems()).thenReturn(items);

            // Act
            ResponseEntity<List<ConcessionItem>> response = concessionItemController.getAllItems();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(2);
            verify(itemRepository).findAllAvailableItems();
        }

        @Test
        @DisplayName("Should return empty list when no items available")
        void shouldReturnEmptyListWhenNoItemsAvailable() {
            // Arrange
            when(itemRepository.findAllAvailableItems()).thenReturn(Collections.emptyList());

            // Act
            ResponseEntity<List<ConcessionItem>> response = concessionItemController.getAllItems();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getItemsByCategory Tests")
    class GetItemsByCategoryTests {

        @Test
        @DisplayName("Should return items by category")
        void shouldReturnItemsByCategory() {
            // Arrange
            List<ConcessionItem> items = Arrays.asList(createTestItem());
            when(itemRepository.findByCategoryId(CATEGORY_ID)).thenReturn(items);

            // Act
            ResponseEntity<List<ConcessionItem>> response = 
                    concessionItemController.getItemsByCategory(CATEGORY_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(1);
            verify(itemRepository).findByCategoryId(CATEGORY_ID);
        }
    }

    @Nested
    @DisplayName("getAllCombos Tests")
    class GetAllCombosTests {

        @Test
        @DisplayName("Should return all combo items")
        void shouldReturnAllComboItems() {
            // Arrange
            List<ConcessionItem> combos = Arrays.asList(createTestItem());
            when(itemRepository.findAllCombos()).thenReturn(combos);

            // Act
            ResponseEntity<List<ConcessionItem>> response = concessionItemController.getAllCombos();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(1);
            verify(itemRepository).findAllCombos();
        }
    }

    @Nested
    @DisplayName("getNonComboItems Tests")
    class GetNonComboItemsTests {

        @Test
        @DisplayName("Should return all non-combo items")
        void shouldReturnAllNonComboItems() {
            // Arrange
            ConcessionItem item = createTestItem();
            item.setIsCombo(false);
            List<ConcessionItem> items = Arrays.asList(item);
            when(itemRepository.findAllNonComboItems()).thenReturn(items);

            // Act
            ResponseEntity<List<ConcessionItem>> response = concessionItemController.getNonComboItems();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(1);
            verify(itemRepository).findAllNonComboItems();
        }
    }

    @Nested
    @DisplayName("getItemById Tests")
    class GetItemByIdTests {

        @Test
        @DisplayName("Should return item by ID")
        void shouldReturnItemById() {
            // Arrange
            ConcessionItem item = createTestItem();
            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(item));

            // Act
            ResponseEntity<ConcessionItem> response = concessionItemController.getItemById(ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getId()).isEqualTo(ITEM_ID);
            verify(itemRepository).findById(ITEM_ID);
        }

        @Test
        @DisplayName("Should throw exception when item not found")
        void shouldThrowExceptionWhenItemNotFound() {
            // Arrange
            when(itemRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> concessionItemController.getItemById(999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Item không tồn tại");
        }
    }

    @Nested
    @DisplayName("searchItems Tests")
    class SearchItemsTests {

        @Test
        @DisplayName("Should search items by keyword")
        void shouldSearchItemsByKeyword() {
            // Arrange
            List<ConcessionItem> items = Arrays.asList(createTestItem());
            when(itemRepository.searchByName("Combo")).thenReturn(items);

            // Act
            ResponseEntity<List<ConcessionItem>> response = 
                    concessionItemController.searchItems("Combo");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(1);
            verify(itemRepository).searchByName("Combo");
        }
    }

    @Nested
    @DisplayName("createItem Tests")
    class CreateItemTests {

        @Test
        @DisplayName("Should create item successfully")
        void shouldCreateItemSuccessfully() {
            // Arrange
            ConcessionItem newItem = createTestItem();
            newItem.setId(null);

            ConcessionItem savedItem = createTestItem();

            when(itemRepository.existsByItemName(newItem.getItemName())).thenReturn(false);
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(createTestCategory()));
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(savedItem);

            // Act
            ResponseEntity<ConcessionItem> response = concessionItemController.createItem(newItem);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(newItem.getCreatedAt()).isNotNull();
            assertThat(newItem.getUpdatedAt()).isNotNull();
            verify(itemRepository).save(newItem);
        }

        @Test
        @DisplayName("Should set default values when creating item")
        void shouldSetDefaultValuesWhenCreatingItem() {
            // Arrange
            ConcessionItem newItem = createTestItem();
            newItem.setIsAvailable(null);
            newItem.setIsCombo(null);

            when(itemRepository.existsByItemName(newItem.getItemName())).thenReturn(false);
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(createTestCategory()));
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(newItem);

            // Act
            concessionItemController.createItem(newItem);

            // Assert
            assertThat(newItem.getIsAvailable()).isTrue();
            assertThat(newItem.getIsCombo()).isFalse();
        }

        @Test
        @DisplayName("Should throw exception when item name exists")
        void shouldThrowExceptionWhenItemNameExists() {
            // Arrange
            ConcessionItem newItem = createTestItem();
            when(itemRepository.existsByItemName(newItem.getItemName())).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> concessionItemController.createItem(newItem))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Tên item đã tồn tại");
            verify(itemRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when category is null")
        void shouldThrowExceptionWhenCategoryIsNull() {
            // Arrange
            ConcessionItem newItem = createTestItem();
            newItem.setCategory(null);

            when(itemRepository.existsByItemName(newItem.getItemName())).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> concessionItemController.createItem(newItem))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Category không được để trống");
        }

        @Test
        @DisplayName("Should throw exception when category doesn't exist")
        void shouldThrowExceptionWhenCategoryDoesNotExist() {
            // Arrange
            ConcessionItem newItem = createTestItem();
            when(itemRepository.existsByItemName(newItem.getItemName())).thenReturn(false);
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> concessionItemController.createItem(newItem))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Category không tồn tại");
        }
    }

    @Nested
    @DisplayName("updateItem Tests")
    class UpdateItemTests {

        @Test
        @DisplayName("Should update item successfully")
        void shouldUpdateItemSuccessfully() {
            // Arrange
            ConcessionItem existingItem = createTestItem();
            ConcessionItem updateData = createTestItem();
            updateData.setItemName("Updated Item");
            updateData.setPrice(new BigDecimal("150000"));

            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(existingItem));
            when(itemRepository.existsByItemName("Updated Item")).thenReturn(false);
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(existingItem);

            // Act
            ResponseEntity<ConcessionItem> response = 
                    concessionItemController.updateItem(ITEM_ID, updateData);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(existingItem.getItemName()).isEqualTo("Updated Item");
            assertThat(existingItem.getPrice()).isEqualTo(new BigDecimal("150000"));
            verify(itemRepository).save(existingItem);
        }

        @Test
        @DisplayName("Should update item with same name")
        void shouldUpdateItemWithSameName() {
            // Arrange
            ConcessionItem existingItem = createTestItem();
            ConcessionItem updateData = createTestItem();

            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(existingItem));
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(existingItem);

            // Act
            ResponseEntity<ConcessionItem> response = 
                    concessionItemController.updateItem(ITEM_ID, updateData);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(itemRepository, never()).existsByItemName(anyString());
        }

        @Test
        @DisplayName("Should throw exception when item not found")
        void shouldThrowExceptionWhenItemNotFound() {
            // Arrange
            ConcessionItem updateData = createTestItem();
            when(itemRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> concessionItemController.updateItem(999, updateData))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Item không tồn tại");
        }

        @Test
        @DisplayName("Should throw exception when new name exists")
        void shouldThrowExceptionWhenNewNameExists() {
            // Arrange
            ConcessionItem existingItem = createTestItem();
            ConcessionItem updateData = createTestItem();
            updateData.setItemName("Existing Name");

            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(existingItem));
            when(itemRepository.existsByItemName("Existing Name")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> concessionItemController.updateItem(ITEM_ID, updateData))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Tên item đã tồn tại");
        }
    }

    @Nested
    @DisplayName("deleteItem Tests")
    class DeleteItemTests {

        @Test
        @DisplayName("Should soft delete item successfully")
        void shouldSoftDeleteItemSuccessfully() {
            // Arrange
            ConcessionItem item = createTestItem();
            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(item));
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(item);

            // Act
            ResponseEntity<Map<String, String>> response = 
                    concessionItemController.deleteItem(ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().get("message")).isEqualTo("Item deleted successfully");
            assertThat(item.getIsAvailable()).isFalse();
            verify(itemRepository).save(item);
        }

        @Test
        @DisplayName("Should throw exception when item not found")
        void shouldThrowExceptionWhenItemNotFound() {
            // Arrange
            when(itemRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> concessionItemController.deleteItem(999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Item không tồn tại");
        }
    }

    @Nested
    @DisplayName("toggleItem Tests")
    class ToggleItemTests {

        @Test
        @DisplayName("Should toggle item from available to unavailable")
        void shouldToggleItemFromAvailableToUnavailable() {
            // Arrange
            ConcessionItem item = createTestItem();
            item.setIsAvailable(true);

            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(item));
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(item);

            // Act
            ResponseEntity<ConcessionItem> response = concessionItemController.toggleItem(ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(item.getIsAvailable()).isFalse();
            verify(itemRepository).save(item);
        }

        @Test
        @DisplayName("Should toggle item from unavailable to available")
        void shouldToggleItemFromUnavailableToAvailable() {
            // Arrange
            ConcessionItem item = createTestItem();
            item.setIsAvailable(false);

            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(item));
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(item);

            // Act
            ResponseEntity<ConcessionItem> response = concessionItemController.toggleItem(ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(item.getIsAvailable()).isTrue();
        }
    }

    @Nested
    @DisplayName("getLowStockItems Tests")
    class GetLowStockItemsTests {

        @Test
        @DisplayName("Should return low stock items")
        void shouldReturnLowStockItems() {
            // Arrange
            ConcessionItem item = createTestItem();
            item.setStockQuantity(5);
            List<ConcessionItem> items = Arrays.asList(item);
            when(itemRepository.findLowStockItems()).thenReturn(items);

            // Act
            ResponseEntity<List<ConcessionItem>> response = 
                    concessionItemController.getLowStockItems();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(1);
            verify(itemRepository).findLowStockItems();
        }
    }

    @Nested
    @DisplayName("getItemStats Tests")
    class GetItemStatsTests {

        @Test
        @DisplayName("Should return item statistics")
        void shouldReturnItemStatistics() {
            // Arrange
            when(itemRepository.countAvailableItems()).thenReturn(100L);
            when(itemRepository.countAvailableCombos()).thenReturn(30L);

            // Act
            ResponseEntity<Map<String, Object>> response = 
                    concessionItemController.getItemStats();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().get("totalItems")).isEqualTo(100L);
            assertThat(response.getBody().get("totalCombos")).isEqualTo(30L);
            assertThat(response.getBody().get("totalNonCombos")).isEqualTo(70L);
        }
    }

    @Nested
    @DisplayName("uploadItemImage Tests")
    class UploadItemImageTests {

        @Test
        @DisplayName("Should upload image successfully")
        void shouldUploadImageSuccessfully() throws IOException {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.jpg", "image/jpeg", "test image content".getBytes());
            ConcessionItem item = createTestItem();
            item.setImageUrl(null);

            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(item));
            when(s3Service.uploadConcessionImage(file)).thenReturn("https://s3.amazonaws.com/new-image.jpg");
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(item);

            // Act
            ResponseEntity<Map<String, Object>> response = 
                    concessionItemController.uploadItemImage(ITEM_ID, file);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().get("success")).isEqualTo(true);
            assertThat(response.getBody().get("imageUrl")).isEqualTo("https://s3.amazonaws.com/new-image.jpg");
            verify(s3Service).uploadConcessionImage(file);
        }

        @Test
        @DisplayName("Should replace old image when uploading new one")
        void shouldReplaceOldImageWhenUploadingNewOne() throws IOException {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.jpg", "image/jpeg", "test image content".getBytes());
            ConcessionItem item = createTestItem();
            String oldImageUrl = "https://s3.amazonaws.com/old-image.jpg";
            item.setImageUrl(oldImageUrl);

            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(item));
            when(s3Service.uploadConcessionImage(file)).thenReturn("https://s3.amazonaws.com/new-image.jpg");
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(item);

            // Act
            ResponseEntity<Map<String, Object>> response = 
                    concessionItemController.uploadItemImage(ITEM_ID, file);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(s3Service).deleteFileByUrl(oldImageUrl);
            verify(s3Service).uploadConcessionImage(file);
        }

        @Test
        @DisplayName("Should return bad request when file is empty")
        void shouldReturnBadRequestWhenFileIsEmpty() {
            // Arrange
            MockMultipartFile emptyFile = new MockMultipartFile(
                    "file", "test.jpg", "image/jpeg", new byte[0]);

            // Act
            ResponseEntity<Map<String, Object>> response = 
                    concessionItemController.uploadItemImage(ITEM_ID, emptyFile);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().get("success")).isEqualTo(false);
            assertThat(response.getBody().get("message")).isEqualTo("File không được để trống");
        }

        @Test
        @DisplayName("Should return bad request when file is not an image")
        void shouldReturnBadRequestWhenFileIsNotImage() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.txt", "text/plain", "test content".getBytes());

            // Act
            ResponseEntity<Map<String, Object>> response = 
                    concessionItemController.uploadItemImage(ITEM_ID, file);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().get("success")).isEqualTo(false);
            assertThat(response.getBody().get("message")).isEqualTo("File phải là hình ảnh (jpg, png, gif, webp)");
        }

        @Test
        @DisplayName("Should return bad request when file size exceeds limit")
        void shouldReturnBadRequestWhenFileSizeExceedsLimit() {
            // Arrange
            byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
            MockMultipartFile largeFile = new MockMultipartFile(
                    "file", "test.jpg", "image/jpeg", largeContent);

            // Act
            ResponseEntity<Map<String, Object>> response = 
                    concessionItemController.uploadItemImage(ITEM_ID, largeFile);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().get("success")).isEqualTo(false);
            assertThat(response.getBody().get("message")).isEqualTo("File không được vượt quá 5MB");
        }
    }

    @Nested
    @DisplayName("deleteItemImage Tests")
    class DeleteItemImageTests {

        @Test
        @DisplayName("Should delete image successfully")
        void shouldDeleteImageSuccessfully() throws Exception {
            // Arrange
            ConcessionItem item = createTestItem();
            item.setImageUrl("https://s3.amazonaws.com/image.jpg");

            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(item));
            doNothing().when(s3Service).deleteFileByUrl(anyString());
            when(itemRepository.save(any(ConcessionItem.class))).thenReturn(item);

            // Act
            ResponseEntity<Map<String, Object>> response = 
                    concessionItemController.deleteItemImage(ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().get("success")).isEqualTo(true);
            assertThat(item.getImageUrl()).isNull();
            verify(s3Service).deleteFileByUrl("https://s3.amazonaws.com/image.jpg");
        }

        @Test
        @DisplayName("Should return bad request when item has no image")
        void shouldReturnBadRequestWhenItemHasNoImage() {
            // Arrange
            ConcessionItem item = createTestItem();
            item.setImageUrl(null);

            when(itemRepository.findById(ITEM_ID)).thenReturn(Optional.of(item));

            // Act
            ResponseEntity<Map<String, Object>> response = 
                    concessionItemController.deleteItemImage(ITEM_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().get("success")).isEqualTo(false);
            assertThat(response.getBody().get("message")).isEqualTo("Item không có hình ảnh");
        }
    }

    @Nested
    @DisplayName("createItemWithImage Tests")
    class CreateItemWithImageTests {

        @Test
        @DisplayName("Should create item with image successfully")
        void shouldCreateItemWithImageSuccessfully() throws Exception {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.jpg", "image/jpeg", "test content".getBytes());
            
            ConcessionCategory category = createTestCategory();
            when(itemRepository.existsByItemName("New Item")).thenReturn(false);
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(category));
            when(s3Service.uploadConcessionImage(file)).thenReturn("https://s3.amazonaws.com/image.jpg");
            when(itemRepository.save(any(ConcessionItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            ResponseEntity<Map<String, Object>> response = concessionItemController.createItemWithImage(
                    "New Item", CATEGORY_ID, "100000", "Description", "50000",
                    "Large", 500, "Ingredients", true, "combo items", 1, file);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().get("success")).isEqualTo(true);
            verify(s3Service).uploadConcessionImage(file);
            verify(itemRepository).save(any(ConcessionItem.class));
        }

        @Test
        @DisplayName("Should create item without image")
        void shouldCreateItemWithoutImage() {
            // Arrange
            ConcessionCategory category = createTestCategory();
            when(itemRepository.existsByItemName("New Item")).thenReturn(false);
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(category));
            when(itemRepository.save(any(ConcessionItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            ResponseEntity<Map<String, Object>> response = concessionItemController.createItemWithImage(
                    "New Item", CATEGORY_ID, "100000", null, null,
                    null, null, null, false, null, 0, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().get("success")).isEqualTo(true);
            verify(itemRepository).save(any(ConcessionItem.class));
        }

        @Test
        @DisplayName("Should return bad request when item name exists")
        void shouldReturnBadRequestWhenItemNameExists() {
            // Arrange
            when(itemRepository.existsByItemName("Existing Item")).thenReturn(true);

            // Act
            ResponseEntity<Map<String, Object>> response = concessionItemController.createItemWithImage(
                    "Existing Item", CATEGORY_ID, "100000", null, null,
                    null, null, null, false, null, 0, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().get("success")).isEqualTo(false);
            assertThat(response.getBody().get("message")).isEqualTo("Tên item đã tồn tại");
        }

        @Test
        @DisplayName("Should return bad request when file is not an image")
        void shouldReturnBadRequestWhenFileIsNotImage() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.txt", "text/plain", "test content".getBytes());
            
            ConcessionCategory category = createTestCategory();
            when(itemRepository.existsByItemName("New Item")).thenReturn(false);
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(category));

            // Act
            ResponseEntity<Map<String, Object>> response = concessionItemController.createItemWithImage(
                    "New Item", CATEGORY_ID, "100000", null, null,
                    null, null, null, false, null, 0, file);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().get("success")).isEqualTo(false);
            assertThat(response.getBody().get("message")).isEqualTo("File phải là hình ảnh");
        }

        @Test
        @DisplayName("Should return bad request when file size exceeds limit")
        void shouldReturnBadRequestWhenFileSizeExceedsLimit() {
            // Arrange
            byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
            MockMultipartFile largeFile = new MockMultipartFile(
                    "file", "test.jpg", "image/jpeg", largeContent);
            
            ConcessionCategory category = createTestCategory();
            when(itemRepository.existsByItemName("New Item")).thenReturn(false);
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(category));

            // Act
            ResponseEntity<Map<String, Object>> response = concessionItemController.createItemWithImage(
                    "New Item", CATEGORY_ID, "100000", null, null,
                    null, null, null, false, null, 0, largeFile);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().get("success")).isEqualTo(false);
            assertThat(response.getBody().get("message")).isEqualTo("File không được vượt quá 5MB");
        }
    }
}
