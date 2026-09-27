package com.example.shop_app.repository;

import com.example.shop_app.entity.Product;
import com.example.shop_app.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SizeRepository extends JpaRepository<Size, Integer> {
    Optional<Size> findByName(String name);
}
