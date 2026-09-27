package com.example.shop_app.service;

import com.example.shop_app.dto.product.ProductRequestDto;
import com.example.shop_app.entity.*;
import com.example.shop_app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;
import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Autowired
    private SizeRepository sizeRepository;

    @Autowired
    private ImageProductRepository imageProductRepository;

    public Product addProduct(ProductRequestDto request) {
        // Tìm danh mục theo tên (bỏ qua id nếu có)
        Category category = categoryRepository.findByName(request.getCategory_id().getName())
                .orElseThrow(() -> new IllegalArgumentException("Category does not exist: " + request.getCategory_id().getName()));

        // Gán danh mục cho sản phẩm
        request.setCategory_id(category);

        // Lưu sản phẩm vào DB
        return productRepository.save(createProduct(request, category));
    }

    private Product createProduct(ProductRequestDto request, Category category) {
        Product product = new Product(
                request.getName(),
                request.getPrice(),
                null,
                request.getDescription(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                category
        );

        // Gán số lượng tồn
        product.setStockQuantity(request.getStockQuantity());

        // Xử lý danh sách size: tìm theo tên, nếu không tồn tại thì tạo mới và để database tự tạo id
        if (request.getSizes() != null) {
            List<Size> processedSizes = new ArrayList<>();
            for (Size size : request.getSizes()) {
                Size persistedSize = sizeRepository.findByName(size.getName())
                        .orElseGet(() -> {
                            Size newSize = new Size();
                            newSize.setName(size.getName());
                            return sizeRepository.save(newSize);
                        });
                processedSizes.add(persistedSize);
            }
            product.setSizes(processedSizes);
        }

        // Xử lý danh sách màu: tìm theo tên, nếu không tồn tại thì tạo mới và để database tự tạo id
        if (request.getColors() != null) {
            List<Color> processedColors = new ArrayList<>();
            for (Color color : request.getColors()) {
                Color persistedColor = colorRepository.findByName(color.getName())
                        .orElseGet(() -> {
                            Color newColor = new Color();
                            newColor.setName(color.getName());
                            return colorRepository.save(newColor);
                        });
                processedColors.add(persistedColor);
            }
            product.setColors(processedColors);
        }

        return product;
    }

    // Các phương thức tìm kiếm, xóa, v.v...

    // Tìm sản phẩm theo ID
    public Optional<Product> getProductById(Integer id) {
        return productRepository.findById(id);
    }

    // Tìm sản phẩm theo tên (chính xác)
    public Optional<Product> getProductsByName(String name) {
        return productRepository.findByName(name);
    }

    // Tìm kiếm sản phẩm theo tên chứa từ khóa (không phân biệt hoa/thường)
    public Page<Product> searchProductsByName(String name, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    // Lấy danh sách tất cả sản phẩm với phân trang
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    // Lấy danh sách sản phẩm theo tên danh mục với phân trang
    public Page<Product> getProductsByCategoryName(String categoryName, Pageable pageable) {
        return productRepository.findByCategoryNameIgnoreCase(categoryName, pageable);
    }

    // Xóa sản phẩm theo ID
    public boolean deleteProductById(Integer id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }


    // Method to fetch an image by its ID
    private ProductImage getImageById(Integer imageId) {
        Optional<ProductImage> imageOptional = imageProductRepository.findById(imageId);
        if (imageOptional.isPresent()) {
            return imageOptional.get();
        } else {
            throw new RuntimeException("Image not found with id: " + imageId);
        }
    }

    public Product updateProduct(Integer productId, ProductRequestDto request) {
        if (productId == null || request == null) {
            throw new IllegalArgumentException("Product ID and request must not be null");
        }

        Optional<Product> existingProductOpt = productRepository.findById(productId);
        if (!existingProductOpt.isPresent()) {
            throw new RuntimeException("Product not found with id: " + productId);
        }

        Product product = existingProductOpt.get();

        Category category = categoryRepository.findByName(request.getCategory_id().getName())
                .orElseThrow(() -> new RuntimeException("Category not found with name: " + request.getCategory_id().getName()));

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setUpdatedAt(LocalDateTime.now());
        product.setCategory(category);
        product.setStockQuantity(request.getStockQuantity());

        // Xử lý danh sách sizes và colors
        if (request.getSizes() != null) {
            List<Size> processedSizes = new ArrayList<>();
            for (Size size : request.getSizes()) {
                Size persistedSize = sizeRepository.findByName(size.getName())
                        .orElseGet(() -> {
                            Size newSize = new Size();
                            newSize.setName(size.getName());
                            return sizeRepository.save(newSize);
                        });
                processedSizes.add(persistedSize);
            }
            product.setSizes(processedSizes);
        }

        if (request.getColors() != null) {
            List<Color> processedColors = new ArrayList<>();
            for (Color color : request.getColors()) {
                Color persistedColor = colorRepository.findByName(color.getName())
                        .orElseGet(() -> {
                            Color newColor = new Color();
                            newColor.setName(color.getName());
                            return colorRepository.save(newColor);
                        });
                processedColors.add(persistedColor);
            }
            product.setColors(processedColors);
        }


        try {
            return productRepository.save(product);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update product: " + e.getMessage());
        }
    }



}
