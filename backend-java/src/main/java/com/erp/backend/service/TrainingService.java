package com.erp.backend.service;

import com.erp.backend.dto.TrainingDTO;
import com.erp.backend.entity.Employee;
import com.erp.backend.entity.Tenant;
import com.erp.backend.entity.Training;
import com.erp.backend.entity.Training.TrainingStatus;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.TenantRepository;
import com.erp.backend.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TrainingService {

    @Autowired private TrainingRepository trainingRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private TenantRepository tenantRepository;

    public List<TrainingDTO> getAllTrainings(Long tenantId) {
        return trainingRepository.findByTenantIdOrderByStartDateDesc(tenantId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<TrainingDTO> getById(Long id) {
        return trainingRepository.findById(id).map(this::toDTO);
    }

    public TrainingDTO createTraining(TrainingDTO dto) {
        Tenant tenant = tenantRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        Training t = new Training();
        t.setTenant(tenant);
        t.setTitle(dto.getTitle());
        t.setProvider(dto.getProvider());
        t.setDescription(dto.getDescription());
        t.setDurationDays(dto.getDurationDays());
        t.setStartDate(dto.getStartDate());
        t.setEndDate(dto.getEndDate());
        t.setCost(dto.getCost());
        t.setStatus(dto.getStatus() != null ? TrainingStatus.valueOf(dto.getStatus()) : TrainingStatus.UPCOMING);
        return toDTO(trainingRepository.save(t));
    }

    public TrainingDTO updateStatus(Long id, String status) {
        return trainingRepository.findById(id).map(t -> {
            t.setStatus(TrainingStatus.valueOf(status));
            return toDTO(trainingRepository.save(t));
        }).orElseThrow(() -> new RuntimeException("Training not found: " + id));
    }

    /** Enroll an employee in a training program */
    public TrainingDTO enrollEmployee(Long trainingId, Long employeeId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new RuntimeException("Training not found"));
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        training.getEnrolledEmployees().add(employee);
        return toDTO(trainingRepository.save(training));
    }

    public void deleteTraining(Long id) { trainingRepository.deleteById(id); }

    public TrainingDTO toDTO(Training t) {
        TrainingDTO dto = new TrainingDTO();
        dto.setId(t.getId());
        dto.setTenantId(t.getTenant() != null ? t.getTenant().getId() : null);
        dto.setTitle(t.getTitle());
        dto.setProvider(t.getProvider());
        dto.setDescription(t.getDescription());
        dto.setDurationDays(t.getDurationDays());
        dto.setStartDate(t.getStartDate());
        dto.setEndDate(t.getEndDate());
        dto.setCost(t.getCost());
        dto.setStatus(t.getStatus().name());
        dto.setEnrolledCount(t.getEnrolledEmployees().size());
        dto.setEnrolledEmployeeNames(t.getEnrolledEmployees().stream()
                .map(e -> e.getFirstName() + " " + e.getLastName())
                .collect(Collectors.toList()));
        dto.setCreatedAt(t.getCreatedAt());
        return dto;
    }
}

