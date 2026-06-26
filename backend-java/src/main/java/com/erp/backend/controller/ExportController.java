package com.erp.backend.controller;

import com.erp.backend.entity.Employee;
import com.erp.backend.entity.Payroll;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ExportController — Phase 5 CSV export endpoints for payroll and employee data.
 */
@RestController
@RequestMapping("/api/v1/export")
public class ExportController {

    @Autowired private PayrollRepository payrollRepository;
    @Autowired private EmployeeRepository employeeRepository;

    @GetMapping("/payroll")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportPayrollCsv() {
        List<Payroll> payrolls = payrollRepository.findAll();

        StringBuilder sb = new StringBuilder();
        sb.append("ID,Employee,Job Title,Department,Pay Period Start,Pay Period End,Gross Salary,Tax,Other Deductions,Net Salary,Status\n");

        for (Payroll p : payrolls) {
            sb.append(p.getId()).append(",")
              .append(escape(p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName())).append(",")
              .append(escape(p.getEmployee().getJobTitle())).append(",")
              .append(escape(p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : "")).append(",")
              .append(p.getPayPeriodStart()).append(",")
              .append(p.getPayPeriodEnd()).append(",")
              .append(p.getGrossSalary()).append(",")
              .append(p.getTaxDeduction()).append(",")
              .append(p.getOtherDeductions()).append(",")
              .append(p.getNetSalary()).append(",")
              .append(p.getStatus().name()).append("\n");
        }

        byte[] csvBytes = sb.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"payroll_export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping("/employees")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportEmployeesCsv() {
        List<Employee> employees = employeeRepository.findAll();

        StringBuilder sb = new StringBuilder();
        sb.append("ID,First Name,Last Name,Job Title,Department,Salary,Hire Date,Active\n");

        for (Employee e : employees) {
            sb.append(e.getId()).append(",")
              .append(escape(e.getFirstName())).append(",")
              .append(escape(e.getLastName())).append(",")
              .append(escape(e.getJobTitle())).append(",")
              .append(escape(e.getDepartment() != null ? e.getDepartment().getName() : "")).append(",")
              .append(e.getSalary()).append(",")
              .append(e.getHireDate()).append(",")
              .append(e.isActive()).append("\n");
        }

        byte[] csvBytes = sb.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"employees_export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    /** Wraps a value in double quotes and escapes internal quotes for CSV safety */
    private String escape(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
