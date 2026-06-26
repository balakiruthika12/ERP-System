package com.erp.backend.controller;

import com.erp.backend.dto.LeaveRequestDTO;
import com.erp.backend.entity.LeaveRequest;
import com.erp.backend.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leave")
public class LeaveRequestController {

    @Autowired private LeaveRequestService leaveRequestService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<LeaveRequestDTO> getAllLeaveRequests() {
        return leaveRequestService.getAllLeaveRequests();
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("isAuthenticated()")
    public List<LeaveRequestDTO> getLeavesByEmployee(@PathVariable Long employeeId) {
        return leaveRequestService.getLeavesByEmployee(employeeId);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveRequestDTO> createLeaveRequest(@RequestBody LeaveRequest request) {
        return ResponseEntity.ok(leaveRequestService.createLeaveRequest(request));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveRequestDTO> approveLeave(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.getOrDefault("notes", "") : "";
        return ResponseEntity.ok(leaveRequestService.approveLeave(id, notes));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveRequestDTO> rejectLeave(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.getOrDefault("notes", "") : "";
        return ResponseEntity.ok(leaveRequestService.rejectLeave(id, notes));
    }
}
