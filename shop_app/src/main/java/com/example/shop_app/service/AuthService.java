package com.example.shop_app.service;

import com.example.shop_app.entity.*;
import com.example.shop_app.exceptions.AppException;
import com.example.shop_app.enums.ErrorCode;
import com.example.shop_app.repository.RoleRepository;
import com.example.shop_app.repository.TokenRepository;
import com.example.shop_app.repository.UserRepository;
import com.example.shop_app.repository.UserRoleRepository;
import com.example.shop_app.response.AuthenticationResponse;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, TokenRepository tokenRepository, UserRoleRepository userRoleRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
    }

    public AuthenticationResponse login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AppException(ErrorCode.INCORRECT_PASSWORD);
        }

        // Kiểm tra trạng thái active của tài khoản
        if (user.getActive() == null || !user.getActive()) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }

        // Thu hồi tất cả token cũ trước khi tạo mới
        List<Token> userTokens = tokenRepository.findAllByUserAndRevokedIsFalse(user);
        userTokens.forEach(t -> {
            t.setRevoked(true);
            t.setExpired(true);
        });
        tokenRepository.saveAll(userTokens);

        // Tạo Access Token & Refresh Token
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime accessExpiry = now.plusSeconds(30);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Trích xuất jwtID từ các token vừa tạo
        String accessJwtId = jwtService.extractJwtId(accessToken);
        String refreshJwtId = jwtService.extractJwtId(refreshToken);

        // Lưu jwtID (không lưu toàn bộ token) vào database
        saveToken(user, accessJwtId, accessExpiry);
        saveToken(user, refreshJwtId, accessExpiry.plusHours(1));

        return new AuthenticationResponse(accessToken, refreshToken, true);
    }


    private void revokeAllTokens(User user) {
        List<Token> userTokens = tokenRepository.findAllValidTokensByUser(user.getId());

        if (userTokens.isEmpty()) {
            System.out.println("Không có token hợp lệ nào để revoke.");
            return;
        }

        System.out.println("Danh sách token cần revoke:");
        userTokens.forEach(token -> {
            System.out.println("Token: " + token.getToken() + " - ID: " + token.getId());
            token.setRevoked(true);
            token.setExpired(true);
        });

        tokenRepository.saveAll(userTokens);
    }

    // Phương thức hỗ trợ lưu token (lưu jwtID thay vì toàn bộ JWT)
    private void saveToken(User user, String jwtId, LocalDateTime expiry) {
        Token newToken = new Token();
        newToken.setToken(jwtId);  // Lưu jwtID vào đây
        newToken.setTokenType("Bearer");
        newToken.setIssuedAt(LocalDateTime.now());
        newToken.setExpirationDate(expiry);
        newToken.setRevoked(false);
        newToken.setExpired(false);
        newToken.setUser(user);
        tokenRepository.save(newToken);
    }

    public void logout(String token) {
        // Trích xuất jwtID từ token do client gửi lên
        String jwtId = jwtService.extractJwtId(token);
        Token storedToken = tokenRepository.findByToken(jwtId)
                .orElseThrow(() -> new AppException(ErrorCode.TOKEN_NOT_FOUND));

        User user = storedToken.getUser();

        // Gọi phương thức revokeAllTokens thay vì lặp lại logic
        revokeAllTokens(user);
    }

    public AuthenticationResponse refreshToken(String refreshToken) {
        // Xác thực refresh token: trích xuất jwtID trước
        String jwtId = jwtService.extractJwtId(refreshToken);
        Optional<Token> storedToken = tokenRepository.findByToken(jwtId);
        if (storedToken.isEmpty() || storedToken.get().getRevoked() || storedToken.get().getExpired()) {
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        Optional<String> usernameOpt = jwtService.validateToken(refreshToken);
        if (usernameOpt.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        String username = usernameOpt.get();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Log thông tin khi refresh token thành công
        System.out.println("Refresh token hợp lệ, tạo Access Token mới cho user: " + username);

        // Tạo access token mới
        String newAccessToken = jwtService.generateToken(user);

        // Lưu access token mới (lưu jwtID của access token)
        String newAccessJwtId = jwtService.extractJwtId(newAccessToken);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime newExpiry = now.plusSeconds(30);
        saveToken(user, newAccessJwtId, newExpiry);

        return new AuthenticationResponse(newAccessToken, refreshToken, true);
    }

    public boolean introspect(String token) {
        try {
            // validateToken sẽ kiểm tra chữ ký, thời gian hết hạn và trạng thái (revoked/expired) của token
            // Nếu token hợp lệ, nó trả về Optional chứa subject (tên người dùng) của token
            return jwtService.validateToken(token).isPresent();
        } catch (Exception e) {
            // Nếu có bất kỳ lỗi nào trong quá trình validate token, chúng ta coi token là không hợp lệ
            return false;
        }
    }

}
