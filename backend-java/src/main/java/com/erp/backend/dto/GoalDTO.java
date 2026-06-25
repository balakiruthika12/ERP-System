package com.erp.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class GoalDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private String title;
    private String description;
    private String category;
    private Integer progress;
    private String status;
    private LocalDate targetDate;
    private String quarter;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long e) { this.employeeId = e; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String n) { this.employeeName = n; }
    public String getDepartment() { return department; }
    public void setDepartment(String d) { this.department = d; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public String getCategory() { return category; }
    public void setCategory(String c) { this.category = c; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer p) { this.progress = p; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate d) { this.targetDate = d; }
    public String getQuarter() { return quarter; }
    public void setQuarter(String q) { this.quarter = q; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
