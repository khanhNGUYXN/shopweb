package com.example.shop_app.service;


import com.example.shop_app.dto.image_product.ImageProductDto;
import com.example.shop_app.entity.Product;
import com.example.shop_app.entity.ProductImage;
import com.example.shop_app.exceptions.ResourceNotFoundException;
import com.example.shop_app.repository.ImageProductRepository;
import com.example.shop_app.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;
import java.awt.*;
import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class ImageProductService {

    @Autowired
    private ImageProductRepository imageProductRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    public ProductImage getImageById(Integer id) {
        return imageProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No image found with id: " + id));
    }

    public void deleteImageById(Integer id) {
        imageProductRepository.findById(id).ifPresentOrElse(imageProductRepository::delete, () -> {
            throw new ResourceNotFoundException("No image found with id: " + id);
        });
    }

    public List<ImageProductDto> saveImages(Integer productId, List<MultipartFile> files) {
        Optional<Product> productOpt = productService.getProductById(productId);
        if (!productOpt.isPresent()) {
            throw new ResourceNotFoundException("Product not found with ID: " + productId);
        }

        Product product = productOpt.get();
        List<ImageProductDto> savedImageDto = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                ProductImage image = new ProductImage();
                image.setImageData(new SerialBlob(file.getBytes())); // Lưu dạng BLOB
                image.setCreatedAt(LocalDateTime.now());
                image.setProduct(product);

                // Lưu vào database trước để có ID
                ProductImage savedImage = imageProductRepository.save(image);

                // Tạo URL động từ ID đã có, sửa endpoint cho đúng
                String downloadUrl = "/api/v1/images/download/" + savedImage.getId();
                savedImage.setImageUrl(downloadUrl);

                // Cập nhật lại với URL mới
                imageProductRepository.save(savedImage);

                // Chuyển đổi sang DTO
                ImageProductDto imageDto = new ImageProductDto();
                imageDto.setId(savedImage.getId());
                imageDto.setImageUrl(savedImage.getImageUrl());
                imageDto.setCreatedAt(LocalDateTime.now());
                savedImageDto.add(imageDto);

            } catch (IOException | SQLException e) {
                throw new RuntimeException("Error saving image: " + e.getMessage());
            }
        }

        // Nếu có hình ảnh được lưu và thumbnail của product chưa có, cập nhật thumbnail cho product
        if (!savedImageDto.isEmpty() && product.getThumbnail() == null) {
            product.setThumbnail(savedImageDto.get(0).getImageUrl());
            productRepository.save(product); // Cập nhật lại product
        }

        return savedImageDto;
    }

    public void updateImage(MultipartFile file, Integer imageId) {
        ProductImage image = getImageById(imageId);
        try {
            image.setImageData(new SerialBlob(file.getBytes()));
            image.setCreatedAt(LocalDateTime.now());
            imageProductRepository.save(image);
        } catch (IOException | SQLException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public List<ImageProductDto> getImagesByProductId(Integer productId) {
        List<ProductImage> images = imageProductRepository.findByProductId(productId);

        // Chuyển đổi sang DTO để trả về frontend
        return images.stream().map(image ->
                new ImageProductDto(image.getId(), image.getImageUrl(), image.getCreatedAt())
        ).collect(Collectors.toList());
    }


}
