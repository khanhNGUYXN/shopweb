package com.example.shop_app.controller;

import com.example.shop_app.dto.image_product.ImageProductDto;
import com.example.shop_app.entity.ProductImage;
import com.example.shop_app.exceptions.ResourceNotFoundException;
import com.example.shop_app.service.ImageProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Blob;
import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/images")
public class ImageProductController {

    @Autowired
    private ImageProductService imageProductService;

    /**
     * 📌 API: Tải lên ảnh sản phẩm (dạng BLOB)
     */
    @PostMapping("/upload/{productId}")
    public ResponseEntity<?> uploadImages(
            @PathVariable Integer productId,
            @RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body("No files provided!");
        }
        try {
            List<ImageProductDto> savedImages = imageProductService.saveImages(productId, files);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedImages);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading images: " + ex.getMessage());
        }
    }

    /**
     * 📌 API: Lấy danh sách ảnh theo Product ID
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ImageProductDto>> getImagesByProductId(@PathVariable Integer productId) {
        List<ImageProductDto> images = imageProductService.getImagesByProductId(productId);
        return ResponseEntity.ok(images);
    }

    /**
     * 📌 API: Xóa ảnh theo ID
     */
    @DeleteMapping("/delete/{imageId}")
    public ResponseEntity<String> deleteImage(@PathVariable Integer imageId) {
        imageProductService.deleteImageById(imageId);
        return ResponseEntity.ok("Deleted image with ID: " + imageId);
    }

    /**
     * 📌 API: Cập nhật ảnh
     */
    @PutMapping("/update/{imageId}")
    public ResponseEntity<String> updateImage(
            @PathVariable Integer imageId,
            @RequestParam("file") MultipartFile file) {
        imageProductService.updateImage(file, imageId);
        return ResponseEntity.ok("Updated image with ID: " + imageId);
    }

    /**
     * 📌 API: Lấy ảnh từ BLOB và trả về dạng byte stream
     */
    @GetMapping("/download/{imageId}")
    public ResponseEntity<byte[]> downloadImage(@PathVariable Integer imageId) {
        try {
            ProductImage image = imageProductService.getImageById(imageId);
            byte[] imageBytes = image.getImageData().getBytes(1, (int) image.getImageData().length());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error retrieving image: " + e.getMessage()).getBytes());
        }
    }

    // API lấy ảnh theo ID
    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImageById(@PathVariable Integer id) {
        ProductImage image = imageProductService.getImageById(id);

        try {
            Blob blob = image.getImageData(); // Không ép kiểu SerialBlob
            InputStream inputStream = blob.getBinaryStream(); // Đọc dữ liệu ảnh
            byte[] imageBytes = inputStream.readAllBytes(); // Chuyển thành byte[]

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Type", "image/jpeg"); // Định dạng ảnh (hoặc image/png)

            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (SQLException | IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
