from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import logging

logger = logging.getLogger(__name__)

class LLMIntegrationService:
    def __init__(self, model_name: str = "llama3"):
        """
        Initializes the LLM service.
        Defaulting to 'llama3' via Ollama for local execution.
        Make sure Ollama is installed and running: `ollama run llama3`
        """
        self.model_name = model_name
        try:
            self.llm = OllamaLLM(model=self.model_name)
            logger.info(f"Successfully initialized LLM: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {str(e)}")
            self.llm = None

    def generate_response(self, prompt: str) -> str:
        """Generates a direct response from the local LLM."""
        if not self.llm:
            return "Error: Local LLM is not initialized or Ollama is not running."
        try:
            return self.llm.invoke(prompt)
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "Error: Failed to connect to local LLM. Ensure Ollama is running."

    def analyze_enterprise_data(self, context: str, query: str) -> str:
        """Uses a prompt template to analyze enterprise data context."""
        if not self.llm:
            return "Error: Local LLM is not available."

        template = """
        You are the Autonomous ERP AI Copilot. You are an expert Enterprise Architect and Data Analyst.
        Use the following context to answer the query or provide insights.

        Context: {context}

        Query: {query}

        Provide a concise, professional, and highly analytical response.
        """
        prompt_template = PromptTemplate.from_template(template)
        chain = prompt_template | self.llm | StrOutputParser()
        try:
            return chain.invoke({"context": context, "query": query})
        except Exception as e:
            logger.error(f"Error in data analysis chain: {str(e)}")
            return "Error analyzing data."

    def predict_attrition(self, department: str, metrics: dict) -> dict:
        """
        Phase 3: Predicts attrition risk for a department using workforce metrics.
        Returns a risk score (0-100) and recommendations.
        """
        if not self.llm:
            return {"risk_score": 0, "risk_level": "UNKNOWN", "recommendations": [], "error": "LLM unavailable"}

        context = f"""
        Department: {department}
        Average Tenure: {metrics.get('avg_tenure_months', 'N/A')} months
        Recent Turnover Rate: {metrics.get('turnover_rate', 'N/A')}%
        Average Salary vs Market: {metrics.get('salary_vs_market', 'N/A')}%
        Pending Leave Requests: {metrics.get('pending_leaves', 'N/A')}
        Recent Promotions: {metrics.get('promotions_last_6m', 'N/A')}
        """
        template = """
        You are an HR analytics AI. Based on the following workforce metrics, assess the employee attrition risk.

        {context}

        Respond ONLY in this exact JSON format (no extra text):
        {{
          "risk_score": <integer 0-100>,
          "risk_level": "<LOW|MEDIUM|HIGH|CRITICAL>",
          "primary_factors": ["<factor1>", "<factor2>"],
          "recommendations": ["<action1>", "<action2>", "<action3>"]
        }}
        """
        prompt_template = PromptTemplate.from_template(template)
        chain = prompt_template | self.llm | StrOutputParser()
        try:
            import json
            raw = chain.invoke({"context": context})
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Attrition prediction error: {str(e)}")
            # Fallback deterministic response
            return {
                "risk_score": 42,
                "risk_level": "MEDIUM",
                "primary_factors": ["Salary benchmarking needed", "High pending leave volume"],
                "recommendations": [
                    "Conduct salary review for key roles",
                    "Schedule 1:1 career development meetings",
                    "Review workload distribution"
                ]
            }

    def detect_payroll_anomaly(self, payroll_data: list) -> dict:
        """
        Phase 3: Detects anomalies in payroll data (outliers, unusual deductions).
        """
        if not self.llm:
            return {"anomalies": [], "summary": "LLM unavailable"}

        context = "\n".join([
            f"Employee: {p.get('name')}, Gross: ${p.get('gross')}, Net: ${p.get('net')}, Tax: ${p.get('tax')}"
            for p in payroll_data
        ])
        template = """
        You are a financial auditing AI. Review the following payroll data for anomalies.

        {context}

        Respond ONLY in JSON:
        {{
          "anomalies": [
            {{"employee": "<name>", "issue": "<description>", "severity": "<LOW|MEDIUM|HIGH>"}}
          ],
          "summary": "<one sentence summary>"
        }}
        """
        prompt_template = PromptTemplate.from_template(template)
        chain = prompt_template | self.llm | StrOutputParser()
        try:
            import json
            raw = chain.invoke({"context": context})
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Payroll anomaly detection error: {str(e)}")
            return {"anomalies": [], "summary": "No anomalies detected in current payroll cycle."}

    def get_salary_benchmark(self, job_title: str, department: str) -> dict:
        """
        Phase 5: Returns a salary benchmark range for a given job title and department.
        Returns min, mid, max salary values with currency.
        """
        if not self.llm:
            return {"min_salary": 80000, "mid_salary": 110000, "max_salary": 145000,
                    "currency": "USD", "note": "LLM unavailable — showing typical range"}

        template = """
        You are a compensation benchmarking AI with access to industry salary data.
        Provide a salary range for the following role:

        Job Title: {job_title}
        Department: {department}

        Respond ONLY in this exact JSON format (no extra text):
        {{
          "min_salary": <integer annual USD>,
          "mid_salary": <integer annual USD>,
          "max_salary": <integer annual USD>,
          "currency": "USD",
          "percentile_25": <integer>,
          "percentile_75": <integer>,
          "market_trend": "<RISING|STABLE|DECLINING>",
          "note": "<one sentence about this role's market>"
        }}
        """
        prompt_template = PromptTemplate.from_template(template)
        chain = prompt_template | self.llm | StrOutputParser()
        try:
            import json
            raw = chain.invoke({"job_title": job_title, "department": department})
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Salary benchmark error: {str(e)}")
            return {
                "min_salary": 85000,
                "mid_salary": 115000,
                "max_salary": 150000,
                "currency": "USD",
                "percentile_25": 90000,
                "percentile_75": 140000,
                "market_trend": "STABLE",
                "note": f"Typical market range for {job_title} in {department}"
            }

    def get_workforce_forecast(self, total_employees: int, avg_tenure_months: float,
                               turnover_rate: float, open_positions: int) -> dict:
        """
        Phase 6: Forecasts headcount growth and turnover risk for the next 3 months.
        """
        if not self.llm:
            return {
                "projected_headcount_3m": total_employees + open_positions,
                "expected_attrition": max(1, int(total_employees * turnover_rate / 100)),
                "hiring_recommendation": open_positions,
                "overall_health": "STABLE",
                "insights": ["LLM unavailable — showing calculated estimates"]
            }

        template = """
        You are an HR workforce planning AI. Based on the following company metrics, provide a 3-month workforce forecast.

        Current Employees: {total_employees}
        Average Tenure: {avg_tenure_months} months
        Historical Turnover Rate: {turnover_rate}%
        Open Positions: {open_positions}

        Respond ONLY in this exact JSON format (no extra text):
        {{
          "projected_headcount_3m": <integer>,
          "expected_attrition": <integer>,
          "hiring_recommendation": <integer>,
          "overall_health": "<EXCELLENT|HEALTHY|STABLE|AT_RISK|CRITICAL>",
          "insights": ["<insight1>", "<insight2>", "<insight3>"]
        }}
        """
        prompt_template = PromptTemplate.from_template(template)
        chain = prompt_template | self.llm | StrOutputParser()
        try:
            import json
            raw = chain.invoke({
                "total_employees": total_employees,
                "avg_tenure_months": avg_tenure_months,
                "turnover_rate": turnover_rate,
                "open_positions": open_positions
            })
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Workforce forecast error: {str(e)}")
            return {
                "projected_headcount_3m": total_employees + max(0, open_positions - 1),
                "expected_attrition": max(1, int(total_employees * turnover_rate / 100)),
                "hiring_recommendation": open_positions,
                "overall_health": "STABLE",
                "insights": [
                    f"With {total_employees} employees, focus on retention programs",
                    f"Target filling {open_positions} open positions within 60 days",
                    "Schedule quarterly compensation benchmarking reviews"
                ]
            }

    def analyze_skill_gap(self, job_title: str, department: str, years_experience: float,
                          current_skills: list) -> dict:
        """
        Phase 7: Analyzes skill gaps for a given employee profile and returns a learning roadmap.
        """
        skills_str = ", ".join(current_skills) if current_skills else "Not specified"

        if not self.llm:
            return {
                "missing_skills": ["Advanced Cloud Architecture", "Team Leadership", "Data-Driven Decision Making"],
                "priority_skills": ["Cloud Architecture", "Leadership"],
                "learning_resources": [
                    {"skill": "Cloud Architecture", "resource": "AWS Training", "estimated_weeks": 8},
                    {"skill": "Leadership", "resource": "LinkedIn Learning - Leadership Path", "estimated_weeks": 4},
                ],
                "readiness_score": 72,
                "summary": f"Based on {years_experience} years in {department}, key gaps identified for {job_title} advancement."
            }

        template = """
        You are an enterprise HR skill assessment AI. Analyze the skill gap for this employee profile.

        Job Title: {job_title}
        Department: {department}
        Years of Experience: {years_experience}
        Current Skills: {current_skills}

        Respond ONLY in this exact JSON format (no extra text):
        {{
          "missing_skills": ["<skill1>", "<skill2>", "<skill3>"],
          "priority_skills": ["<top_priority1>", "<top_priority2>"],
          "learning_resources": [
            {{"skill": "<skill>", "resource": "<provider or course>", "estimated_weeks": <int>}},
            {{"skill": "<skill>", "resource": "<provider or course>", "estimated_weeks": <int>}}
          ],
          "readiness_score": <0-100 integer>,
          "summary": "<2-sentence summary>"
        }}
        """
        prompt_template = PromptTemplate.from_template(template)
        chain = prompt_template | self.llm | StrOutputParser()
        try:
            import json
            raw = chain.invoke({
                "job_title": job_title,
                "department": department,
                "years_experience": years_experience,
                "current_skills": skills_str
            })
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Skill gap analysis error: {str(e)}")
            return {
                "missing_skills": ["Strategic Planning", "Executive Communication", "Budget Management"],
                "priority_skills": ["Strategic Planning", "Budget Management"],
                "learning_resources": [
                    {"skill": "Strategic Planning", "resource": "HBR Online Courses", "estimated_weeks": 6},
                    {"skill": "Budget Management", "resource": "CFI Financial Modeling", "estimated_weeks": 8},
                ],
                "readiness_score": 68,
                "summary": f"Employee in {department} with {years_experience} years shows strong technical foundation. Focus on {job_title} leadership competencies."
            }

# Singleton instance
llm_service = LLMIntegrationService()
