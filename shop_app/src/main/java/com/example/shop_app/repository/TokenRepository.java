package com.example.shop_app.repository;

import com.example.shop_app.entity.Token;
import com.example.shop_app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Integer> {
    Optional<Token> findByToken(String token);
    List<Token> findAllByUser(User user);
    @Query("SELECT t FROM Token t WHERE t.user.id = :userId AND t.revoked = false")
    List<Token> findAllValidTokensByUser(@Param("userId") Integer userId);

    List<Token> findAllByUserAndRevokedIsFalse(User user);
}
