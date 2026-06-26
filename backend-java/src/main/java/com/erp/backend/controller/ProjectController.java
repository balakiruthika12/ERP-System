package com.erp.backend.controller;

import com.erp.backend.dto.ProjectDTO;
import com.erp.backend.dto.ProjectTaskDTO;
import com.erp.backend.repository.UserRepository;
import com.erp.backend.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    @Autowired private ProjectService projectService;
    @Autowired private UserRepository userRepository;

    private Long resolveTenantId(UserDetails p) {
        if (p == null) return 1L;
        return userRepository.findByEmail(p.getUsername())
                .map(u -> u.getTenant() != null ? u.getTenant().getId() : 1L).orElse(1L);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<ProjectDTO> getAll(@AuthenticationPrincipal UserDetails principal) {
        return projectService.getAllProjects(resolveTenantId(principal));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDTO> getById(@PathVariable Long id) {
        return projectService.getById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getSummary(@AuthenticationPrincipal UserDetails principal) {
        return projectService.getSummary(resolveTenantId(principal));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDTO> create(@RequestBody ProjectDTO dto) {
        return ResponseEntity.ok(projectService.createProject(dto));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectService.updateStatus(id, body.get("status")));
    }

    @PostMapping("/{projectId}/tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectTaskDTO> addTask(@PathVariable Long projectId, @RequestBody ProjectTaskDTO dto) {
        return ResponseEntity.ok(projectService.addTask(projectId, dto));
    }

    @PutMapping("/tasks/{taskId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectTaskDTO> updateTaskStatus(@PathVariable Long taskId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectService.updateTaskStatus(taskId, body.get("status")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
