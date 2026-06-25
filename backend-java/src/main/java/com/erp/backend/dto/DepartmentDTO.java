package com.erp.backend.dto;

/**
 * DepartmentDTO — safe serialisation wrapper for the Department entity.
 * Includes employee count so the frontend can show headcount per department
 * without triggering a lazy-load on the employees collection.
 */
public class DepartmentDTO {
    private Long id;
    private String name;
    private String description;
    private Long tenantId;
    private long employeeCount;
    private java.math.BigDecimal monthlyBudget;
    private java.math.BigDecimal actualSpend;

    public DepartmentDTO() {}

    public DepartmentDTO(Long id, String name, String description, Long tenantId, long employeeCount,
                         java.math.BigDecimal monthlyBudget, java.math.BigDecimal actualSpend) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.tenantId = tenantId;
        this.employeeCount = employeeCount;
        this.monthlyBudget = monthlyBudget;
        this.actualSpend = actualSpend;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    public long getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(long employeeCount) { this.employeeCount = employeeCount; }
    public java.math.BigDecimal getMonthlyBudget() { return monthlyBudget; }
    public void setMonthlyBudget(java.math.BigDecimal monthlyBudget) { this.monthlyBudget = monthlyBudget; }
    public java.math.BigDecimal getActualSpend() { return actualSpend; }
    public void setActualSpend(java.math.BigDecimal actualSpend) { this.actualSpend = actualSpend; }
}
