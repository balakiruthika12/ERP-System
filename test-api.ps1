
# ERP System - API Endpoint Test Script
# Run this to verify all endpoints return 200 after login

Write-Host "`n=== ERP System API Test ===" -ForegroundColor Cyan

# Wait for Java to be ready
Write-Host "Waiting for backend on port 8080..." -ForegroundColor Yellow
$maxWait = 120; $waited = 0
while ($waited -lt $maxWait) {
    try { $null = (New-Object System.Net.Sockets.TcpClient).Connect("localhost",8080); break }
    catch { Start-Sleep -Seconds 3; $waited += 3 }
}

Start-Sleep -Seconds 3  # extra grace for DataInitializer

# Login
try {
    $loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" `
        -Method POST -ContentType "application/json" `
        -Body '{"email":"admin@erp.com","password":"Admin123!"}'
    $token = $loginResp.token
    Write-Host "✅ Login OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Login FAILED: $_" -ForegroundColor Red
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }

$tests = @(
    @{n="Employees";      u="/employees"},
    @{n="Departments";    u="/departments"},
    @{n="Payroll";        u="/payroll"},
    @{n="Leave Requests"; u="/leave-requests"},
    @{n="Performance";    u="/performance-reviews"},
    @{n="Expenses";       u="/expenses"},
    @{n="Goals";          u="/goals"},
    @{n="Projects";       u="/projects"},
    @{n="Training";       u="/training"},
    @{n="Announcements";  u="/announcements"},
    @{n="Dashboard";      u="/dashboard/metrics"},
    @{n="Reports Finance";u="/reports/financial"},
    @{n="Audit Logs";     u="/audit-logs"}
)

$pass = 0; $fail = 0
foreach ($t in $tests) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8080/api/v1$($t.u)" -Headers $headers -Method GET -ErrorAction Stop
        Write-Host "  ✅ $($t.n): HTTP $($r.StatusCode)" -ForegroundColor Green
        $pass++
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "  ❌ $($t.n): HTTP $code" -ForegroundColor Red
        $fail++
    }
}

Write-Host "`nResults: $pass passed, $fail failed" -ForegroundColor $(if($fail -eq 0){"Green"}else{"Yellow"})
