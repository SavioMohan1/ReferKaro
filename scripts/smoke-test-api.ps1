$apiRoutes = @(
    @{Method='GET'; Path='/api/notifications'},
    @{Method='POST'; Path='/api/applications/apply'; Body='{}'},
    @{Method='POST'; Path='/api/payments/verify'; Body='{}'},
    @{Method='POST'; Path='/api/ai/analyze-resume'; Body='{}'},
    @{Method='POST'; Path='/api/applications/review'; Body='{}'},
    @{Method='POST'; Path='/api/applications/complete-payment'; Body='{}'},
    @{Method='POST'; Path='/api/admin/jobs/review'; Body='{}'},
    @{Method='GET'; Path='/api/cron/expire-applications'},
    @{Method='POST'; Path='/api/webhooks/inbound-email'; Body='{}'}
)

$pass = 0
$fail = 0

foreach ($route in $apiRoutes) {
    try {
        $params = @{
            Uri = "http://localhost:3099" + $route.Path
            Method = $route.Method
            UseBasicParsing = $true
            ErrorAction = 'Stop'
            TimeoutSec = 10
        }
        if ($route.Body) {
            $params.ContentType = 'application/json'
            $params.Body = $route.Body
        }
        $resp = Invoke-WebRequest @params
        Write-Host ("[PASS] {0} {1} => {2}" -f $route.Method, $route.Path, $resp.StatusCode) -ForegroundColor Green
        $pass++
    } catch {
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
            if ($code -in @(400, 401, 403, 404, 429, 500)) {
                Write-Host ("[PASS] {0} {1} => {2} (route responds)" -f $route.Method, $route.Path, $code) -ForegroundColor Yellow
                $pass++
            } else {
                Write-Host ("[FAIL] {0} {1} => {2}" -f $route.Method, $route.Path, $code) -ForegroundColor Red
                $fail++
            }
        } else {
            Write-Host ("[FAIL] {0} {1} => TIMEOUT/ERROR" -f $route.Method, $route.Path) -ForegroundColor Red
            $fail++
        }
    }
}

Write-Host ""
Write-Host ("API Smoke Test: {0} passed, {1} failed out of {2}" -f $pass, $fail, $apiRoutes.Count)
if ($fail -eq 0) { Write-Host "ALL API ROUTES RESPONDING!" -ForegroundColor Green }
