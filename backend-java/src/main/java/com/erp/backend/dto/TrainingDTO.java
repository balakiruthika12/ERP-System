package com.erp.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class TrainingDTO {
    private Long id;
    private Long tenantId;
    private String title;
    private String provider;
    private String description;
    private Integer durationDays;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal cost;
    private String status;
    private List<String> enrolledEmployeeNames;
    private int enrolledCount;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long t) { this.tenantId = t; }
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
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public List<String> getEnrolledEmployeeNames() { return enrolledEmployeeNames; }
    public void setEnrolledEmployeeNames(List<String> e) { this.enrolledEmployeeNames = e; }
    public int getEnrolledCount() { return enrolledCount; }
    public void setEnrolledCount(int c) { this.enrolledCount = c; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
