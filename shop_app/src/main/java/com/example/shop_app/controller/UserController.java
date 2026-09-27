package com.example.shop_app.controller;

import com.example.shop_app.dto.auth.UserRequestDto;
import com.example.shop_app.dto.user.UpdatePasswordRequestDto;
import com.example.shop_app.entity.User;
import com.example.shop_app.service.JwtService;
import com.example.shop_app.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ✅ API tạo user
    @PostMapping("register")
    public ResponseEntity<User> createUser(@RequestBody UserRequestDto request) {
        User newUser = userService.createUser(request.getUser(), request.getRoleName());
        return ResponseEntity.ok(newUser);
    }

    // ✅ API lấy danh sách user
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_EMPLOYEE')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ API lấy user theo ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/info")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'USER')")
    public ResponseEntity<?> updateUserInfo(@PathVariable Integer id, @RequestBody User updatedUser) {
        Optional<User> updated = userService.updateUserInfo(id, updatedUser);
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'USER')")
    public ResponseEntity<?> updateUserPassword(@PathVariable Integer id,
                                                @RequestBody UpdatePasswordRequestDto request) {
        Optional<User> updated = userService.updateUserPassword(id,
                request.getOldPassword(),
                request.getNewPassword(),
                request.getConfirmPassword());
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ API xóa user (chuyển isActive = false)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'USER')")
    public ResponseEntity<User> deleteUser(@PathVariable Integer id) {
        return userService.deleteUser(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable("username") String username) {
        try {
            User user = userService.findByUsername(username);
            return ResponseEntity.ok(user);
        } catch (UsernameNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy user với username: " + username);
        }
    }

    // Endpoint cập nhật trạng thái active của user
    @PutMapping("/{id}/active")
    public ResponseEntity<User> updateUserActiveStatus(@PathVariable Integer id,
                                                       @RequestBody ActiveStatusRequest request) {
        Optional<User> updatedUser = userService.updateUserActiveStatus(id, request.isActive());
        return updatedUser.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DTO để nhận dữ liệu active từ request body
    public static class ActiveStatusRequest {
        private boolean active;

        public boolean isActive() {
            return active;
        }

        public void setActive(boolean active) {
            this.active = active;
        }
    }
}
