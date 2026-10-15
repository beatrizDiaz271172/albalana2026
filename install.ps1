#requires -Version 5.1
param(
  [ValidateSet('install','update','stop','logs','status','backup','reset')]
  [string]$Action = 'install'
)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Info($m) { Write-Host "[albalana] $m" -ForegroundColor Green }
function Warn($m) { Write-Host "[albalana] $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "[albalana] ERROR: $m" -ForegroundColor Red; exit 1 }

function Rand-Pass([int]$n = 16) {
  $chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'.ToCharArray()
  $bytes = New-Object byte[] $n
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  -join ($bytes | ForEach-Object { $chars[$_ % $chars.Length] })
}
function Rand-Base64([int]$n = 32) {
  $bytes = New-Object byte[] $n
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  [Convert]::ToBase64String($bytes)
}
function Read-Env {
  $h = @{}
  if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
      if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') { $h[$Matches[1]] = $Matches[2].Trim() }
    }
  }
  $h
}
function Dc([string]$cmd) {
  cmd /c "docker compose $cmd"
  if ($LASTEXITCODE -ne 0) { Fail "Fallo: docker compose $cmd" }
}
function Test-Docker {
  cmd /c "docker info >nul 2>&1"
  if ($LASTEXITCODE -ne 0) { Fail "Docker no esta instalado o no esta corriendo. Abri Docker Desktop y reintenta." }
  cmd /c "docker compose version >nul 2>&1"
  if ($LASTEXITCODE -ne 0) { Fail "Falta 'docker compose' v2." }
}
function Ensure-Env {
  if (Test-Path .env) { Info ".env existente: se conserva."; return }
  Info "Generando .env con claves aleatorias..."
  $lines = @(
    '# Generado por install.ps1 - NO subir a Git',
    'APP_PORT=8081',
    'DB_PORT=5433',
    'POSTGRES_DB=albalanadb',
    'POSTGRES_USER=postgres',
    "POSTGRES_PASSWORD=$(Rand-Pass 20)",
    "JWT_SECRET=$(Rand-Base64 32)",
    'JWT_EXPIRATION_MS=86400000',
    'ADMIN_USER=admin',
    "ADMIN_PASSWORD=$(Rand-Pass 12)",
    'ADMIN_NOMBRE=Administrador',
    'ADMIN_EMAIL=admin@albalana.local',
    'PGADMIN_EMAIL=admin@albalana.local',
    "PGADMIN_PASSWORD=$(Rand-Pass 12)"
  )
  Set-Content -Path .env -Value $lines -Encoding ASCII
}
function Wait-App([string]$port) {
  Info "Esperando a que la app responda en http://localhost:$port ..."
  for ($i = 0; $i -lt 90; $i++) {
    try {
      $r = Invoke-WebRequest -Uri "http://localhost:$port/" -UseBasicParsing -TimeoutSec 3
      if ($r.StatusCode -eq 200) { return $true }
    } catch {}
    Start-Sleep -Seconds 2
  }
  return $false
}

Test-Docker
foreach ($f in 'Dockerfile','docker-compose.yml','docker\seed.sh','backend\pom.xml','frontend\package.json') {
  if (-not (Test-Path $f)) { Fail "No encuentro $f. Ejecuta este script desde la raiz del proyecto." }
}

switch ($Action) {
  'install' {
    Ensure-Env
    Info "Construyendo imagenes y levantando servicios (la primera vez tarda varios minutos)..."
    Dc 'up -d --build'
    $e = Read-Env
    $port = if ($e.APP_PORT) { $e.APP_PORT } else { '8081' }
    if (Wait-App $port) {
      $seedCode = (cmd /c "docker wait albalana_seed").Trim()
      if ($seedCode -ne '0') { Warn "El seed termino con codigo $seedCode. Revisa: docker compose logs seed" }
      Write-Host ""
      Info "Instalacion lista"
      Write-Host "   URL:      http://localhost:$port"
      Write-Host "   Usuario:  $($e.ADMIN_USER)"
      Write-Host "   Clave:    $($e.ADMIN_PASSWORD)   (guardada en .env)"
      Write-Host "   Postgres: localhost:$($e.DB_PORT)  db=$($e.POSTGRES_DB)  user=$($e.POSTGRES_USER)"
    } else {
      Warn "La app no respondio a tiempo. Revisa: install.bat logs"
    }
  }
  'update' {
    if (Test-Path .git) { Info "git pull..."; cmd /c "git pull" }
    Dc 'up -d --build'
    Info "Actualizado. Los datos de PostgreSQL se conservan (volumen pgdata)."
  }
  'stop'   { Dc 'down'; Info "Servicios detenidos (datos conservados)." }
  'logs'   { Dc 'logs -f app' }
  'status' { Dc 'ps -a' }
  'backup' {
    $e = Read-Env
    New-Item -ItemType Directory -Force -Path backups | Out-Null
    $file = "backups\albalana_{0}.sql" -f (Get-Date -Format 'yyyyMMdd_HHmmss')
    cmd /c "docker compose exec -T db pg_dump -U $($e.POSTGRES_USER) $($e.POSTGRES_DB) > $file"
    if ($LASTEXITCODE -ne 0) { Fail "Fallo el backup." }
    Info "Backup guardado en $file"
  }
  'reset' {
    $r = Read-Host "Esto BORRA la base de datos (volumen pgdata). Escribi SI para continuar"
    if ($r -eq 'SI') { Dc 'down -v'; Info "Todo eliminado. Podes volver a correr install." } else { Info "Cancelado." }
  }
}
