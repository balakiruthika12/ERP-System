package com.erp.backend.controller;

import com.erp.backend.dto.NotificationDTO;
import com.erp.backend.entity.User;
import com.erp.backend.repository.UserRepository;
import com.erp.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired private NotificationService notificationService;
    @Autowired private UserRepository userRepository;

    /**
     * Gap 3 fix: resolve tenant ID from the authenticated user's principal
     * instead of the hardcoded 1L constant. Falls back to 1L if user not found.
     */
    private Long resolveTenantId(UserDetails principal) {
        if (principal == null) return 1L;
        return userRepository.findByEmail(principal.getUsername())
                .map(user -> user.getTenant() != null ? user.getTenant().getId() : 1L)
                .orElse(1L);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<NotificationDTO> getRecentNotifications(@AuthenticationPrincipal UserDetails principal) {
        return notificationService.getRecentNotifications(resolveTenantId(principal));
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public List<NotificationDTO> getUnreadNotifications(@AuthenticationPrincipal UserDetails principal) {
        return notificationService.getUnreadNotifications(resolveTenantId(principal));
    }

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal UserDetails principal) {
        return Map.of("count", notificationService.getUnreadCount(resolveTenantId(principal)));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetails principal) {
        notificationService.markAllAsRead(resolveTenantId(principal));
        return ResponseEntity.noContent().build();
    }
}
