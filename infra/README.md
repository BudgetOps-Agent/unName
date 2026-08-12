# Frontend Traffic Distribution with Nginx

## 📌 Overview

프로젝트에서는 지출(Expenses) 페이지의 요청이 증가하더라도 로그인, 모임 조회 등 일반 페이지의 성능이 저하되지 않도록 **프론트엔드(Next.js)만 분산 처리하는 구조**를 적용하였다.

백엔드는 하나의 Spring Boot 인스턴스만 유지하고, 동일한 Next.js 프로젝트를 두 개의 인스턴스로 실행한 뒤 Nginx의 **경로 기반(Path-based) 라우팅**을 이용하여 요청을 분산하였다.

> 백엔드는 하나의 인스턴스(8080)만 사용하며, 프론트엔드만 분리하여 운영한다.

---

# Architecture

```
                         Browser
                            │
                            ▼
                    Nginx (localhost:8081)
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
          ▼                                   ▼
   Frontend A (3001)                  Frontend B (3002)
   일반 페이지                          지출 페이지

                    │
                    ▼
             Spring Boot (8080)
                    │
          ┌─────────┴─────────┐
          │                   │
       MySQL              Redis
```

---

# Service Ports

| Service | Port |
|---------|------|
| MySQL | 3306 |
| Redis | 6379 |
| Spring Boot | 8080 |
| Frontend A | 3001 |
| Frontend B | 3002 |
| Nginx | 8081 |

---

# Why This Architecture?

이번 프로젝트에서는 지출 관련 기능이 가장 많은 요청이 발생하는 화면이라고 판단하였다.

만약 하나의 Next.js 서버에서 모든 페이지를 처리하면 지출 페이지 요청이 많아질 경우 일반 페이지까지 동일한 서버 자원을 사용하게 된다.

이를 방지하기 위해 동일한 프론트엔드 프로젝트를 두 개의 인스턴스로 실행하고, Nginx가 URL을 기준으로 적절한 인스턴스로 요청을 전달하도록 구성하였다.

이를 통해 특정 기능의 요청이 증가하더라도 일반 페이지의 응답 성능을 최대한 유지할 수 있도록 하였다.

---

# Execution

## 1. Backend

Spring Boot 프로젝트를 IntelliJ에서 실행한다.

```
BackendApplication 실행
```

---

## 2. Frontend A (일반 페이지)

```powershell
cd D:\unName\frontend

$env:NEXT_DIST_DIR=".next-main"

npm run dev -- -p 3001
```

---

## 3. Frontend B (지출 페이지)

새 PowerShell 창에서 실행한다.

```powershell
cd D:\unName\frontend

$env:NEXT_DIST_DIR=".next-expenses"

npm run dev -- -p 3002
```

### Build Directory 분리

동일한 Next.js 프로젝트를 두 번 실행하면 기본적으로 `.next` 폴더를 함께 사용한다.

이 경우 두 인스턴스가 동시에 빌드 파일을 수정하면서 다음과 같은 오류가 발생한다.

```
EPERM: operation not permitted
```

이를 방지하기 위해 각 인스턴스가 서로 다른 빌드 디렉터리를 사용하도록 설정하였다.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
```

---

## 4. Nginx 실행

```powershell
cd D:\unName\infra

.\nginx-conf.ps1
```

PowerShell 스크립트는 다음 작업을 자동으로 수행한다.

- services.json 읽기
- nginx.conf 자동 생성
- nginx 자동 설치(없는 경우)
- nginx 재시작

---

# Routing

서비스 정보는 `services.json`에서 관리한다.

```json
[
  {
    "name": "expenses-frontend",
    "path": "^/teams/[^/]+/expenses",
    "port": 3002
  },
  {
    "name": "backend-api",
    "path": "/api/",
    "port": 8080
  },
  {
    "name": "frontend",
    "path": "/",
    "port": 3001
  }
]
```

### Routing Result

| Request | Destination |
|----------|-------------|
| `/teams/{teamId}/expenses` | Frontend B (3002) |
| `/api/*` | Spring Boot (8080) |
| Others | Frontend A (3001) |

`services.json`을 수정한 후 `nginx-conf.ps1`만 다시 실행하면 새로운 `nginx.conf`가 자동 생성된다.

---

# Advantages

- URL 기반으로 요청을 자동 분산할 수 있다.
- 지출 페이지와 일반 페이지의 요청을 분리하여 성능 영향을 줄일 수 있다.
- 동일한 소스를 사용하므로 유지보수가 쉽다.
- Nginx 설정을 직접 수정하지 않고 JSON만 수정하면 된다.
- 새로운 서비스가 추가되어도 쉽게 확장할 수 있다.

---

# Limitations

- 프론트엔드 인스턴스를 두 개 실행하므로 메모리 사용량이 증가한다.
- 실행해야 하는 프로세스가 늘어나 로컬 개발 환경이 다소 복잡해진다.
- 백엔드는 하나만 사용하므로 실제 비즈니스 로직과 DB 처리 부하는 분산되지 않는다.
- 운영 환경에서는 백엔드 이중화 또는 로드 밸런서를 추가로 구성해야 완전한 분산 환경이 된다.

---

# Expected Effect

- 지출 페이지의 요청이 증가하더라도 일반 페이지의 응답 속도 저하를 최소화할 수 있다.
- 경로 기반 라우팅(Path-based Routing)을 적용하여 프론트엔드 트래픽을 효율적으로 분산할 수 있다.
- `services.json` 기반 자동 설정 생성으로 서비스 추가 및 유지보수가 용이한 구조를 구축하였다.