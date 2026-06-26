package com.erp.backend.controller;

import com.erp.backend.dto.DepartmentDTO;
import com.erp.backend.entity.Department;
import com.erp.backend.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {

    @Autowired private DepartmentService departmentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<DepartmentDTO> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DepartmentDTO> getDepartmentById(@PathVariable Long id) {
        return departmentService.getDepartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DepartmentDTO> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentService.createDepartment(department));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DepartmentDTO> updateDepartment(@PathVariable Long id, @RequestBody Department departmentDetails) {
        try {
            return ResponseEntity.ok(departmentService.updateDepartment(id, departmentDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    /** Phase 5: Returns departments enriched with monthly budget vs. actual payroll spend */
    @GetMapping("/budget-report")
    @PreAuthorize("isAuthenticated()")
    public List<DepartmentDTO> getBudgetReport() {
        return departmentService.getBudgetReport();
    }
}
