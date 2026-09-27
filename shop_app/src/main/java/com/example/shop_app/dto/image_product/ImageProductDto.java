package com.example.shop_app.dto.image_product;

import java.time.LocalDateTime;

public class ImageProductDto {
    private Integer id;
    private String imageUrl;
    private LocalDateTime createdAt;

    public ImageProductDto(Integer id, String imageUrl, LocalDateTime createdAt) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
    }

    public ImageProductDto() {

    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
