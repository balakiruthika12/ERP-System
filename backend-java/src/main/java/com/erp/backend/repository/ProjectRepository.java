package com.erp.backend.repository;

import com.erp.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<Project> findByStatusOrderByDueDateAsc(Project.ProjectStatus status);
    long countByTenantIdAndStatus(Long tenantId, Project.ProjectStatus status);
}
