package com.erp.backend.service;

import com.erp.backend.dto.AuditLogDTO;
import com.erp.backend.entity.AuditLog;
import com.erp.backend.entity.AuditLog.AuditAction;
import com.erp.backend.entity.Tenant;
import com.erp.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuditLogService {

    @Autowired private AuditLogRepository auditLogRepository;

    /** Records a new audit log entry */
    public void log(Tenant tenant, AuditAction action, String entityType,
                    Long entityId, String details, String performedBy) {
        AuditLog entry = new AuditLog();
        entry.setTenant(tenant);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDetails(details);
        entry.setPerformedBy(performedBy);
        auditLogRepository.save(entry);
    }

    /** Returns the 50 most recent audit logs for a tenant */
    public List<AuditLogDTO> getRecentLogs(Long tenantId) {
        return auditLogRepository.findTop50ByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Returns audit logs for a specific entity type */
    public List<AuditLogDTO> getLogsByEntityType(Long tenantId, String entityType) {
        return auditLogRepository.findByTenantIdAndEntityTypeOrderByCreatedAtDesc(tenantId, entityType)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AuditLogDTO toDTO(AuditLog log) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(log.getId());
        dto.setAction(log.getAction().name());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setDetails(log.getDetails());
        dto.setPerformedBy(log.getPerformedBy());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}

