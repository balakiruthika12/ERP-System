package com.erp.backend.service;

import com.erp.backend.dto.GoalDTO;
import com.erp.backend.entity.Employee;
import com.erp.backend.entity.Goal;
import com.erp.backend.entity.Goal.GoalCategory;
import com.erp.backend.entity.Goal.GoalStatus;
import com.erp.backend.entity.Tenant;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.GoalRepository;
import com.erp.backend.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GoalService {

    @Autowired private GoalRepository goalRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private TenantRepository tenantRepository;

    public List<GoalDTO> getAllGoals(Long tenantId) {
        return goalRepository.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<GoalDTO> getGoalsByEmployee(Long employeeId) {
        return goalRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public GoalDTO createGoal(GoalDTO dto) {
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found: " + dto.getEmployeeId()));
        Tenant tenant = tenantRepository.findById(1L).orElseThrow();
        Goal g = new Goal();
        g.setEmployee(emp); g.setTenant(tenant);
        g.setTitle(dto.getTitle()); g.setDescription(dto.getDescription());
        g.setCategory(dto.getCategory() != null ? GoalCategory.valueOf(dto.getCategory()) : GoalCategory.PERFORMANCE);
        g.setProgress(dto.getProgress() != null ? dto.getProgress() : 0);
        g.setStatus(GoalStatus.ACTIVE);
        g.setTargetDate(dto.getTargetDate());
        g.setQuarter(dto.getQuarter());
        return toDTO(goalRepository.save(g));
    }

    public GoalDTO updateProgress(Long id, int progress) {
        return goalRepository.findById(id).map(g -> {
            g.setProgress(Math.min(100, Math.max(0, progress)));
            if (progress >= 100) g.setStatus(GoalStatus.COMPLETED);
            return toDTO(goalRepository.save(g));
        }).orElseThrow(() -> new RuntimeException("Goal not found: " + id));
    }

    public GoalDTO updateStatus(Long id, String status) {
        return goalRepository.findById(id).map(g -> {
            g.setStatus(GoalStatus.valueOf(status));
            return toDTO(goalRepository.save(g));
        }).orElseThrow(() -> new RuntimeException("Goal not found: " + id));
    }

    public void deleteGoal(Long id) { goalRepository.deleteById(id); }

    public GoalDTO toDTO(Goal g) {
        GoalDTO dto = new GoalDTO();
        dto.setId(g.getId());
        dto.setEmployeeId(g.getEmployee().getId());
        dto.setEmployeeName(g.getEmployee().getFirstName() + " " + g.getEmployee().getLastName());
        dto.setDepartment(g.getEmployee().getDepartment() != null ? g.getEmployee().getDepartment().getName() : null);
        dto.setTitle(g.getTitle());
        dto.setDescription(g.getDescription());
        dto.setCategory(g.getCategory().name());
        dto.setProgress(g.getProgress());
        dto.setStatus(g.getStatus().name());
        dto.setTargetDate(g.getTargetDate());
        dto.setQuarter(g.getQuarter());
        dto.setCreatedAt(g.getCreatedAt());
        return dto;
    }
}

