package com.example.shop_app.service;

import com.example.shop_app.entity.Role;
import com.example.shop_app.entity.User;
import com.example.shop_app.entity.UserRole;
import com.example.shop_app.entity.UserRoleKey;
import com.example.shop_app.exceptions.IncorrectPasswordException;
import com.example.shop_app.exceptions.PasswordMismatchException;
import com.example.shop_app.exceptions.ResourceAlreadyExistsException;
import com.example.shop_app.repository.*;
import com.example.shop_app.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;


    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository, UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
    }

    // ✅ Tạo user mới
    public User createUser(User user, String roleName) {
        // Kiểm tra xem username đã tồn tại chưa
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ResourceAlreadyExistsException("Username đã tồn tại");
        }

        // Kiểm tra xem số điện thoại có được cung cấp hay không và có tồn tại hay không
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()
                && userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new ResourceAlreadyExistsException("Số điện thoại đã tồn tại");
        }

        // Kiểm tra xem email có được cung cấp hay không và có tồn tại hay không
        if (user.getEmail() != null && !user.getEmail().isEmpty()
                && userRepository.existsByEmail(user.getEmail())) {
            throw new ResourceAlreadyExistsException("Email đã tồn tại");
        }

        // Mã hóa mật khẩu
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true); // Mặc định là true
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Lưu user vào database
        User savedUser = userRepository.save(user);

        // Gán vai trò cho user
        assignRoleToUser(savedUser, roleName);

        return savedUser;
    }


    private void assignRoleToUser(User user, String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò: " + roleName));

        UserRoleKey key = new UserRoleKey();
        key.setUserId(user.getId());
        key.setRoleId(role.getId());

        UserRole userRole = new UserRole();
        userRole.setId(key);
        userRole.setUser(user);
        userRole.setRole(role);

        userRoleRepository.save(userRole);
    }

    // ✅ Lấy danh sách user
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Lấy user theo ID
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    // ✅ Cập nhật thông tin cá nhân
    public Optional<User> updateUserInfo(Integer id, User updatedUser) {
        return userRepository.findById(id).map(user -> {

            // Kiểm tra số điện thoại mới có trùng với số điện thoại của user khác không
            if (updatedUser.getPhoneNumber() != null && !updatedUser.getPhoneNumber().isEmpty() &&
                    !updatedUser.getPhoneNumber().equals(user.getPhoneNumber()) &&
                    userRepository.existsByPhoneNumber(updatedUser.getPhoneNumber())) {
                throw new ResourceAlreadyExistsException("Số điện thoại đã tồn tại");
            }

            // Kiểm tra email mới có trùng với email của user khác không
            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty() &&
                    !updatedUser.getEmail().equals(user.getEmail()) &&
                    userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new ResourceAlreadyExistsException("Email đã tồn tại");
            }

            user.setFull_name(updatedUser.getFull_name());
            user.setAddress(updatedUser.getAddress());
            user.setDateOfBirth(updatedUser.getDateOfBirth());
            user.setPhoneNumber(updatedUser.getPhoneNumber());
            user.setEmail(updatedUser.getEmail());
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        });
    }


    // ✅ Cập nhật mật khẩu
    public Optional<User> updateUserPassword(Integer id, String oldPassword, String newPassword, String confirmPassword) {
        return userRepository.findById(id).map(user -> {
            // Kiểm tra mật khẩu cũ
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new IncorrectPasswordException("Mật khẩu cũ không đúng");
            }

            // Kiểm tra mật khẩu mới và xác nhận mật khẩu
            if (!newPassword.equals(confirmPassword)) {
                throw new PasswordMismatchException("Mật khẩu mới và xác nhận mật khẩu không khớp");
            }

            user.setPassword(passwordEncoder.encode(newPassword)); // Mã hóa mật khẩu mới
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        });
    }

    // ✅ Xóa user (chuyển isActive = false)
    public Optional<User> deleteUser(Integer id) {
        return userRepository.findById(id).map(user -> {
            user.setActive(false);
            return userRepository.save(user);
        });
    }

    // ✅ Thêm phương thức tìm user theo username
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    // ✅ Cập nhật trạng thái active của user
    public Optional<User> updateUserActiveStatus(Integer id, boolean active) {
        return userRepository.findById(id).map(user -> {
            user.setActive(active);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        });
    }

}
