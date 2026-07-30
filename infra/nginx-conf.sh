#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES_FILE="$SCRIPT_DIR/services.json"
OUTPUT_FILE="/etc/nginx/nginx.conf"

# --- nginx 설치 확인 ---
if ! command -v nginx &> /dev/null; then
    echo "nginx가 설치되어 있지 않습니다. 자동으로 설치합니다..."
    sudo apt update
    sudo apt install -y nginx
    echo "nginx 설치 완료"
else
    echo "nginx가 이미 설치되어 있습니다."
fi

# --- jq 설치 확인 ---
if ! command -v jq &> /dev/null; then
    echo "jq가 설치되어 있지 않습니다. 자동으로 설치합니다..."
    sudo apt update
    sudo apt install -y jq
fi

# --- nginx.conf 기본 내용 ---
CONFIG_CONTENT='worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;
    sendfile on;

    map $http_upgrade $connection_upgrade {
        default upgrade;
        "" close;
    }

    server {
        listen 8081;
        server_name localhost;

        # Next.js HMR
        location /_next/ {
            proxy_pass http://127.0.0.1:3001;

            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;

            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_cache_bypass $http_upgrade;

            proxy_read_timeout 86400;
            proxy_send_timeout 86400;

            add_header X-Served-By "frontend-3001" always;
        }

'

# --- services.json 기반 location 생성 ---
while IFS= read -r service; do

    NAME=$(echo "$service" | jq -r '.name')
    PATH_VALUE=$(echo "$service" | jq -r '.path')
    PORT=$(echo "$service" | jq -r '.port')
    REGEX=$(echo "$service" | jq -r '.regex // false')

    if [ "$REGEX" = "true" ]; then
        LOCATION="location ~ $PATH_VALUE"
    else
        LOCATION="location $PATH_VALUE"
    fi

    CONFIG_CONTENT+="
        # --- $NAME ---
        $LOCATION {
            proxy_pass http://127.0.0.1:$PORT;

            proxy_http_version 1.1;

            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;

            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \$connection_upgrade;
            proxy_cache_bypass \$http_upgrade;

            proxy_read_timeout 86400;
            proxy_send_timeout 86400;

            add_header X-Served-By \"$NAME-$PORT\" always;
        }

"

done < <(jq -c '.[]' "$SERVICES_FILE")

CONFIG_CONTENT+='
    }
}
'

# --- nginx.conf 저장 ---
echo "$CONFIG_CONTENT" | sudo tee "$OUTPUT_FILE" > /dev/null

echo "nginx.conf 생성 완료: $OUTPUT_FILE"

# --- 설정 검사 ---
sudo nginx -t

# --- nginx 재시작 ---
sudo systemctl restart nginx

echo "nginx 재시작 완료"