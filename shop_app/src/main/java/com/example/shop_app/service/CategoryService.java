package com.example.shop_app.service;

import com.example.shop_app.dto.category.CategoryRequestDto;
import com.example.shop_app.entity.Category;
import com.example.shop_app.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public Category createCategory(CategoryRequestDto requestDto) {
        if (categoryRepository.existsByName(requestDto.getName())) {
            throw new RuntimeException("Category name already exists!");
        }

        Category category = new Category();
        category.setName(requestDto.getName());
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Integer id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Category not found with name: " + name));
    }


    public Category updateCategory(Integer id, CategoryRequestDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

        category.setName(dto.getName());
        category.setUpdatedAt(LocalDateTime.now());

        return categoryRepository.save(category);
    }

    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }

}
