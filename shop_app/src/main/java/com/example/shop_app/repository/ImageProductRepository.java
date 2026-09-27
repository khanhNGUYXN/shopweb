package com.example.shop_app.repository;

import com.example.shop_app.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageProductRepository extends JpaRepository<ProductImage, Integer> {
    List<ProductImage> findByProductId(Integer id);
}
