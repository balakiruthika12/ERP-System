package com.erp.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Expense — tracks employee expense claims with approval workflow.
 */
@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String description;

    @Column(name = "expense_date")
    private LocalDate expenseDate;

    @Column(name = "receipt_note", columnDefinition = "TEXT")
    private String receiptNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status = ExpenseStatus.PENDING;

    @Column(name = "manager_notes")
    private String managerNotes;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public enum ExpenseCategory {
        TRAVEL, MEALS, ACCOMMODATION, EQUIPMENT, SOFTWARE, TRAINING, MARKETING, OTHER
    }

    public enum ExpenseStatus {
        PENDING, APPROVED, REJECTED, REIMBURSED
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee e) { this.employee = e; }
    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant t) { this.tenant = t; }
    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory c) { this.category = c; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal a) { this.amount = a; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate d) { this.expenseDate = d; }
    public String getReceiptNote() { return receiptNote; }
    public void setReceiptNote(String r) { this.receiptNote = r; }
    public ExpenseStatus getStatus() { return status; }
    public void setStatus(ExpenseStatus s) { this.status = s; }
    public String getManagerNotes() { return managerNotes; }
    public void setManagerNotes(String n) { this.managerNotes = n; }
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String r) { this.reviewedBy = r; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime t) { this.submittedAt = t; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime t) { this.reviewedAt = t; }
}
