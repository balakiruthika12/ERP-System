package com.erp.backend.controller;

import com.erp.backend.dto.GoalDTO;
import com.erp.backend.repository.UserRepository;
import com.erp.backend.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {

    @Autowired private GoalService goalService;
    @Autowired private UserRepository userRepository;

    private Long resolveTenantId(UserDetails p) {
        if (p == null) return 1L;
        return userRepository.findByEmail(p.getUsername())
                .map(u -> u.getTenant() != null ? u.getTenant().getId() : 1L).orElse(1L);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public List<GoalDTO> getAll(@AuthenticationPrincipal UserDetails principal) {
        return goalService.getAllGoals(resolveTenantId(principal));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("isAuthenticated()")
    public List<GoalDTO> getByEmployee(@PathVariable Long employeeId) {
        return goalService.getGoalsByEmployee(employeeId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<GoalDTO> create(@RequestBody GoalDTO dto) {
        return ResponseEntity.ok(goalService.createGoal(dto));
    }

    @PutMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<GoalDTO> updateProgress(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(goalService.updateProgress(id, body.getOrDefault("progress", 0)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<GoalDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(goalService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
