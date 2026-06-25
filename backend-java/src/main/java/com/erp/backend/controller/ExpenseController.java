package com.erp.backend.controller;

import com.erp.backend.dto.ExpenseDTO;
import com.erp.backend.repository.UserRepository;
import com.erp.backend.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/expenses")
public class ExpenseController {

    @Autowired private ExpenseService expenseService;
    @Autowired private UserRepository userRepository;

    private Long resolveTenantId(UserDetails p) {
        if (p == null) return 1L;
        return userRepository.findByEmail(p.getUsername())
                .map(u -> u.getTenant() != null ? u.getTenant().getId() : 1L).orElse(1L);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public List<ExpenseDTO> getAllExpenses(@AuthenticationPrincipal UserDetails principal) {
        return expenseService.getAllExpenses(resolveTenantId(principal));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("isAuthenticated()")
    public List<ExpenseDTO> getByEmployee(@PathVariable Long employeeId) {
        return expenseService.getExpensesByEmployee(employeeId);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public Map<String, Object> getSummary(@AuthenticationPrincipal UserDetails principal) {
        return expenseService.getSummary(resolveTenantId(principal));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ExpenseDTO> createExpense(@RequestBody ExpenseDTO dto) {
        return ResponseEntity.ok(expenseService.createExpense(dto));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ExpenseDTO> approve(@PathVariable Long id,
                                               @RequestBody Map<String, String> body,
                                               @AuthenticationPrincipal UserDetails principal) {
        String reviewer = principal != null ? principal.getUsername() : "admin";
        return ResponseEntity.ok(expenseService.approveExpense(id, reviewer, body.getOrDefault("notes", "")));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ExpenseDTO> reject(@PathVariable Long id,
                                              @RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal UserDetails principal) {
        String reviewer = principal != null ? principal.getUsername() : "admin";
        return ResponseEntity.ok(expenseService.rejectExpense(id, reviewer, body.getOrDefault("notes", "")));
    }

    @PutMapping("/{id}/reimburse")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ExpenseDTO> reimburse(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.reimbursedExpense(id));
    }
}
