package com.erp.backend.controller;

import com.erp.backend.dto.PerformanceReviewDTO;
import com.erp.backend.repository.UserRepository;
import com.erp.backend.service.PerformanceReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/performance")
public class PerformanceReviewController {

    @Autowired private PerformanceReviewService reviewService;
    @Autowired private UserRepository userRepository;

    private Long resolveTenantId(UserDetails principal) {
        if (principal == null) return 1L;
        return userRepository.findByEmail(principal.getUsername())
                .map(u -> u.getTenant() != null ? u.getTenant().getId() : 1L)
                .orElse(1L);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<PerformanceReviewDTO> getAllReviews(@AuthenticationPrincipal UserDetails principal) {
        return reviewService.getAllReviews(resolveTenantId(principal));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("isAuthenticated()")
    public List<PerformanceReviewDTO> getByEmployee(@PathVariable Long employeeId) {
        return reviewService.getReviewsByEmployee(employeeId);
    }

    @GetMapping("/employee/{employeeId}/latest")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PerformanceReviewDTO> getLatest(@PathVariable Long employeeId) {
        return reviewService.getLatestReview(employeeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PerformanceReviewDTO> createReview(@RequestBody PerformanceReviewDTO dto) {
        return ResponseEntity.ok(reviewService.createReview(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PerformanceReviewDTO> updateReview(@PathVariable Long id, @RequestBody PerformanceReviewDTO dto) {
        try {
            return ResponseEntity.ok(reviewService.updateReview(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
