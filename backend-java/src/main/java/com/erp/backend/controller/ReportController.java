package com.erp.backend.controller;

import com.erp.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    @Autowired private ReportService reportService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getCombinedReport() {
        return reportService.getCombinedReport();
    }

    @GetMapping("/payroll-summary")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getPayrollSummary() {
        return reportService.getPayrollSummary();
    }

    @GetMapping("/headcount")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> getHeadcount() {
        return reportService.getHeadcountByDepartment();
    }

    @GetMapping("/leave-summary")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getLeaveSummary() {
        return reportService.getLeaveSummary();
    }
}
