package com.example.shop_app.dto.order;

public class UpdateStatusRequest {
    private int newStatus;

    public int getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(int newStatus) {
        this.newStatus = newStatus;
    }
}
