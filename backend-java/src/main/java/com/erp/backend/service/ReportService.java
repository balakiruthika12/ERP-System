package com.erp.backend.service;

import com.erp.backend.repository.DepartmentRepository;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.LeaveRequestRepository;
import com.erp.backend.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional
public class ReportService {

    @Autowired private PayrollRepository payrollRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private DepartmentRepository departmentRepository;

    /** Payroll summary: total gross, net, tax across all records grouped by status */
    public Map<String, Object> getPayrollSummary() {
        var allPayrolls = payrollRepository.findAll();

        BigDecimal totalGross = allPayrolls.stream()
                .map(p -> p.getGrossSalary() != null ? p.getGrossSalary() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNet = allPayrolls.stream()
                .map(p -> p.getNetSalary() != null ? p.getNetSalary() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTax = allPayrolls.stream()
                .map(p -> p.getTaxDeduction() != null ? p.getTaxDeduction() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long paidCount = allPayrolls.stream().filter(p -> p.getStatus().name().equals("PAID")).count();
        long processedCount = allPayrolls.stream().filter(p -> p.getStatus().name().equals("PROCESSED")).count();
        long pendingCount = allPayrolls.stream().filter(p -> p.getStatus().name().equals("PENDING")).count();

        BigDecimal avgNet = allPayrolls.isEmpty() ? BigDecimal.ZERO
                : totalNet.divide(BigDecimal.valueOf(allPayrolls.size()), 2, RoundingMode.HALF_UP);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalGross", totalGross);
        summary.put("totalNet", totalNet);
        summary.put("totalTax", totalTax);
        summary.put("averageNetSalary", avgNet);
        summary.put("totalRecords", allPayrolls.size());
        summary.put("paidCount", paidCount);
        summary.put("processedCount", processedCount);
        summary.put("pendingCount", pendingCount);
        return summary;
    }

    /** Headcount report: employees per department */
    public List<Map<String, Object>> getHeadcountByDepartment() {
        var departments = departmentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (var dept : departments) {
            long count = employeeRepository.countByDepartmentId(dept.getId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("department", dept.getName());
            row.put("employeeCount", count);
            result.add(row);
        }
        return result;
    }

    /** Leave summary: count of leave requests by type */
    public Map<String, Object> getLeaveSummary() {
        var allLeaves = leaveRequestRepository.findAll();
        Map<String, Long> byType = new LinkedHashMap<>();
        Map<String, Long> byStatus = new LinkedHashMap<>();

        for (var leave : allLeaves) {
            String type = leave.getLeaveType().name();
            String status = leave.getStatus().name();
            byType.merge(type, 1L, Long::sum);
            byStatus.merge(status, 1L, Long::sum);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRequests", allLeaves.size());
        summary.put("byType", byType);
        summary.put("byStatus", byStatus);
        return summary;
    }

    /** Combined report for the reports dashboard */
    public Map<String, Object> getCombinedReport() {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("payroll", getPayrollSummary());
        report.put("headcount", getHeadcountByDepartment());
        report.put("leaves", getLeaveSummary());
        report.put("generatedAt", java.time.LocalDateTime.now().toString());
        return report;
    }
}

