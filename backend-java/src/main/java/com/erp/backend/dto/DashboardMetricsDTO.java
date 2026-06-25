package com.erp.backend.dto;

import java.math.BigDecimal;

public class DashboardMetricsDTO {
    private long totalEmployees;
    private long totalDepartments;
    private BigDecimal totalRevenue; // Mocked for now
    private BigDecimal operatingCosts; // Mocked for now
    private int businessHealthScore; // Fetched from AI

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }
    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public BigDecimal getOperatingCosts() { return operatingCosts; }
    public void setOperatingCosts(BigDecimal operatingCosts) { this.operatingCosts = operatingCosts; }
    public int getBusinessHealthScore() { return businessHealthScore; }
    public void setBusinessHealthScore(int businessHealthScore) { this.businessHealthScore = businessHealthScore; }
}
