package com.example.shop_app.controller;

import com.example.shop_app.dto.product.ProductRequestDto;
import com.example.shop_app.entity.Product;
import com.example.shop_app.response.ApiResponse;
import com.example.shop_app.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Thêm sản phẩm mới
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Product>> addProduct(@RequestBody ProductRequestDto request) {
        Product product = productService.addProduct(request);
        return ResponseEntity.ok(new ApiResponse<>("Product added successfully", product));
    }

    // Lấy danh sách tất cả sản phẩm với phân trang
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<Product>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        Page<Product> products = productService.getAllProducts(PageRequest.of(page, size));
        return ResponseEntity.ok(new ApiResponse<>("Found", products));
    }

    // Lấy sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable Integer id) {
        Product product = productService.getProductById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with ID: " + id));
        return ResponseEntity.ok(new ApiResponse<>("Product found", product));
    }

    // Tìm sản phẩm theo tên (chính xác)
    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<Product>> getProductByName(@PathVariable String name) {
        Optional<Product> product = productService.getProductsByName(name);
        return product.map(value -> ResponseEntity.ok(new ApiResponse<>("Product found", value)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>("Product not found", null)));
    }

    // Tìm kiếm sản phẩm theo tên chứa từ khóa với phân trang
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Product>>> searchProducts(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size) {
        Page<Product> products = productService.searchProductsByName(name, PageRequest.of(page, size));
        if (products.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("No products found", null));
        }
        return ResponseEntity.ok(new ApiResponse<>("Products found", products));
    }

    // Lấy danh sách sản phẩm theo danh mục với phân trang
    @GetMapping("/category")
    public ResponseEntity<ApiResponse<Page<Product>>> getProductsByCategory(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        Page<Product> products = productService.getProductsByCategoryName(name, PageRequest.of(page, size));
        if (products.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("No products found in category: " + name, null));
        }
        return ResponseEntity.ok(new ApiResponse<>("Products found", products));
    }

    // Xóa sản phẩm theo ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Integer id) {
        boolean deleted = productService.deleteProductById(id);
        if (deleted) {
            return ResponseEntity.ok(new ApiResponse<>("Product deleted successfully", "Deleted"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>("Product not found", null));
        }
    }

    @PutMapping("/update/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Product> updateProduct(@PathVariable Integer id, @RequestBody ProductRequestDto request) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product ID");
        }

        try {
            Product updatedProduct = productService.updateProduct(id, request);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


}
