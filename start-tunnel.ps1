# ==============================================================================
# RescuOS - Passwordless Public Tunnel Starter
# Generates a direct public URL with NO password and NO verification screen
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "RescuOS Direct Public Tunnel (No Password Required)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "[INFO] Connecting tunnel for port 5173 (Frontend + Proxied Backend API)..." -ForegroundColor White
Write-Host "[INFO] Press Ctrl+C anytime to stop.`n" -ForegroundColor Gray

while ($true) {
    ssh.exe -R 80:localhost:5173 -o StrictHostKeyChecking=no -o ServerAliveInterval=60 nokey@localhost.run
    Write-Host "`n[WARN] Tunnel disconnected. Reconnecting in 3 seconds..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}
