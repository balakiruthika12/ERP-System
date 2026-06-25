package com.erp.backend.repository;

import com.erp.backend.entity.Training;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {
    List<Training> findByTenantIdOrderByStartDateDesc(Long tenantId);
    List<Training> findByStatusOrderByStartDateDesc(Training.TrainingStatus status);
}
