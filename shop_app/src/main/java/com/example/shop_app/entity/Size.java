package com.example.shop_app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "size")
public class Size {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Ví dụ: "S", "M", "L", "XL"
    @Column(nullable = false, unique = true)
    private String name;

    // Quan hệ nhiều-nhiều với Product
    @ManyToMany(mappedBy = "sizes")
    @JsonIgnore
    private List<Product> products = new ArrayList<>();

    // Getters và Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}

