package com.erp.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class EmployeeProfileDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String jobTitle;
    private String email;
    private BigDecimal salary;
    private LocalDate hireDate;
    private boolean isActive;
    private String department;
    private Long departmentId;
    private LocalDateTime createdAt;

    // Summary stats
    private int totalLeavesTaken;
    private int pendingLeaveRequests;
    private BigDecimal lastNetSalary;
    private String lastPayrollStatus;

    // Recent records
    private List<PayrollDTO> recentPayrolls;
    private List<LeaveRequestDTO> recentLeaves;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public int getTotalLeavesTaken() { return totalLeavesTaken; }
    public void setTotalLeavesTaken(int totalLeavesTaken) { this.totalLeavesTaken = totalLeavesTaken; }
    public int getPendingLeaveRequests() { return pendingLeaveRequests; }
    public void setPendingLeaveRequests(int pendingLeaveRequests) { this.pendingLeaveRequests = pendingLeaveRequests; }
    public BigDecimal getLastNetSalary() { return lastNetSalary; }
    public void setLastNetSalary(BigDecimal lastNetSalary) { this.lastNetSalary = lastNetSalary; }
    public String getLastPayrollStatus() { return lastPayrollStatus; }
    public void setLastPayrollStatus(String lastPayrollStatus) { this.lastPayrollStatus = lastPayrollStatus; }
    public List<PayrollDTO> getRecentPayrolls() { return recentPayrolls; }
    public void setRecentPayrolls(List<PayrollDTO> recentPayrolls) { this.recentPayrolls = recentPayrolls; }
    public List<LeaveRequestDTO> getRecentLeaves() { return recentLeaves; }
    public void setRecentLeaves(List<LeaveRequestDTO> recentLeaves) { this.recentLeaves = recentLeaves; }
}
