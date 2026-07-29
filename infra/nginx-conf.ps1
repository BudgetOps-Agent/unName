$NginxDir = $PSScriptRoot
$ServicesFile = Join-Path $PSScriptRoot "services.json"
$OutputFile = Join-Path $NginxDir "conf\nginx.conf"
$NginxVersion = "1.27.2"
$NginxZipUrl = "https://nginx.org/download/nginx-$NginxVersion.zip"

if (-not (Test-Path "$NginxDir\conf\mime.types")) {
    Write-Host "nginx가 설치되어 있지 않습니다. 자동으로 다운로드합니다..."

    $tempZip = Join-Path $env:TEMP "nginx.zip"
    Invoke-WebRequest -Uri $NginxZipUrl -OutFile $tempZip

    $tempExtract = Join-Path $env:TEMP "nginx-extract"
    Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

    $extractedFolder = Get-ChildItem $tempExtract | Where-Object { $_.PSIsContainer } | Select-Object -First 1
    Copy-Item -Path "$($extractedFolder.FullName)\*" -Destination $NginxDir -Recurse -Force

    Remove-Item $tempZip -Force
    Remove-Item $tempExtract -Recurse -Force

    Write-Host "nginx 설치 완료: $NginxDir"
} else {
    Write-Host "nginx가 이미 설치되어 있습니다."
}

$services = Get-Content $ServicesFile | ConvertFrom-Json

# --- nginx.conf 전체 내용을 문자열 하나로 다 조립 ---
$configContent = @"
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;
    sendfile on;

    server {
        listen 8081;
        server_name localhost;

"@

foreach ($service in $services) {

    if ($service.path.StartsWith("^")) {
        $locationDirective = "location ~ $($service.path)"
    } else {
        $locationDirective = "location $($service.path)"
    }

    $configContent += @"
        # --- $($service.name) ---
        $locationDirective {
            proxy_pass http://127.0.0.1:$($service.port);
            proxy_http_version 1.1;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;

            add_header X-Served-By "$($service.name)-$($service.port)" always;
        }

"@
}

$configContent += @"
    }
}
"@

# --- BOM 없는 UTF-8로 파일 쓰기 (.NET 방식 사용) ---
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($OutputFile, $configContent, $utf8NoBom)

Write-Host "nginx.conf 생성 완료: $OutputFile"

# nginx 재시작
Push-Location $NginxDir
& .\nginx.exe -t
& .\nginx.exe -s stop 2>$null
Start-Sleep -Seconds 1
& .\nginx.exe
Pop-Location

Write-Host "nginx 재시작 완료"