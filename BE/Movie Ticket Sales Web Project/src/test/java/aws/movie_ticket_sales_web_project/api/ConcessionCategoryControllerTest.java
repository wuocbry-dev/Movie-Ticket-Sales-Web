package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.entity.ConcessionCategory;
import aws.movie_ticket_sales_web_project.repository.ConcessionCategoryRepository;
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

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ConcessionCategoryController Unit Tests")
class ConcessionCategoryControllerTest {

    @Mock
    private ConcessionCategoryRepository categoryRepository;

    @InjectMocks
    private ConcessionCategoryController concessionCategoryController;

    private static final Integer CATEGORY_ID = 1;

    private ConcessionCategory createTestCategory() {
        ConcessionCategory category = new ConcessionCategory();
        category.setId(CATEGORY_ID);
        category.setCategoryName("Combo");
        category.setDescription("Combo meals");
        category.setDisplayOrder(1);
        category.setIsActive(true);
        category.setCreatedAt(Instant.now());
        category.setUpdatedAt(Instant.now());
        return category;
    }

    @Nested
    @DisplayName("getAllCategories Tests")
    class GetAllCategoriesTests {

        @Test
        @DisplayName("Should return all active categories ordered by display order")
        void shouldReturnAllActiveCategoriesOrdered() {
            // Arrange
            List<ConcessionCategory> categories = Arrays.asList(
                    createTestCategory(),
                    createAnotherCategory()
            );

            when(categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc())
                    .thenReturn(categories);

            // Act
            ResponseEntity<List<ConcessionCategory>> response = 
                    concessionCategoryController.getAllCategories();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).hasSize(2);
            assertThat(response.getBody().get(0).getCategoryName()).isEqualTo("Combo");
            verify(categoryRepository).findByIsActiveTrueOrderByDisplayOrderAsc();
        }

        @Test
        @DisplayName("Should return empty list when no active categories")
        void shouldReturnEmptyListWhenNoActiveCategories() {
            // Arrange
            when(categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc())
                    .thenReturn(Collections.emptyList());

            // Act
            ResponseEntity<List<ConcessionCategory>> response = 
                    concessionCategoryController.getAllCategories();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).isEmpty();
        }

        private ConcessionCategory createAnotherCategory() {
            ConcessionCategory category = new ConcessionCategory();
            category.setId(2);
            category.setCategoryName("Snacks");
            category.setDescription("Snack items");
            category.setDisplayOrder(2);
            category.setIsActive(true);
            category.setCreatedAt(Instant.now());
            category.setUpdatedAt(Instant.now());
            return category;
        }
    }

    @Nested
    @DisplayName("getCategoryById Tests")
    class GetCategoryByIdTests {

        @Test
        @DisplayName("Should return category by ID successfully")
        void shouldReturnCategoryByIdSuccessfully() {
            // Arrange
            ConcessionCategory category = createTestCategory();
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(category));

            // Act
            ResponseEntity<ConcessionCategory> response = 
                    concessionCategoryController.getCategoryById(CATEGORY_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getId()).isEqualTo(CATEGORY_ID);
            assertThat(response.getBody().getCategoryName()).isEqualTo("Combo");
            verify(categoryRepository).findById(CATEGORY_ID);
        }

        @Test
        @DisplayName("Should throw exception when category not found")
        void shouldThrowExceptionWhenCategoryNotFound() {
            // Arrange
            when(categoryRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> concessionCategoryController.getCategoryById(999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Category không tồn tại");
            verify(categoryRepository).findById(999);
        }
    }

    @Nested
    @DisplayName("createCategory Tests")
    class CreateCategoryTests {

        @Test
        @DisplayName("Should create category successfully")
        void shouldCreateCategorySuccessfully() {
            // Arrange
            ConcessionCategory newCategory = new ConcessionCategory();
            newCategory.setCategoryName("New Category");
            newCategory.setDescription("New Description");
            newCategory.setDisplayOrder(3);

            ConcessionCategory savedCategory = createTestCategory();
            savedCategory.setCategoryName("New Category");

            when(categoryRepository.existsByCategoryName("New Category")).thenReturn(false);
            when(categoryRepository.save(any(ConcessionCategory.class))).thenReturn(savedCategory);

            // Act
            ResponseEntity<ConcessionCategory> response = 
                    concessionCategoryController.createCategory(newCategory);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getCategoryName()).isEqualTo("New Category");
            assertThat(newCategory.getCreatedAt()).isNotNull();
            assertThat(newCategory.getUpdatedAt()).isNotNull();
            assertThat(newCategory.getIsActive()).isTrue();
            verify(categoryRepository).existsByCategoryName("New Category");
            verify(categoryRepository).save(newCategory);
        }

        @Test
        @DisplayName("Should set isActive to true if null")
        void shouldSetIsActiveToTrueIfNull() {
            // Arrange
            ConcessionCategory newCategory = new ConcessionCategory();
            newCategory.setCategoryName("Test Category");
            newCategory.setIsActive(null);

            ConcessionCategory savedCategory = createTestCategory();
            when(categoryRepository.existsByCategoryName("Test Category")).thenReturn(false);
            when(categoryRepository.save(any(ConcessionCategory.class))).thenReturn(savedCategory);

            // Act
            concessionCategoryController.createCategory(newCategory);

            // Assert
            assertThat(newCategory.getIsActive()).isTrue();
        }

        @Test
        @DisplayName("Should throw exception when category name already exists")
        void shouldThrowExceptionWhenCategoryNameExists() {
            // Arrange
            ConcessionCategory newCategory = new ConcessionCategory();
            newCategory.setCategoryName("Combo");

            when(categoryRepository.existsByCategoryName("Combo")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> concessionCategoryController.createCategory(newCategory))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Tên category đã tồn tại");
            verify(categoryRepository).existsByCategoryName("Combo");
            verify(categoryRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("updateCategory Tests")
    class UpdateCategoryTests {

        @Test
        @DisplayName("Should update category successfully")
        void shouldUpdateCategorySuccessfully() {
            // Arrange
            ConcessionCategory existingCategory = createTestCategory();
            ConcessionCategory updateData = new ConcessionCategory();
            updateData.setCategoryName("Updated Combo");
            updateData.setDescription("Updated description");
            updateData.setDisplayOrder(5);
            updateData.setIsActive(false);

            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(existingCategory));
            when(categoryRepository.existsByCategoryName("Updated Combo")).thenReturn(false);
            when(categoryRepository.save(any(ConcessionCategory.class))).thenReturn(existingCategory);

            // Act
            ResponseEntity<ConcessionCategory> response = 
                    concessionCategoryController.updateCategory(CATEGORY_ID, updateData);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(existingCategory.getCategoryName()).isEqualTo("Updated Combo");
            assertThat(existingCategory.getDescription()).isEqualTo("Updated description");
            assertThat(existingCategory.getDisplayOrder()).isEqualTo(5);
            assertThat(existingCategory.getIsActive()).isFalse();
            assertThat(existingCategory.getUpdatedAt()).isNotNull();
            verify(categoryRepository).findById(CATEGORY_ID);
            verify(categoryRepository).save(existingCategory);
        }

        @Test
        @DisplayName("Should update category with same name")
        void shouldUpdateCategoryWithSameName() {
            // Arrange
            ConcessionCategory existingCategory = createTestCategory();
            ConcessionCategory updateData = new ConcessionCategory();
            updateData.setCategoryName("Combo"); // Same name
            updateData.setDescription("New description");
            updateData.setDisplayOrder(2);
            updateData.setIsActive(true);

            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(existingCategory));
            when(categoryRepository.save(any(ConcessionCategory.class))).thenReturn(existingCategory);

            // Act
            ResponseEntity<ConcessionCategory> response = 
                    concessionCategoryController.updateCategory(CATEGORY_ID, updateData);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(categoryRepository, never()).existsByCategoryName(anyString());
            verify(categoryRepository).save(existingCategory);
        }

        @Test
        @DisplayName("Should throw exception when category not found")
        void shouldThrowExceptionWhenCategoryNotFound() {
            // Arrange
            ConcessionCategory updateData = new ConcessionCategory();
            updateData.setCategoryName("Updated");

            when(categoryRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> concessionCategoryController.updateCategory(999, updateData))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Category không tồn tại");
        }

        @Test
        @DisplayName("Should throw exception when new name already exists")
        void shouldThrowExceptionWhenNewNameExists() {
            // Arrange
            ConcessionCategory existingCategory = createTestCategory();
            ConcessionCategory updateData = new ConcessionCategory();
            updateData.setCategoryName("Snacks"); // Different name that exists

            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(existingCategory));
            when(categoryRepository.existsByCategoryName("Snacks")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> concessionCategoryController.updateCategory(CATEGORY_ID, updateData))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Tên category đã tồn tại");
            verify(categoryRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("deleteCategory Tests")
    class DeleteCategoryTests {

        @Test
        @DisplayName("Should soft delete category successfully")
        void shouldSoftDeleteCategorySuccessfully() {
            // Arrange
            ConcessionCategory category = createTestCategory();
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(category));
            when(categoryRepository.save(any(ConcessionCategory.class))).thenReturn(category);

            // Act
            ResponseEntity<Map<String, String>> response = 
                    concessionCategoryController.deleteCategory(CATEGORY_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().get("message")).isEqualTo("Category deleted successfully");
            assertThat(category.getIsActive()).isFalse();
            verify(categoryRepository).findById(CATEGORY_ID);
            verify(categoryRepository).save(category);
        }

        @Test
        @DisplayName("Should throw exception when category not found")
        void shouldThrowExceptionWhenCategoryNotFound() {
            // Arrange
            when(categoryRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> concessionCategoryController.deleteCategory(999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Category không tồn tại");
            verify(categoryRepository).findById(999);
            verify(categoryRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("toggleCategory Tests")
    class ToggleCategoryTests {

        @Test
        @DisplayName("Should toggle category from active to inactive")
        void shouldToggleCategoryFromActiveToInactive() {
            // Arrange
            ConcessionCategory category = createTestCategory();
            category.setIsActive(true);

            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(category));
            when(categoryRepository.save(any(ConcessionCategory.class))).thenReturn(category);

            // Act
            ResponseEntity<ConcessionCategory> response = 
                    concessionCategoryController.toggleCategory(CATEGORY_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(category.getIsActive()).isFalse();
            assertThat(category.getUpdatedAt()).isNotNull();
            verify(categoryRepository).findById(CATEGORY_ID);
            verify(categoryRepository).save(category);
        }

        @Test
        @DisplayName("Should toggle category from inactive to active")
        void shouldToggleCategoryFromInactiveToActive() {
            // Arrange
            ConcessionCategory category = createTestCategory();
            category.setIsActive(false);

            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(category));
            when(categoryRepository.save(any(ConcessionCategory.class))).thenReturn(category);

            // Act
            ResponseEntity<ConcessionCategory> response = 
                    concessionCategoryController.toggleCategory(CATEGORY_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(category.getIsActive()).isTrue();
        }

        @Test
        @DisplayName("Should throw exception when category not found")
        void shouldThrowExceptionWhenCategoryNotFound() {
            // Arrange
            when(categoryRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> concessionCategoryController.toggleCategory(999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Category không tồn tại");
        }
    }

    @Nested
    @DisplayName("reorderCategories Tests")
    class ReorderCategoriesTests {

        @Test
        @DisplayName("Should reorder categories successfully")
        void shouldReorderCategoriesSuccessfully() {
            // Arrange
            ConcessionCategory category1 = createTestCategory();
            category1.setId(1);
            ConcessionCategory category2 = createTestCategory();
            category2.setId(2);

            List<Map<String, Integer>> orders = new ArrayList<>();
            Map<String, Integer> order1 = new HashMap<>();
            order1.put("id", 1);
            order1.put("displayOrder", 10);
            orders.add(order1);

            Map<String, Integer> order2 = new HashMap<>();
            order2.put("id", 2);
            order2.put("displayOrder", 5);
            orders.add(order2);

            when(categoryRepository.findById(1)).thenReturn(Optional.of(category1));
            when(categoryRepository.findById(2)).thenReturn(Optional.of(category2));
            when(categoryRepository.save(any(ConcessionCategory.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            ResponseEntity<Map<String, String>> response = 
                    concessionCategoryController.reorderCategories(orders);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().get("message")).isEqualTo("Categories reordered successfully");
            assertThat(category1.getDisplayOrder()).isEqualTo(10);
            assertThat(category2.getDisplayOrder()).isEqualTo(5);
            assertThat(category1.getUpdatedAt()).isNotNull();
            assertThat(category2.getUpdatedAt()).isNotNull();
            verify(categoryRepository, times(2)).findById(anyInt());
            verify(categoryRepository, times(2)).save(any(ConcessionCategory.class));
        }

        @Test
        @DisplayName("Should skip non-existent categories during reorder")
        void shouldSkipNonExistentCategoriesDuringReorder() {
            // Arrange
            ConcessionCategory category1 = createTestCategory();
            category1.setId(1);

            List<Map<String, Integer>> orders = new ArrayList<>();
            Map<String, Integer> order1 = new HashMap<>();
            order1.put("id", 1);
            order1.put("displayOrder", 10);
            orders.add(order1);

            Map<String, Integer> order2 = new HashMap<>();
            order2.put("id", 999); // Non-existent
            order2.put("displayOrder", 5);
            orders.add(order2);

            when(categoryRepository.findById(1)).thenReturn(Optional.of(category1));
            when(categoryRepository.findById(999)).thenReturn(Optional.empty());
            when(categoryRepository.save(any(ConcessionCategory.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            ResponseEntity<Map<String, String>> response = 
                    concessionCategoryController.reorderCategories(orders);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(category1.getDisplayOrder()).isEqualTo(10);
            verify(categoryRepository).findById(1);
            verify(categoryRepository).findById(999);
            verify(categoryRepository, times(1)).save(any(ConcessionCategory.class)); // Only saved once
        }

        @Test
        @DisplayName("Should handle empty reorder list")
        void shouldHandleEmptyReorderList() {
            // Arrange
            List<Map<String, Integer>> orders = new ArrayList<>();

            // Act
            ResponseEntity<Map<String, String>> response = 
                    concessionCategoryController.reorderCategories(orders);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().get("message")).isEqualTo("Categories reordered successfully");
            verify(categoryRepository, never()).findById(anyInt());
            verify(categoryRepository, never()).save(any());
        }
    }
}
