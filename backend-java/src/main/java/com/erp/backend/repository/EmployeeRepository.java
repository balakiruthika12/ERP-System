package com.erp.backend.repository;

import com.erp.backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByDepartmentId(Long departmentId);
    long countByDepartmentId(Long departmentId);
    long countByTenantId(Long tenantId);
}
