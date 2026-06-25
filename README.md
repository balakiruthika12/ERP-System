# 🏢 Enterprise ERP System

A full-stack, AI-powered Enterprise Resource Planning (ERP) system built with **Spring Boot**, **Next.js**, and **FastAPI**. Features 23 frontend routes, 89 Java source files, 16 database entities, and 6 AI-powered endpoints.

---

## 🎯 Features at a Glance

| Module | Features |
|---|---|
| 👥 **Employee Management** | CRUD, profiles, department assignment, job history |
| 💰 **Payroll** | Gross/net salary, deductions, pay period tracking |
| 🗓️ **Leave & Attendance** | Leave requests, approval workflow, balance tracking |
| ⭐ **Performance Reviews** | Ratings (Excellent → Unsatisfactory), quarterly reviews |
| 🎯 **Goals & OKR** | Objective tracking with circular progress rings |
| 💸 **Expense Management** | Submit → Approve → Reject → Reimburse workflow |
| 🎓 **Training & Development** | Program catalog, employee enrollment, cost tracking |
| 📁 **Project Management** | Projects, tasks, assignees, progress bars |
| 🏢 **Org Chart** | Interactive visual company hierarchy (chart + list view) |
| 📢 **Announcements** | Priority bulletin board with pinning |
| 📊 **Finance & Accounting** | Revenue, costs, budget tracking |
| 📈 **Reports** | CSV export for payroll, employees, and performance |
| ✦ **AI Copilot** | Chat, attrition risk, salary benchmark, skill gap, workforce forecast |
| 📋 **Audit Log** | Full system event trail |
| ⚙️ **Settings** | Admin panel, user management |

---

## 🏗️ Architecture

```
ERP System/
├── backend-java/          # Spring Boot 3 + Java 21 + JPA (H2 / PostgreSQL)
├── backend-ai-python/     # FastAPI + LangChain + Gemini AI
└── frontend-nextjs/       # Next.js 16 + TypeScript + Tailwind CSS
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.2 (Turbopack), TypeScript, Tailwind CSS |
| Backend | Spring Boot 3.4, Java 21, Spring Security (JWT), JPA/Hibernate |
| Database | H2 (in-memory, zero-setup) · PostgreSQL (production) |
| AI Service | FastAPI, LangChain, Google Gemini, Uvicorn |
| Auth | JWT Bearer tokens, Role-Based Access Control (RBAC) |

---

## 🚀 How to Start the Servers

> **Start Order:** Java Backend → Python AI → Next.js Frontend

### Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 21+ |
| Node.js | 18+ |
| Python | 3.10+ |
| npm | 9+ |

---

### 1️⃣ Java Backend (Spring Boot)

```powershell
cd "backend-java"
.\mvnw.cmd spring-boot:run          # Windows
# ./mvnw spring-boot:run            # macOS / Linux
```

**Output you should see:**
```
Started BackendJavaApplication in ~25 seconds
✅ DataInitializer: Phase 7 seed data loaded (Projects, Goals).
   Login: admin@erp.com / Admin123!
Tomcat started on port 8080
```

| URL | Description |
|---|---|
| http://localhost:8080 | REST API base |
| http://localhost:8080/h2-console | H2 in-memory DB browser |

> **H2 Console Settings:**  
> JDBC URL: `jdbc:h2:mem:erp_db` · Username: `sa` · Password: *(leave blank)*

---

### 2️⃣ Python AI Service (FastAPI)

```powershell
cd "backend-ai-python"

# First time only — install dependencies:
pip install fastapi uvicorn langchain langchain-community langchain-google-genai python-dotenv pydantic

# Start the server:
python main.py
```

**Output you should see:**
```
INFO: Uvicorn running on http://0.0.0.0:8000
INFO: Started reloader process using StatReload
```

| URL | Description |
|---|---|
| http://localhost:8000 | AI API base |
| http://localhost:8000/docs | Interactive Swagger UI |

> **Optional AI (Gemini):** Create a `.env` file in `backend-ai-python/` with:
> ```
> GOOGLE_API_KEY=your_gemini_api_key_here
> ```
> Without it, the AI endpoints return smart deterministic fallback responses.

---

### 3️⃣ Next.js Frontend

```powershell
cd "frontend-nextjs"
npm install       # first time only
npm run dev
```

**Output you should see:**
```
▲ Next.js 16.2.9 (Turbopack)
→ Local:   http://localhost:3000
✓ Ready in 2.9s
```

Open **http://localhost:3000** in your browser.

---

## 🔑 Default Login

```
Email:    admin@erp.com
Password: Admin123!
Role:     ADMIN + HR_MANAGER (full access)
```

---

## 🌐 All Application URLs

| Service | URL |
|---|---|
| **Frontend App** | http://localhost:3000 |
| **Java REST API** | http://localhost:8080 |
| **H2 Database Console** | http://localhost:8080/h2-console |
| **Python AI Service** | http://localhost:8000 |
| **AI Swagger Docs** | http://localhost:8000/docs |

---

## 📂 All 23 Frontend Routes

```
/                           → Landing / Login redirect
/login                      → Authentication
/dashboard                  → Executive Overview (Charts, Projects, Activity Feed)
/dashboard/employees        → Employee Directory
/dashboard/employees/[id]   → Employee Profile (Dynamic)
/dashboard/hr               → HRMS
/dashboard/payroll          → Payroll Management
/dashboard/leave            → Leave & Attendance
/dashboard/departments      → Department Management
/dashboard/performance      → Performance Reviews
/dashboard/goals            → Goals & OKR Tracking
/dashboard/expenses         → Expense Management
/dashboard/training         → Training & Development
/dashboard/projects         → Project Management
/dashboard/orgchart         → Organization Chart
/dashboard/announcements    → Company Announcements
/dashboard/finance          → Finance & Accounting
/dashboard/reports          → Reports + CSV Export
/dashboard/ai               → AI Copilot
/dashboard/audit            → Audit Log
/dashboard/settings         → Settings & Admin
```

---

## 🤖 AI Endpoints (Python FastAPI)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/ai/health` | Health check |
| POST | `/api/v1/ai/chat` | General HR AI chat assistant |
| POST | `/api/v1/ai/attrition-risk` | Employee attrition risk score (0–100) |
| POST | `/api/v1/ai/salary-benchmark` | Market salary benchmark for a job title |
| POST | `/api/v1/ai/workforce-forecast` | 3-month headcount + turnover forecast |
| POST | `/api/v1/ai/skill-gap` | Skill gap analysis + learning roadmap |

---

## 🗄️ Database Entities (16 Total)

```
Tenant, User, Role, Employee, Department, Payroll, LeaveRequest,
Notification, AuditLog, PerformanceReview, Expense, Training,
Announcement, Project, ProjectTask, Goal
```

---

## 📊 Project Statistics

| Item | Count |
|---|---|
| Java Source Files | **89** |
| Frontend Routes | **23** |
| REST API Endpoints | **70+** |
| Database Entities | **16** |
| Python AI Endpoints | **6** |
| Implementation Phases | **7** |

---

## 🔒 Role-Based Access Control

| Role | Access |
|---|---|
| `ADMIN` | Full access to all modules |
| `HR_MANAGER` | HR, Payroll, Leave, Performance, Goals, Expenses, Announcements |
| `EMPLOYEE` | View own profile, submit leave/expenses, view announcements |

---

## 🏭 Production Setup (PostgreSQL)

To switch from H2 to PostgreSQL for production:

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE erp_db;
   CREATE USER erp_user WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE erp_db TO erp_user;
   ```

2. Update `backend-java/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/erp_db
   spring.datasource.username=erp_user
   spring.datasource.password=yourpassword
   spring.datasource.driver-class-name=org.postgresql.Driver
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
   spring.jpa.hibernate.ddl-auto=update
   ```

3. In `pom.xml`, uncomment the PostgreSQL driver and comment out H2:
   ```xml
   <dependency>
       <groupId>org.postgresql</groupId>
       <artifactId>postgresql</artifactId>
       <scope>runtime</scope>
   </dependency>
   ```

---

## 📋 Phase-by-Phase Development

| Phase | What Was Built |
|---|---|
| **Phase 1–2** | Foundation: Auth (JWT), RBAC, Employee CRUD, Departments, Payroll |
| **Phase 3** | Leave Management, Notifications, Real-time Audit Logging |
| **Phase 4** | Finance, Reports, Settings, Admin panel |
| **Phase 5** | Performance Reviews, Global Search, CSV Export, AI Salary Benchmark |
| **Phase 6** | Expenses, Training, Announcements, SVG Payroll Chart, AI Workforce Forecast |
| **Phase 7** | Projects + Tasks, Goals/OKR, Org Chart, Activity Feed, AI Skill Gap |

---

## 📸 UI Highlights

- 🌙 **Dark glass-morphism** design with gradient accents
- 📊 **SVG Payroll Sparkline** chart with animated gradient fill
- 🎯 **Circular SVG progress rings** for Goals/OKR
- 🏢 **Interactive Org Chart** with department color-coding
- 📁 **Kanban-style** project board with live task progress bars
- ✦ **AI Copilot** with real-time streaming responses
- 🔔 **Real-time notification bell** with unread badge
- 🔍 **Global search** across employees, departments, and leave requests

---

## 👤 Author

Built with ❤️ using Spring Boot, Next.js, and FastAPI.
