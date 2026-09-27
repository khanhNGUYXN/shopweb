package com.example.shop_app.enums;


public enum ErrorCode {
    USER_NOT_FOUND(404, "Người dùng không tồn tại"),
    INCORRECT_PASSWORD(400, "Mật khẩu không chính xác"),
    ACCOUNT_LOCKED(403, "Tài khoản đã bị khóa"),
    VALIDATION_FAILED(400, "Dữ liệu nhập vào không hợp lệ"),
    INTERNAL_ERROR(500, "Lỗi hệ thống"),
    INVALID_REFRESH_TOKEN(401, "Refresh Token không hợp lệ hoặc đã hết hạn"),
    TOKEN_NOT_FOUND(401, "Token không tồn tại hoặc đã bị thu hồi");
    private final int statusCode;
    private final String message;

    ErrorCode(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getMessage() {
        return message;
    }
}
