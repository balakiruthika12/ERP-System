package com.erp.backend.repository;

import com.erp.backend.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    List<PerformanceReview> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<PerformanceReview> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    Optional<PerformanceReview> findTopByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    long countByTenantId(Long tenantId);
}
