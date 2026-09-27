package com.example.shop_app.repository;

import com.example.shop_app.entity.Order;
import com.example.shop_app.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    // Các truy vấn tùy chỉnh nếu cần
    List<OrderDetail> findByOrder(Order order);
}
