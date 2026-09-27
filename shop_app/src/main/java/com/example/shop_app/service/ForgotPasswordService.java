package com.example.shop_app.service;

import com.example.shop_app.entity.PasswordResetToken;
import com.example.shop_app.entity.User;
import com.example.shop_app.repository.PasswordResetTokenRepository;
import com.example.shop_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class ForgotPasswordService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    // Inject EmailService vào ForgotPasswordService
    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Xử lý yêu cầu "quên mật khẩu" bằng cách tạo token và gửi email cho người dùng.
     */
    public boolean processForgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Tạo token UUID và thời gian hết hạn (24 giờ)
            String uuid = UUID.randomUUID().toString();
            LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUuid(uuid);
            resetToken.setUser(user);
            resetToken.setExpiryDate(expiryDate);
            tokenRepository.save(resetToken);

            // Soạn email reset mật khẩu
            String resetUrl = "http://localhost:3000/reset-password?token=" + uuid;
            String subject = "Yêu cầu đặt lại mật khẩu";
            String content = "Chào " + user.getUsername() + ",\n\n"
                    + "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào đường link dưới đây để đặt lại mật khẩu của bạn:\n"
                    + resetUrl + "\n\n"
                    + "Lưu ý: Link này chỉ có hiệu lực trong 24 giờ.\n\n"
                    + "Trân trọng,\n"
                    + "Shop App Team";

            // Gửi email sử dụng EmailService
            emailService.sendEmail(user.getEmail(), subject, content);
            return true;
        }
        // Nếu email không tồn tại, bạn có thể không trả về lỗi để bảo mật
        return false;
    }

    /**
     * Đặt lại mật khẩu dựa trên token (UUID). Nếu token hợp lệ và chưa hết hạn,
     * cập nhật mật khẩu mới cho user và đánh dấu token đã sử dụng.
     */
    public boolean resetPassword(String uuid, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByUuid(uuid);
        if (tokenOpt.isPresent()) {
            PasswordResetToken resetToken = tokenOpt.get();
            // Kiểm tra token chưa hết hạn và chưa bị hủy (revoked)
            if (resetToken.getExpiryDate().isAfter(LocalDateTime.now()) && !resetToken.isRevoked()) {
                User user = resetToken.getUser();
                // Mã hóa mật khẩu mới bằng BCrypt trước khi lưu
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);

                // Đánh dấu token đã được sử dụng
                resetToken.setRevoked(true);
                tokenRepository.save(resetToken);
                return true;
            }
        }
        return false;
    }
}
