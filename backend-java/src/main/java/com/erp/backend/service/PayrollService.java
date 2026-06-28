package com.erp.backend.service;

import com.erp.backend.dto.PayrollDTO;
import com.erp.backend.entity.Employee;
import com.erp.backend.entity.Payroll;
import com.erp.backend.entity.Payroll.PayrollStatus;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PayrollService {

    @Autowired private PayrollRepository payrollRepository;
    @Autowired private EmployeeRepository employeeRepository;

    public List<PayrollDTO> getAllPayrolls() {
        return payrollRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PayrollDTO> getPayrollsByEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeIdOrderByPayPeriodStartDesc(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PayrollDTO> getRecentPayrollsByEmployee(Long employeeId) {
        return payrollRepository.findTop3ByEmployeeIdOrderByPayPeriodStartDesc(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Processes payroll for a single employee — calculates tax (25%) and net salary */
    public PayrollDTO processPayroll(Payroll payroll) {
        Employee emp = employeeRepository.findById(payroll.getEmployee().getId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        BigDecimal gross = payroll.getGrossSalary() != null
                ? payroll.getGrossSalary()
                : emp.getSalary().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);

        BigDecimal tax = gross.multiply(BigDecimal.valueOf(0.25)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal otherDed = payroll.getOtherDeductions() != null ? payroll.getOtherDeductions() : BigDecimal.ZERO;
        BigDecimal net = gross.subtract(tax).subtract(otherDed);

        payroll.setGrossSalary(gross);
        payroll.setTaxDeduction(tax);
        payroll.setOtherDeductions(otherDed);
        payroll.setNetSalary(net);
        payroll.setStatus(PayrollStatus.PROCESSED);
        payroll.setProcessedAt(LocalDateTime.now());
        payroll.setTenant(emp.getTenant());

        return toDTO(payrollRepository.save(payroll));
    }

    public PayrollDTO markAsPaid(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll record not found"));
        payroll.setStatus(PayrollStatus.PAID);
        return toDTO(payrollRepository.save(payroll));
    }

    public PayrollDTO toDTO(Payroll p) {
        PayrollDTO dto = new PayrollDTO();
        dto.setId(p.getId());
        dto.setPayPeriodStart(p.getPayPeriodStart());
        dto.setPayPeriodEnd(p.getPayPeriodEnd());
        dto.setGrossSalary(p.getGrossSalary());
        dto.setTaxDeduction(p.getTaxDeduction());
        dto.setOtherDeductions(p.getOtherDeductions());
        dto.setNetSalary(p.getNetSalary());
        dto.setStatus(p.getStatus());
        dto.setProcessedAt(p.getProcessedAt());
        dto.setCreatedAt(p.getCreatedAt());
        if (p.getEmployee() != null) {
            dto.setEmployeeId(p.getEmployee().getId());
            dto.setEmployeeName(p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName());
            dto.setJobTitle(p.getEmployee().getJobTitle());
            if (p.getEmployee().getDepartment() != null) {
                dto.setDepartment(p.getEmployee().getDepartment().getName());
            }
        }
        return dto;
    }
}

