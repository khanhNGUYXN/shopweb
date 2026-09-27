package com.example.shop_app.controller;

import com.example.shop_app.dto.auth.IntrospectRequest;
import com.example.shop_app.dto.auth.LoginRequest;
import com.example.shop_app.dto.auth.RefreshTokenRequestDto;
import com.example.shop_app.entity.User;
import com.example.shop_app.enums.ErrorCode;
import com.example.shop_app.exceptions.AppException;
import com.example.shop_app.repository.UserRepository;
import com.example.shop_app.response.ApiResponse;
import com.example.shop_app.response.AuthenticationResponse;
import com.example.shop_app.service.AuthService;
import com.example.shop_app.service.ForgotPasswordService;
import com.example.shop_app.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ForgotPasswordService forgotPasswordService;
    public AuthController(AuthService authService, JwtService jwtService, UserRepository userRepository, ForgotPasswordService forgotPasswordService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.forgotPasswordService = forgotPasswordService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(@RequestBody LoginRequest request) {
        AuthenticationResponse response = authService.login(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(new ApiResponse<>("Đăng nhập thành công", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@RequestHeader("Authorization") String token) {
        String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;

        authService.logout(jwtToken);
        return ResponseEntity.ok(new ApiResponse<>("Đăng xuất thành công", "Success"));
    }

    @PostMapping("/introspect")
    public ResponseEntity<Map<String, Boolean>> introspect(@RequestBody IntrospectRequest request) {
        boolean valid = authService.introspect(request.getToken());
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    /**
     * Endpoint refresh token:
     * - Nếu access token hợp lệ (chưa hết hạn) thì trả luôn access token hiện có.
     * - Nếu access token hết hạn, kiểm tra refresh token:
     *     + Nếu refresh token hợp lệ: gọi service refreshToken() để tạo access token mới.
     *     + Nếu refresh token cũng không hợp lệ: trả về thông báo token hết hạn và yêu cầu đăng nhập lại.
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequestDto request) {
        String accessToken = request.getAccessToken();
        String refreshToken = request.getRefreshToken();

        // Kiểm tra access token
        if (authService.introspect(accessToken)) {
            // Access token vẫn còn hạn
            return ResponseEntity.ok(new AuthenticationResponse(accessToken, refreshToken, true));
        } else {
            // Access token hết hạn, kiểm tra refresh token
            if (authService.introspect(refreshToken)) {
                try {
                    // Vì bạn lưu jwtId chứ không lưu toàn token,
                    // nên bên trong service refreshToken sẽ trích xuất jwtId từ refreshToken và kiểm tra DB.
                    AuthenticationResponse response = authService.refreshToken(refreshToken);
                    return ResponseEntity.ok(response);
                } catch (AppException ex) {
                    // Xử lý trường hợp refresh token không hợp lệ (ví dụ: đã bị revoke/expired trong DB)
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("Refresh token không hợp lệ hoặc đã bị thu hồi.");
                }
            } else {
                // Cả access token và refresh token đều không hợp lệ
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Token hết hạn. Vui lòng đăng nhập lại.");
            }
        }
    }

    /**
     * Endpoint nhận yêu cầu "quên mật khẩu".
     * Nếu email tồn tại, hệ thống sẽ gửi email reset mật khẩu.
     */
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam("email") String email) {
        boolean sent = forgotPasswordService.processForgotPassword(email);
        if (sent) {
            return "Đã gửi email xác nhận.";
        } else {
            return "Gửi email không thành công. Vui lòng kiểm tra lại địa chỉ email.";
        }
    }

    /**
     * Endpoint đặt lại mật khẩu dựa trên token được gửi qua email.
     */
    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam("token") String token,
                                @RequestParam("newPassword") String newPassword) {
        boolean result = forgotPasswordService.resetPassword(token, newPassword);
        return result ? "Đặt lại mật khẩu thành công." : "Token không hợp lệ hoặc đã hết hạn.";
    }
}
