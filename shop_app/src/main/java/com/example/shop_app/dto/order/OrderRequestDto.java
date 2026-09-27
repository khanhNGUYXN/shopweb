package com.example.shop_app.dto.order;

import com.example.shop_app.entity.Order;
import com.example.shop_app.entity.OrderDetail;
import java.util.List;

public class OrderRequestDto {
    private Order order;
    private List<OrderDetail> orderDetails;

    public OrderRequestDto() {
    }

    public OrderRequestDto(Order order, List<OrderDetail> orderDetails) {
        this.order = order;
        this.orderDetails = orderDetails;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public List<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
    }
}
