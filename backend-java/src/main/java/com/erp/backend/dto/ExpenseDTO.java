package com.erp.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExpenseDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private String category;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private String receiptNote;
    private String status;
    private String managerNotes;
    private String reviewedBy;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long e) { this.employeeId = e; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String n) { this.employeeName = n; }
    public String getDepartment() { return department; }
    public void setDepartment(String d) { this.department = d; }
    public String getCategory() { return category; }
    public void setCategory(String c) { this.category = c; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal a) { this.amount = a; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate d) { this.expenseDate = d; }
    public String getReceiptNote() { return receiptNote; }
    public void setReceiptNote(String r) { this.receiptNote = r; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public String getManagerNotes() { return managerNotes; }
    public void setManagerNotes(String n) { this.managerNotes = n; }
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String r) { this.reviewedBy = r; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime t) { this.submittedAt = t; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime t) { this.reviewedAt = t; }
}
