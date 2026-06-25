package com.erp.backend.controller;

import com.erp.backend.dto.AuditLogDTO;
import com.erp.backend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.erp.backend.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditLogController {

    @Autowired private AuditLogService auditLogService;
    @Autowired private UserRepository userRepository;

    private Long resolveTenantId(UserDetails principal) {
        if (principal == null) return 1L;
        return userRepository.findByEmail(principal.getUsername())
                .map(u -> u.getTenant() != null ? u.getTenant().getId() : 1L)
                .orElse(1L);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLogDTO> getRecentLogs(@AuthenticationPrincipal UserDetails principal) {
        return auditLogService.getRecentLogs(resolveTenantId(principal));
    }

    @GetMapping("/entity/{entityType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public List<AuditLogDTO> getLogsByEntityType(
            @PathVariable String entityType,
            @AuthenticationPrincipal UserDetails principal) {
        return auditLogService.getLogsByEntityType(resolveTenantId(principal), entityType.toUpperCase());
    }
}
