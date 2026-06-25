package com.erp.backend.repository;

import com.erp.backend.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<Goal> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    long countByTenantIdAndStatus(Long tenantId, Goal.GoalStatus status);
}
