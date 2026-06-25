package com.erp.backend.repository;

import com.erp.backend.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByTenantIdOrderByIsPinnedDescPublishedAtDesc(Long tenantId);
}
