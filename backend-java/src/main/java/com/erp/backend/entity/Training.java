package com.erp.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Training — tracks employee training programs and certifications.
 */
@Entity
@Table(name = "trainings")
public class Training {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String title;

    @Column
    private String provider;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainingStatus status = TrainingStatus.UPCOMING;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "training_employees",
        joinColumns = @JoinColumn(name = "training_id"),
        inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private Set<Employee> enrolledEmployees = new HashSet<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TrainingStatus {
        UPCOMING, IN_PROGRESS, COMPLETED, CANCELLED
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant t) { this.tenant = t; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public String getProvider() { return provider; }
    public void setProvider(String p) { this.provider = p; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer d) { this.durationDays = d; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate d) { this.startDate = d; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate d) { this.endDate = d; }
    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal c) { this.cost = c; }
    public TrainingStatus getStatus() { return status; }
    public void setStatus(TrainingStatus s) { this.status = s; }
    public Set<Employee> getEnrolledEmployees() { return enrolledEmployees; }
    public void setEnrolledEmployees(Set<Employee> e) { this.enrolledEmployees = e; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
