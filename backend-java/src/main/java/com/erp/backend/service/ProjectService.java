package com.erp.backend.service;

import com.erp.backend.dto.ProjectDTO;
import com.erp.backend.dto.ProjectTaskDTO;
import com.erp.backend.entity.Employee;
import com.erp.backend.entity.Project;
import com.erp.backend.entity.Project.ProjectStatus;
import com.erp.backend.entity.ProjectTask;
import com.erp.backend.entity.ProjectTask.TaskPriority;
import com.erp.backend.entity.ProjectTask.TaskStatus;
import com.erp.backend.entity.Tenant;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.ProjectRepository;
import com.erp.backend.repository.ProjectTaskRepository;
import com.erp.backend.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectService {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectTaskRepository taskRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private TenantRepository tenantRepository;

    public List<ProjectDTO> getAllProjects(Long tenantId) {
        return projectRepository.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<ProjectDTO> getById(Long id) {
        return projectRepository.findById(id).map(this::toDTO);
    }

    public ProjectDTO createProject(ProjectDTO dto) {
        Tenant tenant = tenantRepository.findById(1L).orElseThrow();
        Project p = new Project();
        p.setTenant(tenant);
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        p.setStatus(dto.getStatus() != null ? ProjectStatus.valueOf(dto.getStatus()) : ProjectStatus.PLANNING);
        p.setStartDate(dto.getStartDate());
        p.setDueDate(dto.getDueDate());
        p.setBudget(dto.getBudget());
        if (dto.getLeadEmployeeId() != null) {
            employeeRepository.findById(dto.getLeadEmployeeId()).ifPresent(p::setLeadEmployee);
        }
        return toDTO(projectRepository.save(p));
    }

    public ProjectDTO updateStatus(Long id, String status) {
        return projectRepository.findById(id).map(p -> {
            p.setStatus(ProjectStatus.valueOf(status));
            return toDTO(projectRepository.save(p));
        }).orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }

    public ProjectTaskDTO addTask(Long projectId, ProjectTaskDTO dto) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        ProjectTask task = new ProjectTask();
        task.setProject(project);
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus() != null ? TaskStatus.valueOf(dto.getStatus()) : TaskStatus.TODO);
        task.setPriority(dto.getPriority() != null ? TaskPriority.valueOf(dto.getPriority()) : TaskPriority.MEDIUM);
        task.setDueDate(dto.getDueDate());
        if (dto.getAssigneeId() != null) {
            employeeRepository.findById(dto.getAssigneeId()).ifPresent(task::setAssignee);
        }
        return toTaskDTO(taskRepository.save(task));
    }

    public ProjectTaskDTO updateTaskStatus(Long taskId, String status) {
        return taskRepository.findById(taskId).map(t -> {
            t.setStatus(TaskStatus.valueOf(status));
            return toTaskDTO(taskRepository.save(t));
        }).orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
    }

    public void deleteProject(Long id) { projectRepository.deleteById(id); }

    /** Summary stats for dashboard */
    public Map<String, Object> getSummary(Long tenantId) {
        long total     = projectRepository.countByTenantIdAndStatus(tenantId, ProjectStatus.IN_PROGRESS)
                       + projectRepository.countByTenantIdAndStatus(tenantId, ProjectStatus.PLANNING)
                       + projectRepository.countByTenantIdAndStatus(tenantId, ProjectStatus.ON_HOLD)
                       + projectRepository.countByTenantIdAndStatus(tenantId, ProjectStatus.COMPLETED);
        long active    = projectRepository.countByTenantIdAndStatus(tenantId, ProjectStatus.IN_PROGRESS);
        long completed = projectRepository.countByTenantIdAndStatus(tenantId, ProjectStatus.COMPLETED);
        long overdue   = projectRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .filter(p -> p.getDueDate() != null && p.getDueDate().isBefore(java.time.LocalDate.now())
                          && p.getStatus() != ProjectStatus.COMPLETED && p.getStatus() != ProjectStatus.CANCELLED)
                .count();
        return Map.of("total", total, "active", active, "completed", completed, "overdue", overdue);
    }

    public ProjectDTO toDTO(Project p) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setStatus(p.getStatus().name());
        dto.setStartDate(p.getStartDate());
        dto.setDueDate(p.getDueDate());
        dto.setBudget(p.getBudget());
        dto.setCreatedAt(p.getCreatedAt());
        if (p.getLeadEmployee() != null) {
            dto.setLeadEmployeeId(p.getLeadEmployee().getId());
            dto.setLeadEmployeeName(p.getLeadEmployee().getFirstName() + " " + p.getLeadEmployee().getLastName());
        }
        List<ProjectTaskDTO> tasks = p.getTasks().stream().map(this::toTaskDTO).collect(Collectors.toList());
        dto.setTasks(tasks);
        dto.setTaskCount(tasks.size());
        dto.setCompletedTaskCount((int) tasks.stream().filter(t -> "DONE".equals(t.getStatus())).count());
        return dto;
    }

    public ProjectTaskDTO toTaskDTO(ProjectTask t) {
        ProjectTaskDTO dto = new ProjectTaskDTO();
        dto.setId(t.getId());
        dto.setProjectId(t.getProject().getId());
        dto.setProjectName(t.getProject().getName());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setStatus(t.getStatus().name());
        dto.setPriority(t.getPriority().name());
        dto.setDueDate(t.getDueDate());
        dto.setCreatedAt(t.getCreatedAt());
        if (t.getAssignee() != null) {
            dto.setAssigneeId(t.getAssignee().getId());
            dto.setAssigneeName(t.getAssignee().getFirstName() + " " + t.getAssignee().getLastName());
        }
        return dto;
    }
}

