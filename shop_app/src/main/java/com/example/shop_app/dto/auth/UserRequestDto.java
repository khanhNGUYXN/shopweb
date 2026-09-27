package com.example.shop_app.dto.auth;

import com.example.shop_app.entity.User;

public class UserRequestDto {
    private User user;
    private String roleName;

    // Getters và Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}

