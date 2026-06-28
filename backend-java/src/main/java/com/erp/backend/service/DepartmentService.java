package com.erp.backend.service;

import com.erp.backend.dto.DepartmentDTO;
import com.erp.backend.entity.Department;
import com.erp.backend.repository.DepartmentRepository;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private PayrollRepository payrollRepository;

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<DepartmentDTO> getDepartmentById(Long id) {
        return departmentRepository.findById(id).map(this::toDTO);
    }

    public DepartmentDTO createDepartment(Department department) {
        return toDTO(departmentRepository.save(department));
    }

    public DepartmentDTO updateDepartment(Long id, Department details) {
        return departmentRepository.findById(id).map(dept -> {
            dept.setName(details.getName());
            dept.setDescription(details.getDescription());
            if (details.getMonthlyBudget() != null) {
                dept.setMonthlyBudget(details.getMonthlyBudget());
            }
            return toDTO(departmentRepository.save(dept));
        }).orElseThrow(() -> new RuntimeException("Department not found: " + id));
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    /** Phase 5: Returns all departments with budget vs. actual payroll spend */
    public List<DepartmentDTO> getBudgetReport() {
        return departmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DepartmentDTO toDTO(Department d) {
        long empCount = employeeRepository.countByDepartmentId(d.getId());

        // Actual spend = sum of all payroll gross for employees in this department
        BigDecimal actualSpend = employeeRepository.findByDepartmentId(d.getId()).stream()
                .flatMap(emp -> payrollRepository.findByEmployeeId(emp.getId()).stream())
                .map(p -> p.getGrossSalary() != null ? p.getGrossSalary() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DepartmentDTO(
                d.getId(),
                d.getName(),
                d.getDescription(),
                d.getTenant() != null ? d.getTenant().getId() : null,
                empCount,
                d.getMonthlyBudget(),
                actualSpend
        );
    }
}

