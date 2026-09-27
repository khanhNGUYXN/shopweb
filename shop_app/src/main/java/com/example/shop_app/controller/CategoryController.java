package com.example.shop_app.controller;

import com.example.shop_app.dto.category.CategoryRequestDto;
import com.example.shop_app.entity.Category;
import com.example.shop_app.response.ApiResponse;
import com.example.shop_app.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@RestController
@Validated
@RequestMapping("/categories")
public class CategoryController {
    private final CategoryService categoryService;

    // Constructor Injection
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // 🟢 API: Lấy danh sách tất cả Categories
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        try {
            List<Category> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(new ApiResponse<>("Found", categories));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
    }

    // 🟢 API: Thêm Category
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Category>> addCategory(@RequestBody @Valid CategoryRequestDto categoryDto) {
        try {
            Category theCategory = categoryService.createCategory(categoryDto);
            return ResponseEntity.ok(new ApiResponse<>("Success", theCategory));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
    }

    // 🟢 API: Lấy Category theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Integer id) {
        try {
            Category theCategory = categoryService.getCategoryById(id);
            return ResponseEntity.ok(new ApiResponse<>("Found", theCategory));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
    }

    // 🟢 API: Lấy Category theo Tên
    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<Category>> getCategoryByName(@PathVariable String name) {
        try {
            Category theCategory = categoryService.getCategoryByName(name);
            return ResponseEntity.ok(new ApiResponse<>("Found", theCategory));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
    }

    // 🟢 API: Cập nhật Category
    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Integer id, @RequestBody CategoryRequestDto categoryDto) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, categoryDto);
            return ResponseEntity.ok(new ApiResponse<>("Update success!", updatedCategory));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
    }

    // 🟢 API: Xóa Category (Xử lý ràng buộc khóa ngoại)
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(new ApiResponse<>("Deleted successfully", null));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Cannot delete! Category is referenced by other entities.", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Error: " + e.getMessage(), null));
        }
    }
}
