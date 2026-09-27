package com.example.shop_app.entity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens")
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String token;
    private String tokenType = "Bearer";
    private LocalDateTime issuedAt;
    private LocalDateTime expirationDate;
    private Boolean revoked;
    private Boolean expired;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Token() {
    }

    public Token(String token, String tokenType, LocalDateTime issuedAt, LocalDateTime expirationDate, Boolean revoked, Boolean expired, User user) {
        this.token = token;
        this.tokenType = tokenType;
        this.issuedAt = issuedAt;
        this.expirationDate = expirationDate;
        this.revoked = revoked;
        this.expired = expired;
        this.user = user;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    public Boolean getRevoked() {
        return revoked;
    }

    public void setRevoked(Boolean revoked) {
        this.revoked = revoked;
    }

    public Boolean getExpired() {
        return expired;
    }

    public void setExpired(Boolean expired) {
        this.expired = expired;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
