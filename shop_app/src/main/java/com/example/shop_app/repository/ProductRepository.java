package com.example.shop_app.repository;

import com.example.shop_app.entity.Category;
import com.example.shop_app.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    // Nếu tìm kiếm sản phẩm theo tên danh mục có phân trang
    Page<Product> findByCategoryNameIgnoreCase(String category, Pageable pageable);

    // Nếu tìm kiếm sản phẩm theo tên chứa từ khóa (có phân trang)
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Các phương thức khác vẫn giữ nguyên
    List<Product> findByCategoryNameIgnoreCase(String category);
    List<Product> findByNameContainingIgnoreCase(String name);
    Optional<Product> findByName(String name);
    Optional<Product> findById(Integer id);
    boolean existsByName(String name);
}


