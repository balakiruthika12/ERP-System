package com.erp.backend.service;

import com.erp.backend.dto.EmployeeDTO;
import com.erp.backend.entity.Employee;
import com.erp.backend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EmployeeDTO> getEmployeesByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<EmployeeDTO> getEmployeeById(Long id) {
        return employeeRepository.findById(id).map(this::toDTO);
    }

    public EmployeeDTO createEmployee(Employee employee) {
        return toDTO(employeeRepository.save(employee));
    }

    public EmployeeDTO updateEmployee(Long id, Employee employeeDetails) {
        return employeeRepository.findById(id).map(employee -> {
            employee.setFirstName(employeeDetails.getFirstName());
            employee.setLastName(employeeDetails.getLastName());
            employee.setJobTitle(employeeDetails.getJobTitle());
            employee.setSalary(employeeDetails.getSalary());
            employee.setDepartment(employeeDetails.getDepartment());
            employee.setActive(employeeDetails.isActive());
            return toDTO(employeeRepository.save(employee));
        }).orElseThrow(() -> new RuntimeException("Employee not found with id " + id));
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }

    /** Gap 2 fix: map Employee entity → EmployeeDTO (flattens lazy associations) */
    public EmployeeDTO toDTO(Employee e) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(e.getId());
        dto.setFirstName(e.getFirstName());
        dto.setLastName(e.getLastName());
        dto.setFullName(e.getFirstName() + " " + e.getLastName());
        dto.setJobTitle(e.getJobTitle());
        dto.setSalary(e.getSalary());
        dto.setHireDate(e.getHireDate());
        dto.setActive(e.isActive());
        dto.setCreatedAt(e.getCreatedAt());
        if (e.getDepartment() != null) {
            dto.setDepartmentId(e.getDepartment().getId());
            dto.setDepartmentName(e.getDepartment().getName());
        }
        if (e.getTenant() != null) {
            dto.setTenantId(e.getTenant().getId());
        }
        if (e.getUser() != null) {
            dto.setEmail(e.getUser().getEmail());
        }
        return dto;
    }
}
