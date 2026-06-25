package com.erp.backend.controller;

import com.erp.backend.repository.DepartmentRepository;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.LeaveRequestRepository;
import com.erp.backend.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * SearchController — Phase 5 global search across employees, payroll, leaves, and departments.
 * Returns unified results grouped by entity type.
 */
@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private PayrollRepository payrollRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> search(@RequestParam String q) {
        String query = q.trim().toLowerCase();
        Map<String, Object> results = new LinkedHashMap<>();

        // Search employees
        List<Map<String, Object>> employees = employeeRepository.findAll().stream()
                .filter(e -> {
                    String fullName = (e.getFirstName() + " " + e.getLastName()).toLowerCase();
                    String title = e.getJobTitle() != null ? e.getJobTitle().toLowerCase() : "";
                    return fullName.contains(query) || title.contains(query);
                })
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", e.getId());
                    m.put("type", "EMPLOYEE");
                    m.put("title", e.getFirstName() + " " + e.getLastName());
                    m.put("subtitle", e.getJobTitle());
                    m.put("url", "/dashboard/employees/" + e.getId());
                    return m;
                })
                .toList();

        // Search departments
        List<Map<String, Object>> departments = departmentRepository.findAll().stream()
                .filter(d -> d.getName().toLowerCase().contains(query)
                        || (d.getDescription() != null && d.getDescription().toLowerCase().contains(query)))
                .limit(5)
                .map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", d.getId());
                    m.put("type", "DEPARTMENT");
                    m.put("title", d.getName());
                    m.put("subtitle", d.getDescription());
                    m.put("url", "/dashboard/departments");
                    return m;
                })
                .toList();

        // Search leave requests (by employee name)
        List<Map<String, Object>> leaves = leaveRequestRepository.findAll().stream()
                .filter(l -> {
                    String empName = (l.getEmployee().getFirstName() + " " + l.getEmployee().getLastName()).toLowerCase();
                    return empName.contains(query) || l.getLeaveType().name().toLowerCase().contains(query);
                })
                .limit(5)
                .map(l -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", l.getId());
                    m.put("type", "LEAVE");
                    m.put("title", l.getEmployee().getFirstName() + " " + l.getEmployee().getLastName() + " — " + l.getLeaveType().name());
                    m.put("subtitle", l.getStatus().name() + " · " + l.getStartDate() + " to " + l.getEndDate());
                    m.put("url", "/dashboard/leave");
                    return m;
                })
                .toList();

        results.put("employees", employees);
        results.put("departments", departments);
        results.put("leaves", leaves);
        results.put("total", employees.size() + departments.size() + leaves.size());
        results.put("query", q);

        return results;
    }
}
