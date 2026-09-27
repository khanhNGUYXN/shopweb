package com.example.shop_app.controller;

import com.example.shop_app.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {
    private final JwtService jwtService;
    private final HttpServletRequest request;

    public TestController(JwtService jwtService, HttpServletRequest request) {
        this.jwtService = jwtService;
        this.request = request;
    }

    private boolean isTokenValid() {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring(7);
        return jwtService.validateToken(token).isPresent();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN') and @testController.isTokenValid()")
    @GetMapping("/admin")
    public String adminAccess() {
        return "Chỉ Admin mới được truy cập";
    }

    @PreAuthorize("hasAuthority('ROLE_USER') and @testController.isTokenValid()")
    @GetMapping("/user")
    public String readUser() {
        return "Bạn có quyền đọc thông tin user";
    }

    @PreAuthorize("hasAuthority('ROLE_EMPLOYEE') and @testController.isTokenValid()")
    @GetMapping("/employee")
    public String employeeAccess() {
        return "Bạn có quyền đọc thông tin employee";
    }
}
