$routes = @('/', '/login', '/about', '/contact', '/jobs', '/onboarding', '/buy-tokens', '/verify', '/jobs/create', '/feedback', '/dashboard', '/my-applications', '/applications', '/admin')
$pass = 0
$fail = 0

foreach ($r in $routes) {
    try {
        $resp = Invoke-WebRequest -Uri ("http://localhost:3099" + $r) -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
        Write-Host ("[PASS] {0} => {1}" -f $r, $resp.StatusCode) -ForegroundColor Green
        $pass++
    } catch {
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
            if ($code -eq 307 -or $code -eq 308) {
                Write-Host ("[PASS] {0} => {1} (redirect - auth required)" -f $r, $code) -ForegroundColor Yellow
                $pass++
            } else {
                Write-Host ("[FAIL] {0} => {1}" -f $r, $code) -ForegroundColor Red
                $fail++
            }
        } else {
            Write-Host ("[FAIL] {0} => ERROR: {1}" -f $r, $_.Exception.Message) -ForegroundColor Red
            $fail++
        }
    }
}

Write-Host ""
Write-Host ("Smoke Test Results: {0} passed, {1} failed out of {2} routes" -f $pass, $fail, $routes.Count)
if ($fail -eq 0) { Write-Host "ALL ROUTES OK!" -ForegroundColor Green }
