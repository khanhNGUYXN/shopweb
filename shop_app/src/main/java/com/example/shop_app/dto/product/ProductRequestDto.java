package com.example.shop_app.dto.product;

import com.example.shop_app.entity.Category;
import com.example.shop_app.entity.Color;
import com.example.shop_app.entity.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductRequestDto {
    private String name;
    private BigDecimal price;
    private String thumbnail;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Category category_id;

    // Trường mới
    private Integer stockQuantity;
    private List<Size> sizes;
    private List<Color> colors;

    public ProductRequestDto() {
    }

    // Getters và Setters cho các trường cũ
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Category getCategory_id() {
        return category_id;
    }

    public void setCategory_id(Category category_id) {
        this.category_id = category_id;
    }

    // Getters và Setters cho các trường mới
    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public List<Size> getSizes() {
        return sizes;
    }

    // Sửa lại kiểu tham số từ List<String> sang List<Size>
    public void setSizes(List<Size> sizes) {
        this.sizes = sizes;
    }

    public List<Color> getColors() {
        return colors;
    }

    // Sửa lại kiểu tham số từ List<String> sang List<Color>
    public void setColors(List<Color> colors) {
        this.colors = colors;
    }
}
