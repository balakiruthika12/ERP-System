package com.erp.backend.service;

import com.erp.backend.dto.PerformanceReviewDTO;
import com.erp.backend.entity.Employee;
import com.erp.backend.entity.PerformanceReview;
import com.erp.backend.entity.PerformanceReview.PerformanceRating;
import com.erp.backend.entity.Tenant;
import com.erp.backend.repository.EmployeeRepository;
import com.erp.backend.repository.PerformanceReviewRepository;
import com.erp.backend.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PerformanceReviewService {

    @Autowired private PerformanceReviewRepository reviewRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private TenantRepository tenantRepository;

    public List<PerformanceReviewDTO> getAllReviews(Long tenantId) {
        return reviewRepository.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PerformanceReviewDTO> getReviewsByEmployee(Long employeeId) {
        return reviewRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<PerformanceReviewDTO> getLatestReview(Long employeeId) {
        return reviewRepository.findTopByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .map(this::toDTO);
    }

    public PerformanceReviewDTO createReview(PerformanceReviewDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found: " + dto.getEmployeeId()));
        Tenant tenant = tenantRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        PerformanceReview review = new PerformanceReview();
        review.setEmployee(employee);
        review.setTenant(tenant);
        review.setReviewPeriod(dto.getReviewPeriod());
        review.setReviewDate(dto.getReviewDate());
        review.setScore(dto.getScore());
        review.setRating(PerformanceRating.valueOf(dto.getRating()));
        review.setGoals(dto.getGoals());
        review.setComments(dto.getComments());
        review.setReviewedBy(dto.getReviewedBy());

        return toDTO(reviewRepository.save(review));
    }

    public PerformanceReviewDTO updateReview(Long id, PerformanceReviewDTO dto) {
        return reviewRepository.findById(id).map(review -> {
            review.setReviewPeriod(dto.getReviewPeriod());
            review.setReviewDate(dto.getReviewDate());
            review.setScore(dto.getScore());
            review.setRating(PerformanceRating.valueOf(dto.getRating()));
            review.setGoals(dto.getGoals());
            review.setComments(dto.getComments());
            review.setReviewedBy(dto.getReviewedBy());
            return toDTO(reviewRepository.save(review));
        }).orElseThrow(() -> new RuntimeException("Review not found: " + id));
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    public PerformanceReviewDTO toDTO(PerformanceReview r) {
        PerformanceReviewDTO dto = new PerformanceReviewDTO();
        dto.setId(r.getId());
        dto.setEmployeeId(r.getEmployee().getId());
        dto.setEmployeeName(r.getEmployee().getFirstName() + " " + r.getEmployee().getLastName());
        dto.setJobTitle(r.getEmployee().getJobTitle());
        dto.setDepartment(r.getEmployee().getDepartment() != null ? r.getEmployee().getDepartment().getName() : null);
        dto.setReviewPeriod(r.getReviewPeriod());
        dto.setReviewDate(r.getReviewDate());
        dto.setScore(r.getScore());
        dto.setRating(r.getRating().name());
        dto.setGoals(r.getGoals());
        dto.setComments(r.getComments());
        dto.setReviewedBy(r.getReviewedBy());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
