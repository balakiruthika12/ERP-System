package com.erp.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProjectTaskDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private String title;
    private String description;
    private Long assigneeId;
    private String assigneeName;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long id) { this.projectId = id; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String n) { this.projectName = n; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long id) { this.assigneeId = id; }
    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String n) { this.assigneeName = n; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public String getPriority() { return priority; }
    public void setPriority(String p) { this.priority = p; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate d) { this.dueDate = d; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
