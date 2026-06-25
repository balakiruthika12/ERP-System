package com.erp.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * AuditLog records every state-changing action in the ERP system.
 * Populated by AuditLogService called from service methods on write operations.
 */
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    /** The HTTP action verb or business operation: CREATE, UPDATE, DELETE, APPROVE, REJECT, PAY */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    /** The entity type being acted on: EMPLOYEE, PAYROLL, LEAVE_REQUEST, DEPARTMENT, USER, NOTIFICATION */
    @Column(name = "entity_type", nullable = false)
    private String entityType;

    /** The primary key of the entity being acted on */
    @Column(name = "entity_id")
    private Long entityId;

    /** Human-readable description of what changed */
    @Column(columnDefinition = "TEXT")
    private String details;

    /** Email of the user who performed the action */
    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum AuditAction {
        CREATE, UPDATE, DELETE, APPROVE, REJECT, PROCESS, PAY, LOGIN, LOGOUT
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant tenant) { this.tenant = tenant; }
    public AuditAction getAction() { return action; }
    public void setAction(AuditAction action) { this.action = action; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
