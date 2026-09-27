package com.example.shop_app.service;

import com.example.shop_app.entity.Role;
import com.example.shop_app.repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class RoleInitializerService {

    @Autowired
    private RoleRepository roleRepository;

    @PostConstruct
    public void initializeRoles() {
        List<String> defaultRoles = Arrays.asList("ROLE_ADMIN", "ROLE_USER", "ROLE_EMPLOYEE");

        for (String roleName : defaultRoles) {
            Optional<Role> existingRole = roleRepository.findByName(roleName);
            if (existingRole.isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
                System.out.println("✅ Đã tạo role: " + roleName);
            }
        }
    }
}
