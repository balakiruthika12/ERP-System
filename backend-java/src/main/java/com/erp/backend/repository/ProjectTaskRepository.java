package com.erp.backend.repository;

import com.erp.backend.entity.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
    List<ProjectTask> findByProjectIdOrderByCreatedAtAsc(Long projectId);
    List<ProjectTask> findByAssigneeIdOrderByDueDateAsc(Long assigneeId);
    long countByProjectIdAndStatus(Long projectId, ProjectTask.TaskStatus status);
}
