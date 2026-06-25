package com.erp.backend;

import com.erp.backend.entity.*;
import com.erp.backend.entity.Payroll.PayrollStatus;
import com.erp.backend.entity.LeaveRequest.LeaveType;
import com.erp.backend.entity.LeaveRequest.LeaveStatus;
import com.erp.backend.entity.Notification.NotificationType;
import com.erp.backend.entity.AuditLog.AuditAction;
import com.erp.backend.entity.PerformanceReview.PerformanceRating;
import com.erp.backend.entity.Expense.ExpenseCategory;
import com.erp.backend.entity.Expense.ExpenseStatus;
import com.erp.backend.entity.Training.TrainingStatus;
import com.erp.backend.entity.Announcement.AnnouncementPriority;
import com.erp.backend.entity.Project.ProjectStatus;
import com.erp.backend.entity.ProjectTask.TaskStatus;
import com.erp.backend.entity.ProjectTask.TaskPriority;
import com.erp.backend.entity.Goal.GoalCategory;
import com.erp.backend.entity.Goal.GoalStatus;
import com.erp.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DataInitializer seeds the database on startup if it is empty.
 * Phase 4: Seeds RBAC roles (ADMIN, HR_MANAGER, EMPLOYEE) and assigns them to admin user.
 * Default credentials: admin@erp.com / Admin123!
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private TenantRepository tenantRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private PayrollRepository payrollRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PerformanceReviewRepository performanceReviewRepository;
    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private TrainingRepository trainingRepository;
    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectTaskRepository projectTaskRepository;
    @Autowired private GoalRepository goalRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // 1. Tenant
        Tenant tenant = new Tenant();
        tenant.setName("Enterprise Corp");
        tenant = tenantRepository.save(tenant);

        // 2. Phase 4: Seed RBAC Roles
        Role adminRole  = seedRole("ADMIN");
        Role hrRole     = seedRole("HR_MANAGER");
        Role empRole    = seedRole("EMPLOYEE");

        // 3. Departments (with Phase 5 monthly budgets)
        Department engineering = dept("Engineering",     "Software and infrastructure team",        new BigDecimal("50000"), tenant);
        Department hr          = dept("Human Resources",  "People operations and talent management", new BigDecimal("25000"), tenant);
        Department finance     = dept("Finance",          "Financial planning and accounting",       new BigDecimal("30000"), tenant);
        Department product     = dept("Product",          "Product management and strategy",         new BigDecimal("35000"), tenant);
        Department design      = dept("Design",           "UX and visual design team",               new BigDecimal("20000"), tenant);

        // 4. Admin user — assigned ADMIN + HR_MANAGER roles
        User adminUser = new User();
        adminUser.setTenant(tenant);
        adminUser.setEmail("admin@erp.com");
        adminUser.setPassword(passwordEncoder.encode("Admin123!"));
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
        adminUser.setActive(true);
        adminUser.getRoles().add(adminRole);
        adminUser.getRoles().add(hrRole);
        adminUser = userRepository.save(adminUser);

        // 5. Employees
        Employee alice  = emp("Alice",  "Chen",     "VP of Engineering",     new BigDecimal("145000"), LocalDate.of(2020, 3, 1),  engineering, tenant);
        Employee marcus = emp("Marcus", "Johnson",  "Senior Product Manager", new BigDecimal("125000"), LocalDate.of(2021, 6, 15), product,     tenant);
        Employee sarah  = emp("Sarah",  "Williams", "HR Director",            new BigDecimal("115000"), LocalDate.of(2019, 8, 20), hr,          tenant);
        Employee david  = emp("David",  "Kim",      "Financial Controller",   new BigDecimal("130000"), LocalDate.of(2022, 1, 10), finance,     tenant);
        Employee emma   = emp("Emma",   "Watson",   "Lead Designer",          new BigDecimal("110000"), LocalDate.of(2021, 9, 5),  design,      tenant);

        // 6. Payroll records (monthly, last 3 months)
        for (Employee e : new Employee[]{alice, marcus, sarah, david, emma}) {
            for (int m = 2; m >= 0; m--) {
                LocalDate start   = LocalDate.now().minusMonths(m).withDayOfMonth(1);
                LocalDate end     = start.withDayOfMonth(start.lengthOfMonth());
                BigDecimal monthly = e.getSalary().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
                BigDecimal tax     = monthly.multiply(BigDecimal.valueOf(0.25)).setScale(2, RoundingMode.HALF_UP);
                BigDecimal net     = monthly.subtract(tax);

                Payroll p = new Payroll();
                p.setEmployee(e); p.setTenant(tenant);
                p.setPayPeriodStart(start); p.setPayPeriodEnd(end);
                p.setGrossSalary(monthly); p.setTaxDeduction(tax);
                p.setOtherDeductions(BigDecimal.ZERO); p.setNetSalary(net);
                p.setStatus(m == 0 ? PayrollStatus.PROCESSED : PayrollStatus.PAID);
                p.setProcessedAt(LocalDateTime.now().minusMonths(m).minusDays(2));
                payrollRepository.save(p);
            }
        }

        // 7. Leave requests
        leaveReq(alice,  LeaveType.ANNUAL,        LocalDate.now().minusDays(10), LocalDate.now().minusDays(7), LeaveStatus.APPROVED, tenant);
        leaveReq(marcus, LeaveType.SICK,           LocalDate.now().minusDays(3),  LocalDate.now().minusDays(2), LeaveStatus.APPROVED, tenant);
        leaveReq(sarah,  LeaveType.WORK_FROM_HOME, LocalDate.now().plusDays(3),   LocalDate.now().plusDays(5),  LeaveStatus.PENDING,  tenant);
        leaveReq(david,  LeaveType.ANNUAL,         LocalDate.now().plusDays(14),  LocalDate.now().plusDays(21), LeaveStatus.PENDING,  tenant);
        leaveReq(emma,   LeaveType.SICK,           LocalDate.now().minusDays(1),  LocalDate.now(),              LeaveStatus.APPROVED, tenant);

        // 8. Notifications
        notif(tenant, NotificationType.PAYROLL_PAID,   "Payroll Processed",     "May 2026 payroll has been paid to all employees.");
        notif(tenant, NotificationType.LEAVE_APPROVED, "Leave Approved",        "Alice Chen's annual leave (Jun 5–8) has been approved.");
        notif(tenant, NotificationType.AI_INSIGHT,     "AI Attrition Alert",   "Engineering dept shows 12% higher turnover risk this quarter.");
        notif(tenant, NotificationType.HR_ACTION,      "New Leave Request",     "David Kim submitted an annual leave request (Jun 29 – Jul 6).");
        notif(tenant, NotificationType.SYSTEM_ALERT,   "System Health: Optimal","All services are running normally. Uptime: 99.98%");

        // 9. Phase 4: Seed Audit Logs
        auditLog(tenant, AuditAction.CREATE, "USER",    adminUser.getId(), "Admin user created with ADMIN + HR_MANAGER roles", "system");
        auditLog(tenant, AuditAction.CREATE, "EMPLOYEE", alice.getId(),  "Employee Alice Chen created in Engineering",         "admin@erp.com");
        auditLog(tenant, AuditAction.PAY,   "PAYROLL",  null,            "Payroll PAID for all employees — May 2026 cycle",   "admin@erp.com");
        auditLog(tenant, AuditAction.APPROVE,"LEAVE",   null,            "Alice Chen annual leave approved (Jun 5–8)",         "admin@erp.com");
        auditLog(tenant, AuditAction.CREATE, "DEPARTMENT", engineering.getId(), "Department 'Engineering' created", "system");

        // 9. Phase 5: Seed Performance Reviews
        perfReview(alice,  "Q1 2026", 92, PerformanceRating.EXCELLENT,    "Delivered cloud migration ahead of schedule", "admin@erp.com", tenant);
        perfReview(marcus, "Q1 2026", 85, PerformanceRating.GOOD,          "Strong product roadmap execution",            "admin@erp.com", tenant);
        perfReview(sarah,  "Q1 2026", 78, PerformanceRating.SATISFACTORY,  "Consistent HR operations, room for growth",   "admin@erp.com", tenant);
        perfReview(david,  "Q1 2026", 88, PerformanceRating.GOOD,          "Excellent quarterly close and audit prep",     "admin@erp.com", tenant);
        perfReview(emma,   "Q1 2026", 95, PerformanceRating.EXCELLENT,     "Redesigned entire design system — outstanding","admin@erp.com", tenant);
        perfReview(alice,  "Q4 2025", 89, PerformanceRating.GOOD,          "Led engineering hiring in Q4",                "admin@erp.com", tenant);

        // 10. Phase 6: Seed Expenses, Trainings, Announcements
        seedExpensesTrainingsAnnouncements(alice, marcus, sarah, david, emma, tenant);

        // 11. Phase 7: Seed Projects and Goals
        seedProjectsAndGoals(alice, marcus, sarah, david, emma, tenant);

        System.out.println("✅ DataInitializer: Phase 7 seed data loaded (Projects, Goals).");
        System.out.println("   Login: admin@erp.com / Admin123!");
    }

    private Role seedRole(String name) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role r = new Role(); r.setName(name);
            return roleRepository.save(r);
        });
    }

    private Department dept(String name, String desc, BigDecimal monthlyBudget, Tenant t) {
        Department d = new Department();
        d.setName(name); d.setDescription(desc);
        d.setMonthlyBudget(monthlyBudget); d.setTenant(t);
        return departmentRepository.save(d);
    }

    private Employee emp(String fn, String ln, String title, BigDecimal salary,
                         LocalDate hireDate, Department dept, Tenant tenant) {
        Employee e = new Employee();
        e.setFirstName(fn); e.setLastName(ln); e.setJobTitle(title);
        e.setSalary(salary); e.setHireDate(hireDate);
        e.setDepartment(dept); e.setTenant(tenant); e.setActive(true);
        return employeeRepository.save(e);
    }

    private void leaveReq(Employee emp, LeaveType type, LocalDate start, LocalDate end,
                          LeaveStatus status, Tenant tenant) {
        LeaveRequest r = new LeaveRequest();
        r.setEmployee(emp); r.setTenant(tenant);
        r.setLeaveType(type); r.setStartDate(start); r.setEndDate(end);
        r.setReason("Planned " + type.name().toLowerCase().replace("_", " "));
        r.setStatus(status);
        leaveRequestRepository.save(r);
    }

    private void notif(Tenant tenant, NotificationType type, String title, String msg) {
        Notification n = new Notification();
        n.setTenant(tenant); n.setType(type);
        n.setTitle(title); n.setMessage(msg);
        notificationRepository.save(n);
    }

    private void auditLog(Tenant tenant, AuditAction action, String entityType,
                          Long entityId, String details, String performedBy) {
        AuditLog log = new AuditLog();
        log.setTenant(tenant); log.setAction(action);
        log.setEntityType(entityType); log.setEntityId(entityId);
        log.setDetails(details); log.setPerformedBy(performedBy);
        auditLogRepository.save(log);
    }

    private void perfReview(Employee emp, String period, int score, PerformanceRating rating,
                             String goals, String reviewedBy, Tenant tenant) {
        PerformanceReview r = new PerformanceReview();
        r.setEmployee(emp); r.setTenant(tenant);
        r.setReviewPeriod(period);
        r.setReviewDate(java.time.LocalDate.now().minusMonths(1));
        r.setScore(score); r.setRating(rating);
        r.setGoals(goals); r.setReviewedBy(reviewedBy);
        performanceReviewRepository.save(r);
    }

    private void seedExpensesTrainingsAnnouncements(Employee alice, Employee marcus, Employee sarah,
                                                    Employee david, Employee emma, Tenant tenant) {
        // Expenses
        expense(alice,  ExpenseCategory.TRAVEL,     new BigDecimal("1250.00"), "AWS re:Invent conference travel",  ExpenseStatus.APPROVED,  tenant);
        expense(marcus, ExpenseCategory.SOFTWARE,    new BigDecimal("299.00"),  "Figma annual subscription",        ExpenseStatus.PENDING,   tenant);
        expense(sarah,  ExpenseCategory.TRAINING,    new BigDecimal("450.00"),  "SHRM certification renewal",       ExpenseStatus.APPROVED,  tenant);
        expense(david,  ExpenseCategory.MEALS,       new BigDecimal("87.50"),   "Client lunch meeting",             ExpenseStatus.REIMBURSED,tenant);
        expense(emma,   ExpenseCategory.EQUIPMENT,   new BigDecimal("2100.00"), "New Wacom Cintiq drawing tablet",  ExpenseStatus.PENDING,   tenant);

        // Trainings
        training("Cloud Architecture Masterclass",  "AWS Training",  5, LocalDate.now().plusDays(14),
                 LocalDate.now().plusDays(19),  new BigDecimal("1200"), TrainingStatus.UPCOMING,   Set.of(alice, marcus), tenant);
        training("Leadership & Management Essentials","LinkedIn Learning",3, LocalDate.now().minusDays(10),
                 LocalDate.now().minusDays(7),  new BigDecimal("800"),  TrainingStatus.COMPLETED,  Set.of(sarah, alice),  tenant);
        training("Data Analytics with Python",       "Coursera",       7, LocalDate.now().plusDays(30),
                 LocalDate.now().plusDays(37),  new BigDecimal("500"),  TrainingStatus.UPCOMING,   Set.of(david, emma),   tenant);

        // Announcements
        announce("Q2 2026 All-Hands Meeting",
            "Our quarterly all-hands is scheduled for July 15th at 10:00 AM. Please join via Zoom or in-person at HQ.",
            AnnouncementPriority.HIGH, "Admin User", true, tenant);
        announce("New Expense Policy Effective July 2026",
            "The updated expense reimbursement policy is now in effect. All claims above $500 require pre-approval. See the HR portal for full details.",
            AnnouncementPriority.URGENT, "Sarah Williams", false, tenant);
        announce("Office Closure – Public Holiday",
            "The office will be closed on June 26th (Public Holiday). Employees working remotely should log their hours as usual.",
            AnnouncementPriority.NORMAL, "Admin User", false, tenant);
    }

    private void expense(Employee emp, ExpenseCategory cat, BigDecimal amount, String desc,
                         ExpenseStatus status, Tenant tenant) {
        Expense e = new Expense();
        e.setEmployee(emp); e.setTenant(tenant);
        e.setCategory(cat); e.setAmount(amount);
        e.setDescription(desc); e.setStatus(status);
        e.setExpenseDate(LocalDate.now().minusDays(5));
        if (status == ExpenseStatus.APPROVED || status == ExpenseStatus.REIMBURSED) {
            e.setReviewedBy("admin@erp.com");
            e.setReviewedAt(LocalDateTime.now().minusDays(2));
        }
        expenseRepository.save(e);
    }

    private void training(String title, String provider, int days, LocalDate start, LocalDate end,
                          BigDecimal cost, TrainingStatus status, Set<Employee> employees, Tenant tenant) {
        Training t = new Training();
        t.setTenant(tenant); t.setTitle(title); t.setProvider(provider);
        t.setDurationDays(days); t.setStartDate(start); t.setEndDate(end);
        t.setCost(cost); t.setStatus(status);
        t.getEnrolledEmployees().addAll(employees);
        trainingRepository.save(t);
    }

    private void announce(String title, String body, AnnouncementPriority priority,
                          String author, boolean pinned, Tenant tenant) {
        Announcement a = new Announcement();
        a.setTenant(tenant); a.setTitle(title); a.setBody(body);
        a.setPriority(priority); a.setAuthorName(author); a.setPinned(pinned);
        announcementRepository.save(a);
    }

    private void seedProjectsAndGoals(Employee alice, Employee marcus, Employee sarah,
                                      Employee david, Employee emma, Tenant tenant) {
        // Project 1: Cloud Migration
        Project p1 = new Project();
        p1.setTenant(tenant); p1.setName("Cloud Infrastructure Migration");
        p1.setDescription("Migrate on-premise servers to AWS cloud — EKS, RDS, S3 setup.");
        p1.setStatus(ProjectStatus.IN_PROGRESS); p1.setLeadEmployee(alice);
        p1.setStartDate(LocalDate.now().minusMonths(2)); p1.setDueDate(LocalDate.now().plusMonths(1));
        p1.setBudget(new BigDecimal("75000")); p1 = projectRepository.save(p1);
        seedTask(p1, "Provision AWS EKS cluster",   alice,  TaskStatus.DONE,        TaskPriority.HIGH);
        seedTask(p1, "Migrate PostgreSQL to RDS",   david,  TaskStatus.IN_PROGRESS,  TaskPriority.HIGH);
        seedTask(p1, "Setup CI/CD pipelines",       alice,  TaskStatus.IN_REVIEW,    TaskPriority.MEDIUM);
        seedTask(p1, "Load testing & performance",  alice,  TaskStatus.TODO,         TaskPriority.MEDIUM);

        // Project 2: Design System Overhaul
        Project p2 = new Project();
        p2.setTenant(tenant); p2.setName("Design System 3.0");
        p2.setDescription("Rebuild the company design system with Figma tokens and React component library.");
        p2.setStatus(ProjectStatus.PLANNING); p2.setLeadEmployee(emma);
        p2.setStartDate(LocalDate.now().plusDays(7)); p2.setDueDate(LocalDate.now().plusMonths(3));
        p2.setBudget(new BigDecimal("30000")); p2 = projectRepository.save(p2);
        seedTask(p2, "Define design tokens in Figma",     emma,   TaskStatus.TODO, TaskPriority.HIGH);
        seedTask(p2, "Build Button & Form components",    emma,   TaskStatus.TODO, TaskPriority.MEDIUM);
        seedTask(p2, "Write Storybook documentation",     marcus, TaskStatus.TODO, TaskPriority.LOW);

        // Goals
        seedGoal(alice,  "Achieve AWS Solutions Architect cert","Complete AWS-SAA by Q3 2026",    GoalCategory.LEARNING,      85, GoalStatus.ACTIVE,    LocalDate.now().plusMonths(2), "Q2 2026", tenant);
        seedGoal(alice,  "Reduce cloud infra costs by 20%",     "Optimise EC2/RDS spend via Reserved Instances",GoalCategory.DELIVERY, 60, GoalStatus.ACTIVE, LocalDate.now().plusMonths(3), "Q2 2026", tenant);
        seedGoal(marcus, "Launch 3 product features in Q2",     "Deliver CRM, Dashboard & Mobile features",     GoalCategory.DELIVERY,    100, GoalStatus.COMPLETED, LocalDate.now().minusDays(5), "Q1 2026", tenant);
        seedGoal(sarah,  "Improve employee NPS to 80+",          "Run quarterly engagement survey and action plan",GoalCategory.PERFORMANCE, 40, GoalStatus.ACTIVE,    LocalDate.now().plusMonths(4), "Q2 2026", tenant);
        seedGoal(emma,   "Complete UI/UX certification",         "Nielsen Norman Group UX Certification Program", GoalCategory.LEARNING,    70, GoalStatus.ACTIVE,    LocalDate.now().plusMonths(1), "Q2 2026", tenant);
    }

    private void seedTask(Project project, String title, Employee assignee,
                          TaskStatus status, TaskPriority priority) {
        ProjectTask t = new ProjectTask();
        t.setProject(project); t.setTitle(title); t.setAssignee(assignee);
        t.setStatus(status); t.setPriority(priority);
        t.setDueDate(project.getDueDate());
        projectTaskRepository.save(t);
    }

    private void seedGoal(Employee emp, String title, String desc, GoalCategory cat,
                          int progress, GoalStatus status, LocalDate targetDate,
                          String quarter, Tenant tenant) {
        Goal g = new Goal();
        g.setEmployee(emp); g.setTenant(tenant); g.setTitle(title);
        g.setDescription(desc); g.setCategory(cat); g.setProgress(progress);
        g.setStatus(status); g.setTargetDate(targetDate); g.setQuarter(quarter);
        goalRepository.save(g);
    }
}
