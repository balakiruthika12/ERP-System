from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llm_service import llm_service
import uvicorn
from typing import List, Optional

app = FastAPI(
    title="Autonomous ERP AI Core",
    description="Python microservices for predictive analytics and LLM integrations.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ────────────────────────────────────────────────────────────────────

class HealthCheck(BaseModel):
    status: str
    message: str

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    response: str

class AnalyzeRequest(BaseModel):
    context: str
    query: str

class AnalyzeResponse(BaseModel):
    analysis: str

class PayrollEntry(BaseModel):
    name: str
    gross: float
    net: float
    tax: float

class PayrollAnomalyRequest(BaseModel):
    payroll_data: List[PayrollEntry]

class AttritionRequest(BaseModel):
    department: str
    avg_tenure_months: Optional[float] = 24
    turnover_rate: Optional[float] = 8.5
    salary_vs_market: Optional[float] = -5
    pending_leaves: Optional[int] = 3
    promotions_last_6m: Optional[int] = 1

# ─── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthCheck)
def health_check():
    return HealthCheck(status="OK", message="AI Core is running")


@app.post("/api/v1/ai/generate", response_model=GenerateResponse)
def generate_response(request: GenerateRequest):
    """Accepts a prompt and returns a generated LLM response."""
    result = llm_service.generate_response(request.prompt)
    return GenerateResponse(response=result)


@app.post("/api/v1/ai/analyze", response_model=AnalyzeResponse)
def analyze_data(request: AnalyzeRequest):
    """Accepts enterprise data context and a query, returns AI analysis."""
    result = llm_service.analyze_enterprise_data(request.context, request.query)
    return AnalyzeResponse(analysis=result)


@app.post("/api/v1/ai/predict/attrition")
def predict_attrition(request: AttritionRequest):
    """Phase 3: Predicts employee attrition risk for a department."""
    metrics = {
        "avg_tenure_months": request.avg_tenure_months,
        "turnover_rate": request.turnover_rate,
        "salary_vs_market": request.salary_vs_market,
        "pending_leaves": request.pending_leaves,
        "promotions_last_6m": request.promotions_last_6m,
    }
    return llm_service.predict_attrition(request.department, metrics)


@app.post("/api/v1/ai/predict/payroll-anomaly")
def detect_payroll_anomaly(request: PayrollAnomalyRequest):
    """Phase 3: Detects payroll anomalies and outliers using AI."""
    data = [e.model_dump() for e in request.payroll_data]
    return llm_service.detect_payroll_anomaly(data)


class SalaryBenchmarkRequest(BaseModel):
    job_title: str
    department: str


@app.post("/api/v1/ai/salary-benchmark")
def salary_benchmark(request: SalaryBenchmarkRequest):
    """Phase 5: Returns AI-powered salary benchmark range for a job title and department."""
    return llm_service.get_salary_benchmark(request.job_title, request.department)


class WorkforceForecastRequest(BaseModel):
    total_employees: int
    avg_tenure_months: Optional[float] = 30
    turnover_rate: Optional[float] = 8.0
    open_positions: Optional[int] = 2


@app.post("/api/v1/ai/workforce-forecast")
def workforce_forecast(request: WorkforceForecastRequest):
    """Phase 6: Forecasts headcount growth and turnover risk for the next 3 months."""
    return llm_service.get_workforce_forecast(
        request.total_employees,
        request.avg_tenure_months,
        request.turnover_rate,
        request.open_positions
    )


class SkillGapRequest(BaseModel):
    job_title: str
    department: str
    years_experience: Optional[float] = 3.0
    current_skills: Optional[List[str]] = []


@app.post("/api/v1/ai/skill-gap")
def skill_gap_analysis(request: SkillGapRequest):
    """Phase 7: Analyzes employee skill gaps and returns a personalized learning roadmap."""
    return llm_service.analyze_skill_gap(
        request.job_title,
        request.department,
        request.years_experience,
        request.current_skills
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
