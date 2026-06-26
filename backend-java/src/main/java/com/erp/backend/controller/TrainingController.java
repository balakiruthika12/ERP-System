package com.erp.backend.controller;

import com.erp.backend.dto.TrainingDTO;
import com.erp.backend.repository.UserRepository;
import com.erp.backend.service.TrainingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/training")
public class TrainingController {

    @Autowired private TrainingService trainingService;
    @Autowired private UserRepository userRepository;

    private Long resolveTenantId(UserDetails p) {
        if (p == null) return 1L;
        return userRepository.findByEmail(p.getUsername())
                .map(u -> u.getTenant() != null ? u.getTenant().getId() : 1L).orElse(1L);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<TrainingDTO> getAll(@AuthenticationPrincipal UserDetails principal) {
        return trainingService.getAllTrainings(resolveTenantId(principal));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TrainingDTO> getById(@PathVariable Long id) {
        return trainingService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TrainingDTO> create(@RequestBody TrainingDTO dto) {
        return ResponseEntity.ok(trainingService.createTraining(dto));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TrainingDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(trainingService.updateStatus(id, body.get("status")));
    }

    @PostMapping("/{trainingId}/enroll/{employeeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TrainingDTO> enroll(@PathVariable Long trainingId, @PathVariable Long employeeId) {
        return ResponseEntity.ok(trainingService.enrollEmployee(trainingId, employeeId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        trainingService.deleteTraining(id);
        return ResponseEntity.noContent().build();
    }
}
