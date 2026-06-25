package com.erp.backend.repository;

import com.erp.backend.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);
    List<AuditLog> findTop50ByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<AuditLog> findByTenantIdAndEntityTypeOrderByCreatedAtDesc(Long tenantId, String entityType);
}
