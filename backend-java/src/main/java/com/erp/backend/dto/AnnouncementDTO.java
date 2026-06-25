package com.erp.backend.dto;

import java.time.LocalDateTime;

public class AnnouncementDTO {
    private Long id;
    private String title;
    private String body;
    private String priority;
    private String authorName;
    private boolean isPinned;
    private LocalDateTime publishedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public String getBody() { return body; }
    public void setBody(String b) { this.body = b; }
    public String getPriority() { return priority; }
    public void setPriority(String p) { this.priority = p; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String a) { this.authorName = a; }
    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean p) { this.isPinned = p; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime t) { this.publishedAt = t; }
}
