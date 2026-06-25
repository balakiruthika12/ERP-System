package com.erp.backend.service;

import com.erp.backend.dto.LeaveRequestDTO;
import com.erp.backend.entity.LeaveRequest;
import com.erp.backend.entity.LeaveRequest.LeaveStatus;
import com.erp.backend.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveRequestService {

    @Autowired private LeaveRequestRepository leaveRequestRepository;

    public List<LeaveRequestDTO> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getPendingLeaveRequests(Long tenantId) {
        return leaveRequestRepository
                .findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, LeaveStatus.PENDING).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getLeavesByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getRecentLeavesByEmployee(Long employeeId) {
        return leaveRequestRepository.findTop5ByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public LeaveRequestDTO createLeaveRequest(LeaveRequest request) {
        request.setStatus(LeaveStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        return toDTO(leaveRequestRepository.save(request));
    }

    public LeaveRequestDTO approveLeave(Long id, String managerNotes) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        req.setStatus(LeaveStatus.APPROVED);
        req.setManagerNotes(managerNotes);
        req.setUpdatedAt(LocalDateTime.now());
        return toDTO(leaveRequestRepository.save(req));
    }

    public LeaveRequestDTO rejectLeave(Long id, String managerNotes) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        req.setStatus(LeaveStatus.REJECTED);
        req.setManagerNotes(managerNotes);
        req.setUpdatedAt(LocalDateTime.now());
        return toDTO(leaveRequestRepository.save(req));
    }

    public LeaveRequestDTO toDTO(LeaveRequest r) {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setId(r.getId());
        dto.setLeaveType(r.getLeaveType());
        dto.setStartDate(r.getStartDate());
        dto.setEndDate(r.getEndDate());
        dto.setReason(r.getReason());
        dto.setStatus(r.getStatus());
        dto.setManagerNotes(r.getManagerNotes());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        if (r.getStartDate() != null && r.getEndDate() != null) {
            dto.setDurationDays((int) ChronoUnit.DAYS.between(r.getStartDate(), r.getEndDate()) + 1);
        }
        if (r.getEmployee() != null) {
            dto.setEmployeeId(r.getEmployee().getId());
            dto.setEmployeeName(r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName());
            if (r.getEmployee().getDepartment() != null) {
                dto.setDepartment(r.getEmployee().getDepartment().getName());
            }
        }
        return dto;
    }
}
