#!/usr/bin/env bash
set -e

# --- 이 스크립트 파일이 있는 폴더를 기준으로 경로 설정 (PowerShell의 $PSScriptRoot와 동일한 역할) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES_FILE="$SCRIPT_DIR/services.json"
OUTPUT_FILE="/etc/nginx/nginx.conf"

# --- 1. nginx 설치 확인, 없으면 자동 설치 ---
if ! command -v nginx &> /dev/null; then
    echo "nginx가 설치되어 있지 않습니다. 자동으로 설치합니다..."
    sudo apt update
    sudo apt install nginx -y
    echo "nginx 설치 완료"
else
    echo "nginx가 이미 설치되어 있습니다."
fi

# --- 2. jq 설치 확인 (services.json 파싱용) ---
if ! command -v jq &> /dev/null; then
    echo "jq가 설치되어 있지 않습니다. 자동으로 설치합니다..."
    sudo apt install jq -y
fi

# --- 3. nginx.conf 전체 내용을 문자열 하나로 조립 ---
CONFIG_CONTENT="worker_processes 1;

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

"

while IFS= read -r service; do
    name=$(echo "$service" | jq -r '.name')
    path=$(echo "$service" | jq -r '.path')
    port=$(echo "$service" | jq -r '.port')
    is_regex=$(echo "$service" | jq -r '.regex // false')

    if [ "$is_regex" = "true" ]; then
        location_keyword="~ "
    else
        location_keyword=""
    fi

    CONFIG_CONTENT+="        # --- $name ---
        location $location_keyword$path {
            proxy_pass http://127.0.0.1:$port;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

"
done < <(jq -c '.[]' "$SERVICES_FILE")

CONFIG_CONTENT+="    }
}
"

# --- 4. nginx.conf 파일로 저장 (관리자 권한 필요) ---
echo "$CONFIG_CONTENT" | sudo tee "$OUTPUT_FILE" > /dev/null

echo "nginx.conf 생성 완료: $OUTPUT_FILE"

# --- 5. nginx 재시작 ---
sudo nginx -t
sudo service nginx restart

echo "nginx 재시작 완료"