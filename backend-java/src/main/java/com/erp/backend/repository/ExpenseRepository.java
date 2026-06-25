package com.erp.backend.repository;

import com.erp.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByTenantIdOrderBySubmittedAtDesc(Long tenantId);
    List<Expense> findByEmployeeIdOrderBySubmittedAtDesc(Long employeeId);
    List<Expense> findByStatusOrderBySubmittedAtDesc(Expense.ExpenseStatus status);
    long countByTenantIdAndStatus(Long tenantId, Expense.ExpenseStatus status);
}
