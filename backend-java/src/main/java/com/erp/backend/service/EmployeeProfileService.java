package com.erp.backend.service;

import com.erp.backend.dto.EmployeeProfileDTO;
import com.erp.backend.entity.Employee;
import com.erp.backend.entity.LeaveRequest.LeaveStatus;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.LeaveRequestRepository;
import com.erp.backend.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployeeProfileService {

    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private PayrollService payrollService;
    @Autowired private LeaveRequestService leaveRequestService;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private PayrollRepository payrollRepository;

    public EmployeeProfileDTO getProfile(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id " + employeeId));

        EmployeeProfileDTO dto = new EmployeeProfileDTO();
        dto.setId(emp.getId());
        dto.setFirstName(emp.getFirstName());
        dto.setLastName(emp.getLastName());
        dto.setFullName(emp.getFirstName() + " " + emp.getLastName());
        dto.setJobTitle(emp.getJobTitle());
        dto.setSalary(emp.getSalary());
        dto.setHireDate(emp.getHireDate());
        dto.setActive(emp.isActive());
        dto.setCreatedAt(emp.getCreatedAt());

        if (emp.getDepartment() != null) {
            dto.setDepartment(emp.getDepartment().getName());
            dto.setDepartmentId(emp.getDepartment().getId());
        }
        if (emp.getUser() != null) {
            dto.setEmail(emp.getUser().getEmail());
        }

        // Leave stats
        long pending = leaveRequestRepository.countByEmployeeIdAndStatus(employeeId, LeaveStatus.PENDING);
        long approved = leaveRequestRepository.countByEmployeeIdAndStatus(employeeId, LeaveStatus.APPROVED);
        dto.setPendingLeaveRequests((int) pending);
        dto.setTotalLeavesTaken((int) approved);

        // Recent payrolls (last 3)
        var recentPayrolls = payrollService.getRecentPayrollsByEmployee(employeeId);
        dto.setRecentPayrolls(recentPayrolls);
        if (!recentPayrolls.isEmpty()) {
            dto.setLastNetSalary(recentPayrolls.get(0).getNetSalary());
            dto.setLastPayrollStatus(recentPayrolls.get(0).getStatus().name());
        }

        // Recent leaves (last 5)
        dto.setRecentLeaves(leaveRequestService.getRecentLeavesByEmployee(employeeId));

        return dto;
    }
}

