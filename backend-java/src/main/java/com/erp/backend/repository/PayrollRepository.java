package com.erp.backend.repository;

import com.erp.backend.entity.Payroll;
import com.erp.backend.entity.Payroll.PayrollStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployeeIdOrderByPayPeriodStartDesc(Long employeeId);
    List<Payroll> findByEmployeeId(Long employeeId);
    List<Payroll> findByTenantIdOrderByPayPeriodStartDesc(Long tenantId);
    List<Payroll> findByStatus(PayrollStatus status);

    @Query("SELECT SUM(p.grossSalary) FROM Payroll p WHERE p.tenant.id = :tenantId AND p.status = 'PAID'")
    java.math.BigDecimal sumGrossSalaryByTenantId(Long tenantId);

    List<Payroll> findTop3ByEmployeeIdOrderByPayPeriodStartDesc(Long employeeId);
}
