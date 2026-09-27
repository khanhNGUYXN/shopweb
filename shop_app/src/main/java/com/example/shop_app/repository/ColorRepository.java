package com.example.shop_app.repository;


import com.example.shop_app.entity.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ColorRepository extends JpaRepository<Color, Integer> {
    Optional<Color> findByName(String name);
}
