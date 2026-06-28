package com.erp.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Transactional
public class AiServiceClient {

    @Value("${ai.core.url:http://localhost:8000}")
    private String aiCoreUrl;

    private final RestTemplate restTemplate;

    public AiServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    public String checkAiHealth() {
        try {
            return restTemplate.getForObject(aiCoreUrl + "/health", String.class);
        } catch (Exception e) {
            return "{\"status\":\"ERROR\",\"message\":\"AI Core is unreachable\"}";
        }
    }

    public String generateResponse(String prompt) {
        try {
            return restTemplate.postForObject(
                aiCoreUrl + "/api/v1/ai/generate",
                Map.of("prompt", prompt),
                String.class
            );
        } catch (Exception e) {
            return "{\"response\":\"AI service is currently unavailable.\"}";
        }
    }

    public String analyzeData(String context, String query) {
        try {
            return restTemplate.postForObject(
                aiCoreUrl + "/api/v1/ai/analyze",
                Map.of("context", context, "query", query),
                String.class
            );
        } catch (Exception e) {
            return "{\"analysis\":\"AI analysis unavailable.\"}";
        }
    }

    /**
     * Phase 4: Calls the Python AI service attrition prediction endpoint.
     * Returns a JSON string with risk_score, risk_level, primary_factors, recommendations.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getAttritionPrediction(String department, Map<String, Object> metrics) {
        try {
            var request = new java.util.LinkedHashMap<String, Object>();
            request.put("department", department);
            request.putAll(metrics);
            return restTemplate.postForObject(
                aiCoreUrl + "/api/v1/ai/predict/attrition",
                request,
                Map.class
            );
        } catch (Exception e) {
            return Map.of(
                "risk_score", 0,
                "risk_level", "UNKNOWN",
                "primary_factors", java.util.List.of("AI service unavailable"),
                "recommendations", java.util.List.of("Ensure AI Core is running at " + aiCoreUrl)
            );
        }
    }

    /**
     * Phase 5: Calls the Python AI service salary benchmark endpoint.
     * Returns min, mid, max salary range for a given job title and department.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getSalaryBenchmark(String jobTitle, String department) {
        try {
            return restTemplate.postForObject(
                aiCoreUrl + "/api/v1/ai/salary-benchmark",
                Map.of("job_title", jobTitle, "department", department),
                Map.class
            );
        } catch (Exception e) {
            return Map.of(
                "min_salary", 0,
                "mid_salary", 0,
                "max_salary", 0,
                "currency", "USD",
                "note", "AI service unavailable. Ensure AI Core is running at " + aiCoreUrl
            );
        }
    }
}

