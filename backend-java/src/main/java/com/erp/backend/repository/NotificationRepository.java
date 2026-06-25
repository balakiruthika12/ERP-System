package com.erp.backend.repository;

import com.erp.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<Notification> findByTenantIdAndIsReadFalseOrderByCreatedAtDesc(Long tenantId);
    long countByTenantIdAndIsReadFalse(Long tenantId);
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findTop10ByTenantIdOrderByCreatedAtDesc(Long tenantId);
}
