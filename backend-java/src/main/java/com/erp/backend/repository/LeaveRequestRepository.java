package com.erp.backend.repository;

import com.erp.backend.entity.LeaveRequest;
import com.erp.backend.entity.LeaveRequest.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<LeaveRequest> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<LeaveRequest> findByTenantIdAndStatusOrderByCreatedAtDesc(Long tenantId, LeaveStatus status);
    long countByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);
    List<LeaveRequest> findTop5ByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}
