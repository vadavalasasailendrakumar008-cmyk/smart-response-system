@echo off
title RescuOS Direct Public Tunnel
echo ==========================================================
echo RescuOS Direct Public Tunnel (No Password Required)
echo ==========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0start-tunnel.ps1"
pause
