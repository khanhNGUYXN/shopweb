package com.example.shop_app.entity;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sử dụng UUID làm token
    @Column(nullable = false, unique = true)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Thời gian hết hạn của token (ví dụ: 24 giờ)
    @Column(nullable = false)
    private LocalDateTime expiryDate;

    // Cờ đánh dấu token đã sử dụng/hủy hay chưa
    @Column(nullable = false)
    private boolean revoked = false;

    public PasswordResetToken() {
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }
}
