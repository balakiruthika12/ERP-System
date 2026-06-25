package com.erp.backend.controller;

import com.erp.backend.dto.AnnouncementDTO;
import com.erp.backend.repository.UserRepository;
import com.erp.backend.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

    @Autowired private AnnouncementService announcementService;
    @Autowired private UserRepository userRepository;

    private Long resolveTenantId(UserDetails p) {
        if (p == null) return 1L;
        return userRepository.findByEmail(p.getUsername())
                .map(u -> u.getTenant() != null ? u.getTenant().getId() : 1L).orElse(1L);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<AnnouncementDTO> getAll(@AuthenticationPrincipal UserDetails principal) {
        return announcementService.getAllAnnouncements(resolveTenantId(principal));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<AnnouncementDTO> create(@RequestBody AnnouncementDTO dto,
                                                    @AuthenticationPrincipal UserDetails principal) {
        if (dto.getAuthorName() == null && principal != null) {
            dto.setAuthorName(principal.getUsername());
        }
        return ResponseEntity.ok(announcementService.createAnnouncement(dto));
    }

    @PutMapping("/{id}/pin")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<AnnouncementDTO> togglePin(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.togglePin(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }
}
