package com.example.shop_app.enums;

public enum OrderStatus {
    PENDING(1, "Chờ xác nhận"),
    PICKED_UP(2, "Shipper nhận hàng"),
    IN_TRANSIT(3, "Hàng đang di chuyển"),
    DELIVERED(4, "Đã giao thành công"),
    CANCELED(5, "Đã hủy đơn");

    private final int value;
    private final String description;

    OrderStatus(int value, String description) {
        this.value = value;
        this.description = description;
    }

    public int getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public static OrderStatus fromValue(int value) {
        for (OrderStatus status : values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new IllegalArgumentException("Trạng thái không hợp lệ: " + value);
    }
}

