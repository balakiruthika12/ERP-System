package com.erp.backend.service;

import com.erp.backend.dto.AnnouncementDTO;
import com.erp.backend.entity.Announcement;
import com.erp.backend.entity.Announcement.AnnouncementPriority;
import com.erp.backend.entity.Tenant;
import com.erp.backend.repository.AnnouncementRepository;
import com.erp.backend.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private TenantRepository tenantRepository;

    public List<AnnouncementDTO> getAllAnnouncements(Long tenantId) {
        return announcementRepository.findByTenantIdOrderByIsPinnedDescPublishedAtDesc(tenantId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AnnouncementDTO createAnnouncement(AnnouncementDTO dto) {
        Tenant tenant = tenantRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        Announcement a = new Announcement();
        a.setTenant(tenant);
        a.setTitle(dto.getTitle());
        a.setBody(dto.getBody());
        a.setPriority(dto.getPriority() != null ? AnnouncementPriority.valueOf(dto.getPriority()) : AnnouncementPriority.NORMAL);
        a.setAuthorName(dto.getAuthorName());
        a.setPinned(dto.isPinned());
        return toDTO(announcementRepository.save(a));
    }

    public AnnouncementDTO togglePin(Long id) {
        return announcementRepository.findById(id).map(a -> {
            a.setPinned(!a.isPinned());
            return toDTO(announcementRepository.save(a));
        }).orElseThrow(() -> new RuntimeException("Announcement not found: " + id));
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    public AnnouncementDTO toDTO(Announcement a) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setBody(a.getBody());
        dto.setPriority(a.getPriority().name());
        dto.setAuthorName(a.getAuthorName());
        dto.setPinned(a.isPinned());
        dto.setPublishedAt(a.getPublishedAt());
        return dto;
    }
}
