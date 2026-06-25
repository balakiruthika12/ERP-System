package com.erp.backend.controller;

import com.erp.backend.dto.DashboardMetricsDTO;
import com.erp.backend.entity.AuditLog;
import com.erp.backend.entity.Project.ProjectStatus;
import com.erp.backend.repository.AuditLogRepository;
import com.erp.backend.repository.PayrollRepository;
import com.erp.backend.repository.ProjectRepository;
import com.erp.backend.repository.TenantRepository;
import com.erp.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * DashboardController — Executive dashboard endpoints.
 * Phase 6: payroll-trend SVG chart data.
 * Phase 7: activity-feed (audit log), project-summary widget.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Autowired private DashboardService dashboardService;
    @Autowired private PayrollRepository payrollRepository;
    @Autowired private TenantRepository tenantRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private ProjectRepository projectRepository;

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE')")
    public DashboardMetricsDTO getExecutiveMetrics() {
        return dashboardService.getExecutiveMetrics();
    }

    /** 6-month payroll gross salary trend for SVG sparkline chart. */
    @GetMapping("/payroll-trend")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> getPayrollTrend() {
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd  = monthDate.withDayOfMonth(monthDate.lengthOfMonth());
            BigDecimal total = payrollRepository.findAll().stream()
                    .filter(p -> !p.getPayPeriodStart().isAfter(monthEnd)
                              && !p.getPayPeriodEnd().isBefore(monthDate))
                    .map(p -> p.getGrossSalary() != null ? p.getGrossSalary() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("month", monthDate.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + monthDate.getYear());
            point.put("total", total);
            trend.add(point);
        }
        return trend;
    }

    /** Phase 7: Latest 8 audit log entries for the dashboard activity feed. */
    @GetMapping("/activity-feed")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> getActivityFeed() {
        return auditLogRepository.findAll().stream()
                .sorted(Comparator.comparing(AuditLog::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", a.getId());
                    m.put("action", a.getAction() != null ? a.getAction().name() : "");
                    m.put("entityType", a.getEntityType());
                    m.put("details", a.getDetails());
                    m.put("performedBy", a.getPerformedBy());
                    m.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "");
                    return m;
                })
                .collect(Collectors.toList());
    }

    /** Phase 7: Project summary counts for the executive dashboard widget. */
    @GetMapping("/project-summary")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getProjectSummary() {
        List<com.erp.backend.entity.Project> all = projectRepository.findAll();
        long active    = all.stream().filter(p -> p.getStatus() == ProjectStatus.IN_PROGRESS).count();
        long planning  = all.stream().filter(p -> p.getStatus() == ProjectStatus.PLANNING).count();
        long completed = all.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();
        long overdue   = all.stream()
                .filter(p -> p.getDueDate() != null && p.getDueDate().isBefore(LocalDate.now())
                          && p.getStatus() != ProjectStatus.COMPLETED && p.getStatus() != ProjectStatus.CANCELLED)
                .count();
        return Map.of("total", all.size(), "active", active, "planning", planning,
                      "completed", completed, "overdue", overdue);
    }
}
