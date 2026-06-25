/**
 * api.ts — Central API client for the ERP frontend.
 * Automatically attaches JWT token from localStorage to every request.
 */

const API_BASE = 'http://localhost:8080/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('erp_token');
}

function buildHeaders(extra?: Record<string, string>): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    // Token missing or expired — clear and force re-login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_email');
      document.cookie = 'erp_auth=; path=/; max-age=0';
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }
  if (res.status === 403) {
    // Logged in but insufficient permissions — do NOT log out
    throw new Error('HTTP 403 — Access denied for this resource.');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  email: string;
  message: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<AuthResponse>(res);
  localStorage.setItem('erp_token', data.token);
  localStorage.setItem('erp_email', data.email);
  return data;
}

export function logout() {
  localStorage.removeItem('erp_token');
  localStorage.removeItem('erp_email');
  document.cookie = 'erp_auth=; path=/; max-age=0';
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalEmployees: number;
  totalDepartments: number;
  totalRevenue: number;
  operatingCosts: number;
  businessHealthScore: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE}/dashboard/metrics`, { headers: buildHeaders() });
  return handleResponse<DashboardMetrics>(res);
}

// ─── Employees ─────────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  jobTitle: string;
  email?: string;
  salary: number;
  isActive: boolean;
  hireDate: string;
  // Gap 2 fix: EmployeeDTO uses flat fields (no nested lazy-load object)
  departmentId?: number;
  departmentName?: string;
  tenantId?: number;
  // Keep backward-compat alias used by HR page and employees directory
  department?: { id: number; name: string };
}

export interface EmployeeProfile {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  jobTitle: string;
  email: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
  department: string;
  departmentId: number;
  totalLeavesTaken: number;
  pendingLeaveRequests: number;
  lastNetSalary: number;
  lastPayrollStatus: string;
  recentPayrolls: PayrollRecord[];
  recentLeaves: LeaveRequest[];
}

export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API_BASE}/employees`, { headers: buildHeaders() });
  return handleResponse<Employee[]>(res);
}

export async function getEmployeeProfile(id: number): Promise<EmployeeProfile> {
  const res = await fetch(`${API_BASE}/employees/${id}/profile`, { headers: buildHeaders() });
  return handleResponse<EmployeeProfile>(res);
}

// ─── Departments ───────────────────────────────────────────────────────────────

export interface Department {
  id: number;
  name: string;
  description: string;
}

export async function getDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE}/departments`, { headers: buildHeaders() });
  return handleResponse<Department[]>(res);
}

// ─── Payroll ───────────────────────────────────────────────────────────────────

export interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  jobTitle: string;
  department: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossSalary: number;
  taxDeduction: number;
  otherDeductions: number;
  netSalary: number;
  status: 'PENDING' | 'PROCESSED' | 'PAID';
  processedAt: string;
}

export async function getAllPayrolls(): Promise<PayrollRecord[]> {
  const res = await fetch(`${API_BASE}/payroll`, { headers: buildHeaders() });
  return handleResponse<PayrollRecord[]>(res);
}

export async function getEmployeePayrolls(employeeId: number): Promise<PayrollRecord[]> {
  const res = await fetch(`${API_BASE}/payroll/employee/${employeeId}`, { headers: buildHeaders() });
  return handleResponse<PayrollRecord[]>(res);
}

export async function markPayrollPaid(id: number): Promise<PayrollRecord> {
  const res = await fetch(`${API_BASE}/payroll/${id}/pay`, {
    method: 'PUT',
    headers: buildHeaders(),
  });
  return handleResponse<PayrollRecord>(res);
}

// ─── Leave Requests ────────────────────────────────────────────────────────────

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  managerNotes: string;
  createdAt: string;
}

export async function getAllLeaveRequests(): Promise<LeaveRequest[]> {
  const res = await fetch(`${API_BASE}/leave`, { headers: buildHeaders() });
  return handleResponse<LeaveRequest[]>(res);
}

export async function approveLeave(id: number, notes?: string): Promise<LeaveRequest> {
  const res = await fetch(`${API_BASE}/leave/${id}/approve`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ notes: notes || '' }),
  });
  return handleResponse<LeaveRequest>(res);
}

export async function rejectLeave(id: number, notes?: string): Promise<LeaveRequest> {
  const res = await fetch(`${API_BASE}/leave/${id}/reject`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ notes: notes || '' }),
  });
  return handleResponse<LeaveRequest>(res);
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/notifications`, { headers: buildHeaders() });
  return handleResponse<NotificationItem[]>(res);
}

export async function getUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/notifications/unread/count`, { headers: buildHeaders() });
  const data = await handleResponse<{ count: number }>(res);
  return data.count;
}

export async function markNotificationRead(id: number): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: buildHeaders(),
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    headers: buildHeaders(),
  });
}

// ─── Departments (Phase 4 — with employeeCount) ────────────────────────────────

export interface DepartmentWithCount {
  id: number;
  name: string;
  description: string;
  tenantId: number;
  employeeCount: number;
}

export async function getDepartmentsWithCount(): Promise<DepartmentWithCount[]> {
  const res = await fetch(`${API_BASE}/departments`, { headers: buildHeaders() });
  return handleResponse<DepartmentWithCount[]>(res);
}

export async function createDepartment(data: { name: string; description: string }): Promise<DepartmentWithCount> {
  const res = await fetch(`${API_BASE}/departments`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<DepartmentWithCount>(res);
}

export async function updateDepartment(id: number, data: { name: string; description: string }): Promise<DepartmentWithCount> {
  const res = await fetch(`${API_BASE}/departments/${id}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<DepartmentWithCount>(res);
}

export async function deleteDepartment(id: number): Promise<void> {
  await fetch(`${API_BASE}/departments/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
}

// ─── Audit Logs ────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string;
  performedBy: string;
  createdAt: string;
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/audit`, { headers: buildHeaders() });
  return handleResponse<AuditLogEntry[]>(res);
}

export async function getAuditLogsByEntityType(entityType: string): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/audit/entity/${entityType}`, { headers: buildHeaders() });
  return handleResponse<AuditLogEntry[]>(res);
}

// ─── Reports ───────────────────────────────────────────────────────────────────

export interface CombinedReport {
  payroll: {
    totalGross: number;
    totalNet: number;
    totalTax: number;
    averageNetSalary: number;
    totalRecords: number;
    paidCount: number;
    processedCount: number;
    pendingCount: number;
  };
  headcount: { department: string; employeeCount: number }[];
  leaves: {
    totalRequests: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
  generatedAt: string;
}

export async function getCombinedReport(): Promise<CombinedReport> {
  const res = await fetch(`${API_BASE}/reports`, { headers: buildHeaders() });
  return handleResponse<CombinedReport>(res);
}

// ─── User Management (Admin) ───────────────────────────────────────────────────

export interface ManagedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export async function getAllUsers(): Promise<ManagedUser[]> {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: buildHeaders() });
  return handleResponse<ManagedUser[]>(res);
}

export async function toggleUserActive(id: number): Promise<{ isActive: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/users/${id}/toggle-active`, {
    method: 'PUT',
    headers: buildHeaders(),
  });
  return handleResponse<{ isActive: boolean; message: string }>(res);
}

export async function getUserStats(): Promise<{ total: number; active: number; inactive: number }> {
  const res = await fetch(`${API_BASE}/admin/users/stats`, { headers: buildHeaders() });
  return handleResponse<{ total: number; active: number; inactive: number }>(res);
}

// ─── Performance Reviews (Phase 5) ────────────────────────────────────────────

export interface PerformanceReview {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  jobTitle: string;
  reviewPeriod: string;
  reviewDate: string;
  score: number;
  rating: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY';
  goals: string;
  comments: string;
  reviewedBy: string;
  createdAt: string;
}

export async function getPerformanceReviews(): Promise<PerformanceReview[]> {
  const res = await fetch(`${API_BASE}/performance`, { headers: buildHeaders() });
  return handleResponse<PerformanceReview[]>(res);
}

export async function getEmployeePerformanceReviews(employeeId: number): Promise<PerformanceReview[]> {
  const res = await fetch(`${API_BASE}/performance/employee/${employeeId}`, { headers: buildHeaders() });
  return handleResponse<PerformanceReview[]>(res);
}

export async function createPerformanceReview(data: Partial<PerformanceReview>): Promise<PerformanceReview> {
  const res = await fetch(`${API_BASE}/performance`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<PerformanceReview>(res);
}

// ─── Global Search (Phase 5) ───────────────────────────────────────────────────

export interface SearchResult {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  url: string;
}

export interface SearchResponse {
  employees: SearchResult[];
  departments: SearchResult[];
  leaves: SearchResult[];
  total: number;
  query: string;
}

export async function globalSearch(q: string): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, { headers: buildHeaders() });
  return handleResponse<SearchResponse>(res);
}

// ─── CSV Export (Phase 5) ──────────────────────────────────────────────────────

export async function downloadPayrollCsv(): Promise<void> {
  const res = await fetch(`${API_BASE}/export/payroll`, { headers: buildHeaders() });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'payroll_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadEmployeesCsv(): Promise<void> {
  const res = await fetch(`${API_BASE}/export/employees`, { headers: buildHeaders() });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'employees_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── AI Salary Benchmark (Phase 5) ────────────────────────────────────────────

export interface SalaryBenchmark {
  min_salary: number;
  mid_salary: number;
  max_salary: number;
  currency: string;
  percentile_25?: number;
  percentile_75?: number;
  market_trend?: 'RISING' | 'STABLE' | 'DECLINING';
  note?: string;
}

export async function getSalaryBenchmark(jobTitle: string, department: string): Promise<SalaryBenchmark> {
  // Call Java backend which proxies to Python AI
  const res = await fetch('http://localhost:8000/api/v1/ai/salary-benchmark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_title: jobTitle, department }),
  });
  return handleResponse<SalaryBenchmark>(res);
}

// ─── Department Budget Report (Phase 5) ───────────────────────────────────────

export async function getDepartmentBudgetReport(): Promise<DepartmentWithCount[]> {
  const res = await fetch(`${API_BASE}/departments/budget-report`, { headers: buildHeaders() });
  return handleResponse<DepartmentWithCount[]>(res);
}

// ─── Expense Management (Phase 6) ─────────────────────────────────────────────

export interface Expense {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  category: string;
  amount: number;
  description: string;
  expenseDate: string;
  receiptNote: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
  managerNotes: string;
  reviewedBy: string;
  submittedAt: string;
  reviewedAt: string;
}

export async function getExpenses(): Promise<Expense[]> {
  const res = await fetch(`${API_BASE}/expenses`, { headers: buildHeaders() });
  return handleResponse<Expense[]>(res);
}

export async function getExpenseSummary(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/expenses/summary`, { headers: buildHeaders() });
  return handleResponse<Record<string, unknown>>(res);
}

export async function createExpense(data: Partial<Expense>): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Expense>(res);
}

export async function approveExpense(id: number, notes?: string): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses/${id}/approve`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ notes: notes || '' }),
  });
  return handleResponse<Expense>(res);
}

export async function rejectExpense(id: number, notes?: string): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses/${id}/reject`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ notes: notes || '' }),
  });
  return handleResponse<Expense>(res);
}

// ─── Training & Development (Phase 6) ─────────────────────────────────────────

export interface Training {
  id: number;
  title: string;
  provider: string;
  description: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  cost: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  enrolledCount: number;
  enrolledEmployeeNames: string[];
  createdAt: string;
}

export async function getTrainings(): Promise<Training[]> {
  const res = await fetch(`${API_BASE}/training`, { headers: buildHeaders() });
  return handleResponse<Training[]>(res);
}

export async function createTraining(data: Partial<Training>): Promise<Training> {
  const res = await fetch(`${API_BASE}/training`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Training>(res);
}

export async function enrollInTraining(trainingId: number, employeeId: number): Promise<Training> {
  const res = await fetch(`${API_BASE}/training/${trainingId}/enroll/${employeeId}`, {
    method: 'POST',
    headers: buildHeaders(),
  });
  return handleResponse<Training>(res);
}

// ─── Announcements (Phase 6) ──────────────────────────────────────────────────

export interface Announcement {
  id: number;
  title: string;
  body: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  authorName: string;
  isPinned: boolean;
  publishedAt: string;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE}/announcements`, { headers: buildHeaders() });
  return handleResponse<Announcement[]>(res);
}

export async function createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Announcement>(res);
}

export async function toggleAnnouncementPin(id: number): Promise<Announcement> {
  const res = await fetch(`${API_BASE}/announcements/${id}/pin`, {
    method: 'PUT',
    headers: buildHeaders(),
  });
  return handleResponse<Announcement>(res);
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await fetch(`${API_BASE}/announcements/${id}`, { method: 'DELETE', headers: buildHeaders() });
}

// ─── Dashboard Payroll Trend (Phase 6) ────────────────────────────────────────

export interface PayrollTrendPoint {
  month: string;
  total: number;
}

export async function getPayrollTrend(): Promise<PayrollTrendPoint[]> {
  const res = await fetch(`${API_BASE}/dashboard/payroll-trend`, { headers: buildHeaders() });
  return handleResponse<PayrollTrendPoint[]>(res);
}

// ─── AI Workforce Forecast (Phase 6) ──────────────────────────────────────────

export interface WorkforceForecast {
  projected_headcount_3m: number;
  expected_attrition: number;
  hiring_recommendation: number;
  overall_health: 'EXCELLENT' | 'HEALTHY' | 'STABLE' | 'AT_RISK' | 'CRITICAL';
  insights: string[];
}

export async function getWorkforceForecast(
  totalEmployees: number,
  avgTenureMonths?: number,
  turnoverRate?: number,
  openPositions?: number
): Promise<WorkforceForecast> {
  const res = await fetch('http://localhost:8000/api/v1/ai/workforce-forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      total_employees: totalEmployees,
      avg_tenure_months: avgTenureMonths ?? 30,
      turnover_rate: turnoverRate ?? 8,
      open_positions: openPositions ?? 2,
    }),
  });
  return handleResponse<WorkforceForecast>(res);
}
