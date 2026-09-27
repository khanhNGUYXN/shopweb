package com.example.shop_app.repository;

import com.example.shop_app.entity.UserRole;
import com.example.shop_app.entity.UserRoleKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleKey> {
    @Query("SELECT r.name FROM UserRole ur JOIN ur.role r WHERE ur.user.id = :userId")
    List<String> findRolesByUserId(@Param("userId") Integer userId);
}
