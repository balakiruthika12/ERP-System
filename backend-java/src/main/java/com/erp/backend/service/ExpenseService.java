package com.erp.backend.service;

import com.erp.backend.dto.ExpenseDTO;
import com.erp.backend.entity.Employee;
import com.erp.backend.entity.Expense;
import com.erp.backend.entity.Expense.ExpenseCategory;
import com.erp.backend.entity.Expense.ExpenseStatus;
import com.erp.backend.entity.Tenant;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.ExpenseRepository;
import com.erp.backend.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private TenantRepository tenantRepository;

    public List<ExpenseDTO> getAllExpenses(Long tenantId) {
        return expenseRepository.findByTenantIdOrderBySubmittedAtDesc(tenantId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ExpenseDTO> getExpensesByEmployee(Long employeeId) {
        return expenseRepository.findByEmployeeIdOrderBySubmittedAtDesc(employeeId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ExpenseDTO createExpense(ExpenseDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Tenant tenant = tenantRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        Expense expense = new Expense();
        expense.setEmployee(employee);
        expense.setTenant(tenant);
        expense.setCategory(ExpenseCategory.valueOf(dto.getCategory()));
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setExpenseDate(dto.getExpenseDate());
        expense.setReceiptNote(dto.getReceiptNote());
        expense.setStatus(ExpenseStatus.PENDING);
        return toDTO(expenseRepository.save(expense));
    }

    public ExpenseDTO approveExpense(Long id, String reviewerEmail, String notes) {
        return expenseRepository.findById(id).map(e -> {
            e.setStatus(ExpenseStatus.APPROVED);
            e.setReviewedBy(reviewerEmail);
            e.setManagerNotes(notes);
            e.setReviewedAt(LocalDateTime.now());
            return toDTO(expenseRepository.save(e));
        }).orElseThrow(() -> new RuntimeException("Expense not found: " + id));
    }

    public ExpenseDTO rejectExpense(Long id, String reviewerEmail, String notes) {
        return expenseRepository.findById(id).map(e -> {
            e.setStatus(ExpenseStatus.REJECTED);
            e.setReviewedBy(reviewerEmail);
            e.setManagerNotes(notes);
            e.setReviewedAt(LocalDateTime.now());
            return toDTO(expenseRepository.save(e));
        }).orElseThrow(() -> new RuntimeException("Expense not found: " + id));
    }

    public ExpenseDTO reimbursedExpense(Long id) {
        return expenseRepository.findById(id).map(e -> {
            e.setStatus(ExpenseStatus.REIMBURSED);
            return toDTO(expenseRepository.save(e));
        }).orElseThrow(() -> new RuntimeException("Expense not found: " + id));
    }

    /** Summary stats for the dashboard header */
    public Map<String, Object> getSummary(Long tenantId) {
        var all = expenseRepository.findByTenantIdOrderBySubmittedAtDesc(tenantId);
        BigDecimal totalPending  = all.stream().filter(e -> e.getStatus() == ExpenseStatus.PENDING)
                .map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalApproved = all.stream().filter(e -> e.getStatus() == ExpenseStatus.APPROVED || e.getStatus() == ExpenseStatus.REIMBURSED)
                .map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return Map.of(
            "total", all.size(),
            "pending", all.stream().filter(e -> e.getStatus() == ExpenseStatus.PENDING).count(),
            "approved", all.stream().filter(e -> e.getStatus() == ExpenseStatus.APPROVED).count(),
            "rejected", all.stream().filter(e -> e.getStatus() == ExpenseStatus.REJECTED).count(),
            "totalPendingAmount", totalPending,
            "totalApprovedAmount", totalApproved
        );
    }

    public ExpenseDTO toDTO(Expense e) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(e.getId());
        dto.setEmployeeId(e.getEmployee().getId());
        dto.setEmployeeName(e.getEmployee().getFirstName() + " " + e.getEmployee().getLastName());
        dto.setDepartment(e.getEmployee().getDepartment() != null ? e.getEmployee().getDepartment().getName() : null);
        dto.setCategory(e.getCategory().name());
        dto.setAmount(e.getAmount());
        dto.setDescription(e.getDescription());
        dto.setExpenseDate(e.getExpenseDate());
        dto.setReceiptNote(e.getReceiptNote());
        dto.setStatus(e.getStatus().name());
        dto.setManagerNotes(e.getManagerNotes());
        dto.setReviewedBy(e.getReviewedBy());
        dto.setSubmittedAt(e.getSubmittedAt());
        dto.setReviewedAt(e.getReviewedAt());
        return dto;
    }
}
