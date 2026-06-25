package com.erp.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Goal — tracks individual employee OKR-style goals with progress percentage.
 */
@Entity
@Table(name = "goals")
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Category e.g. PERFORMANCE, LEARNING, LEADERSHIP, DELIVERY */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalCategory category = GoalCategory.PERFORMANCE;

    /** 0–100 completion percentage */
    @Column(nullable = false)
    private Integer progress = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalStatus status = GoalStatus.ACTIVE;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "quarter")
    private String quarter;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum GoalCategory {
        PERFORMANCE, LEARNING, LEADERSHIP, DELIVERY, INNOVATION
    }

    public enum GoalStatus {
        ACTIVE, COMPLETED, PAUSED, CANCELLED
    }

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee e) { this.employee = e; }
    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant t) { this.tenant = t; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public GoalCategory getCategory() { return category; }
    public void setCategory(GoalCategory c) { this.category = c; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer p) { this.progress = p; }
    public GoalStatus getStatus() { return status; }
    public void setStatus(GoalStatus s) { this.status = s; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate d) { this.targetDate = d; }
    public String getQuarter() { return quarter; }
    public void setQuarter(String q) { this.quarter = q; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
