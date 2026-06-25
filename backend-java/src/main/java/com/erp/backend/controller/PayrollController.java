package com.erp.backend.controller;

import com.erp.backend.dto.PayrollDTO;
import com.erp.backend.entity.Payroll;
import com.erp.backend.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payroll")
public class PayrollController {

    @Autowired private PayrollService payrollService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public List<PayrollDTO> getAllPayrolls() {
        return payrollService.getAllPayrolls();
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public List<PayrollDTO> getPayrollsByEmployee(@PathVariable Long employeeId) {
        return payrollService.getPayrollsByEmployee(employeeId);
    }

    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<PayrollDTO> processPayroll(@RequestBody Payroll payroll) {
        return ResponseEntity.ok(payrollService.processPayroll(payroll));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PayrollDTO> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.markAsPaid(id));
    }
}
