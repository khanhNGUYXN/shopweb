package com.example.shop_app.service;

import com.example.shop_app.entity.Token;
import com.example.shop_app.entity.User;
import com.example.shop_app.repository.TokenRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JwtService {
    private static final String SECRET_KEY = "01234567890123456789012345678901"; // 32-byte key
    private final TokenRepository tokenRepository;

    public JwtService(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public String generateToken(User user) {
        return generateToken(user, 60); // Access Token hết hạn sau 60 phút
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, 60 * 24); // Refresh Token hết hạn sau 1 ngày
    }

    public String generateToken(User user, int expiryMinutes) {
        try {
            LocalDateTime issuedAt = LocalDateTime.now();
            LocalDateTime expirationTime = issuedAt.plusMinutes(expiryMinutes);

            // Lấy danh sách role của user
            List<String> roles = user.getUserRoles().stream()
                    .map(userRole -> userRole.getRole().getName())
                    .collect(Collectors.toList());

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getUsername())
                    .issuer("shop_app")
                    .claim("roles", roles)  // Thêm danh sách vai trò vào token
                    .issueTime(new Date())
                    .expirationTime(java.sql.Timestamp.valueOf(expirationTime))
                    .jwtID(UUID.randomUUID().toString()) // Sinh jwtID
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);
            signedJWT.sign(new MACSigner(SECRET_KEY));

            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Lỗi khi tạo JWT", e);
        }
    }

    // Phương thức trích xuất jwtID từ token
    public String extractJwtId(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getJWTID();
        } catch (Exception e) {
            throw new RuntimeException("Không thể trích xuất jwtID", e);
        }
    }

    public Optional<String> validateToken(String token) {
        try {
            // Thay vì tìm theo toàn bộ token, ta trích xuất jwtID và tìm theo đó
            String jwtId = extractJwtId(token);
            Optional<Token> storedToken = tokenRepository.findByToken(jwtId);
            if (storedToken.isEmpty() || storedToken.get().getRevoked() || storedToken.get().getExpired()) {
                return Optional.empty();
            }

            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(SECRET_KEY);

            if (signedJWT.verify(verifier) && !isTokenExpired(signedJWT)) {
                return Optional.of(signedJWT.getJWTClaimsSet().getSubject());
            }
        } catch (Exception e) {
            return Optional.empty();
        }
        return Optional.empty();
    }

    private boolean isTokenExpired(SignedJWT signedJWT) throws java.text.ParseException {
        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        return expirationTime.before(new Date());
    }

    public String extractUsername(String token) {
        try {
            return SignedJWT.parse(token).getJWTClaimsSet().getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Không thể đọc JWT", e);
        }
    }

    public List<String> extractRoles(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
            return claimsSet.getStringListClaim("roles"); // Lấy danh sách role từ token
        } catch (ParseException e) {
            throw new RuntimeException("Lỗi khi phân tích JWT", e);
        }
    }
}

