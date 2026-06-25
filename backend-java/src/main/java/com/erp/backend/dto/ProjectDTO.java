package com.erp.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate dueDate;
    private BigDecimal budget;
    private Long leadEmployeeId;
    private String leadEmployeeName;
    private List<ProjectTaskDTO> tasks;
    private int taskCount;
    private int completedTaskCount;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String n) { this.name = n; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate d) { this.startDate = d; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate d) { this.dueDate = d; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal b) { this.budget = b; }
    public Long getLeadEmployeeId() { return leadEmployeeId; }
    public void setLeadEmployeeId(Long id) { this.leadEmployeeId = id; }
    public String getLeadEmployeeName() { return leadEmployeeName; }
    public void setLeadEmployeeName(String n) { this.leadEmployeeName = n; }
    public List<ProjectTaskDTO> getTasks() { return tasks; }
    public void setTasks(List<ProjectTaskDTO> t) { this.tasks = t; }
    public int getTaskCount() { return taskCount; }
    public void setTaskCount(int c) { this.taskCount = c; }
    public int getCompletedTaskCount() { return completedTaskCount; }
    public void setCompletedTaskCount(int c) { this.completedTaskCount = c; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
