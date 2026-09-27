package com.example.shop_app.service;

import com.example.shop_app.entity.Order;
import com.example.shop_app.entity.OrderDetail;
import com.example.shop_app.entity.Product;
import com.example.shop_app.entity.User;
import com.example.shop_app.enums.OrderStatus; // đảm bảo import enum nếu cần
import com.example.shop_app.repository.OrderDetailRepository;
import com.example.shop_app.repository.OrderRepository;
import com.example.shop_app.repository.ProductRepository;
import com.example.shop_app.repository.UserRepository;
import com.example.shop_app.response.OrderResponseDto;
import com.example.shop_app.response.OrderDetailResponseDto;
import com.example.shop_app.response.UserResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    public OrderService(OrderRepository orderRepository, OrderDetailRepository orderDetailRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    /**
     * Tạo đơn hàng mới và trả về OrderResponseDto
     */
    public OrderResponseDto createOrder(Order order, List<OrderDetail> orderDetails, String username) {
        // Tìm User từ DB theo username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với username: " + username));

        // Gán user vào order
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING.getValue()); // 1: Chờ xác nhận
        order.setTotalMoney(BigDecimal.ZERO);

        // Tính tổng tiền cho order từ orderDetails
        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> savedOrderDetails = new ArrayList<>();

        if (orderDetails != null) {
            for (OrderDetail detail : orderDetails) {
                // Lấy product_id từ JSON (do detail.getProduct() ban đầu là null)
                if (detail.getProduct() == null || detail.getProduct().getId() == null) {
                    throw new RuntimeException("Thiếu thông tin sản phẩm trong đơn hàng.");
                }

                Integer productId = detail.getProduct().getId();

                // Tìm Product từ DB dựa trên product_id
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + productId));

                // Gán Product vào OrderDetail
                detail.setProduct(product);
                detail.setOrder(order);

                total = total.add(detail.getTotalMoney());
                savedOrderDetails.add(detail);
            }
        }
        order.setTotalMoney(total);

        // Lưu đơn hàng
        Order savedOrder = orderRepository.save(order);

        // Lưu chi tiết đơn hàng
        for (OrderDetail detail : savedOrderDetails) {
            detail.setOrder(savedOrder);
            orderDetailRepository.save(detail);
        }

        // Chuyển đổi sang DTO để trả về
        return convertToOrderResponseDto(savedOrder, savedOrderDetails);
    }



    /**
     * Phương thức cho Admin cập nhật trạng thái đơn hàng theo ý muốn.
     */
    public OrderResponseDto updateOrderStatusForAdmin(Integer orderId, int newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + orderId));
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        List<OrderDetail> details = orderDetailRepository.findByOrder(updatedOrder);
        return convertToOrderResponseDto(updatedOrder, details);
    }

    /**
     * Phương thức cho người dùng hủy đơn hàng của mình.
     * Chỉ cho phép hủy khi đơn hàng đang ở trạng thái cho phép (ví dụ: PENDING hoặc IN_CART).
     */
    public OrderResponseDto cancelOrderByUser(Integer orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + orderId));

        // Kiểm tra xem đơn hàng có thuộc về user này không
        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Không có quyền hủy đơn hàng này");
        }

        // Kiểm tra trạng thái hiện tại có cho phép hủy hay không
        if (order.getStatus() != OrderStatus.PENDING.getValue()){
            throw new RuntimeException("Đơn hàng không thể hủy ở trạng thái hiện tại");
        }

        // Cập nhật trạng thái thành CANCELED
        order.setStatus(OrderStatus.CANCELED.getValue());
        Order updatedOrder = orderRepository.save(order);
        List<OrderDetail> details = orderDetailRepository.findByOrder(updatedOrder);
        return convertToOrderResponseDto(updatedOrder, details);
    }

    private OrderResponseDto convertToOrderResponseDto(Order order, List<OrderDetail> details) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setTotalMoney(order.getTotalMoney());
        dto.setOrderDate(order.getOrderDate());
        dto.setFullname(order.getFullname());
        dto.setEmail(order.getEmail());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setAddress(order.getAddress());
        dto.setNote(order.getNote());
        dto.setShippingMethod(order.getShippingMethod());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setActive(order.getActive());

        // Chuyển đổi thông tin user
        UserResponseDto userDto = new UserResponseDto();
        userDto.setId(order.getUser().getId());
        userDto.setUsername(order.getUser().getUsername());
        dto.setUser(userDto);

        // Chuyển đổi danh sách order detail
        if (details != null) {
            List<OrderDetailResponseDto> detailDtos = details.stream().map(detail -> {
                OrderDetailResponseDto d = new OrderDetailResponseDto();
                d.setId(detail.getId());
                d.setPrice(detail.getPrice());
                d.setNumberOfProducts(detail.getNumberOfProducts());
                d.setTotalMoney(detail.getTotalMoney());
                d.setColor(detail.getColor());
                d.setSize(detail.getSize());
                // Giả sử bạn chỉ muốn trả về id, name, price, imageUrl của product
                com.example.shop_app.response.ProductResponseDto pDto = new com.example.shop_app.response.ProductResponseDto();
                pDto.setId(detail.getProduct().getId());
                pDto.setName(detail.getProduct().getName());
                pDto.setPrice(detail.getProduct().getPrice());
                pDto.setImageUrl(detail.getProduct().getThumbnail());
                d.setProduct(pDto);
                return d;
            }).collect(Collectors.toList());
            dto.setOrderDetails(detailDtos);
        }
        return dto;
    }

    /**
     * Soft delete đơn hàng bằng cách cập nhật active từ true sang false.
     */
    public void deleteOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + orderId));
        order.setActive(false);
        orderRepository.save(order);
    }

    public List<OrderResponseDto> listOrdersByUsername(String username) {
        // Lấy thông tin user từ DB theo username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với username: " + username));

        // Lấy danh sách đơn hàng của user
        List<Order> orders = orderRepository.findByUser(user);

        // Chuyển đổi mỗi đơn hàng cùng với chi tiết đơn hàng thành DTO
        return orders.stream()
                .map(order -> {
                    List<OrderDetail> details = orderDetailRepository.findByOrder(order);
                    return convertToOrderResponseDto(order, details);
                })
                .collect(Collectors.toList());
    }
}
