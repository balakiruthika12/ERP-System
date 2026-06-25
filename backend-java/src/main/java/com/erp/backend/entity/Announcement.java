package com.erp.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Announcement — company-wide bulletin board entries.
 */
@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnouncementPriority priority = AnnouncementPriority.NORMAL;

    @Column(name = "author_name")
    private String authorName;

    @Column(name = "is_pinned")
    private boolean isPinned = false;

    @Column(name = "published_at")
    private LocalDateTime publishedAt = LocalDateTime.now();

    public enum AnnouncementPriority {
        LOW, NORMAL, HIGH, URGENT
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant t) { this.tenant = t; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public String getBody() { return body; }
    public void setBody(String b) { this.body = b; }
    public AnnouncementPriority getPriority() { return priority; }
    public void setPriority(AnnouncementPriority p) { this.priority = p; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String a) { this.authorName = a; }
    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean pinned) { isPinned = pinned; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime t) { this.publishedAt = t; }
}
