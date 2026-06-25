package com.erp.backend.controller;

import com.erp.backend.entity.User;
import com.erp.backend.entity.Role;
import com.erp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/users")
public class UserManagementController {

    @Autowired private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("firstName", u.getFirstName());
            map.put("lastName", u.getLastName());
            map.put("isActive", u.isActive());
            map.put("roles", u.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
            map.put("createdAt", u.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleUserActive(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setActive(!user.isActive());
            userRepository.save(user);
            Map<String, Object> response = Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "isActive", user.isActive(),
                "message", user.isActive() ? "User activated" : "User deactivated"
            );
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getUserStats() {
        List<User> all = userRepository.findAll();
        return Map.of(
            "total", all.size(),
            "active", all.stream().filter(User::isActive).count(),
            "inactive", all.stream().filter(u -> !u.isActive()).count()
        );
    }
}
