package com.example.shop_app.controller;

import com.example.shop_app.dto.order.OrderRequestDto;
import com.example.shop_app.dto.order.UpdateStatusRequest;
import com.example.shop_app.response.OrderResponseDto;
import com.example.shop_app.entity.Order;
import com.example.shop_app.entity.OrderDetail;
import com.example.shop_app.service.JwtService;
import com.example.shop_app.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;
    private final JwtService jwtService;
    private final HttpServletRequest request;

    public OrderController(OrderService orderService, JwtService jwtService, HttpServletRequest request) {
        this.orderService = orderService;
        this.jwtService = jwtService;
        this.request = request;
    }

    @PostMapping("/create")
    public ResponseEntity<OrderResponseDto> createOrder(@RequestBody OrderRequestDto orderRequestDto) {
        // Lấy token từ header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);

        // Validate token và lấy username
        Optional<String> usernameOpt = jwtService.validateToken(token);
        if (usernameOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = usernameOpt.get();

        // Gọi service tạo đơn hàng, truyền username
        OrderResponseDto createdOrderDto = orderService.createOrder(orderRequestDto.getOrder(), orderRequestDto.getOrderDetails(), username);
        return ResponseEntity.ok(createdOrderDto);
    }

    /**
     * Xóa (soft delete) đơn hàng theo id
     */
    @DeleteMapping("/{orderId}")
    public ResponseEntity<String> deleteOrder(@PathVariable Integer orderId) {
        orderService.deleteOrder(orderId);
        return new ResponseEntity<>("Đơn hàng đã được xóa (active=false)", HttpStatus.OK);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatusForAdmin(
            @PathVariable Integer orderId,
            @RequestBody UpdateStatusRequest request) {

        OrderResponseDto response = orderService.updateOrderStatusForAdmin(orderId, request.getNewStatus());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrderByUser(
            @PathVariable Integer orderId,
            @RequestParam String username) {

        OrderResponseDto response = orderService.cancelOrderByUser(orderId, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-user/{username}")
    public List<OrderResponseDto> getOrdersByUsername(@PathVariable String username) {
        return orderService.listOrdersByUsername(username);
    }
}
