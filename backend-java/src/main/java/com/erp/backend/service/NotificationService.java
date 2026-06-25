package com.erp.backend.service;

import com.erp.backend.dto.NotificationDTO;
import com.erp.backend.entity.Notification;
import com.erp.backend.entity.Notification.NotificationType;
import com.erp.backend.entity.Tenant;
import com.erp.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;

    public List<NotificationDTO> getRecentNotifications(Long tenantId) {
        return notificationRepository.findTop10ByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(Long tenantId) {
        return notificationRepository.findByTenantIdAndIsReadFalseOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long tenantId) {
        return notificationRepository.countByTenantIdAndIsReadFalse(tenantId);
    }

    public NotificationDTO markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        return toDTO(notificationRepository.save(n));
    }

    public void markAllAsRead(Long tenantId) {
        List<Notification> unread = notificationRepository
                .findByTenantIdAndIsReadFalseOrderByCreatedAtDesc(tenantId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public Notification createNotification(Tenant tenant, NotificationType type, String title, String message) {
        Notification n = new Notification();
        n.setTenant(tenant);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        return notificationRepository.save(n);
    }

    public NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setType(n.getType());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
