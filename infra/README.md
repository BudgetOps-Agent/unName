# unName 프로젝트 — 프론트 분산 처리 구성 (지출 페이지 분리 + nginx)

지출 등록 페이지에 트래픽이 몰릴 때, 로그인/모임 조회 같은 다른 페이지가 영향을 받지 않도록 **프론트엔드(Next.js)를 두 인스턴스로 나눠서 nginx가 경로별로 분산**하는 로컬 개발 환경 구성 문서입니다.

> 백엔드는 1개(8080)만 사용합니다. (강사님 지시에 따라 백엔드 분리는 하지 않고, 프론트 분리로만 진행)

---

## 1. 전체 구조

```
                         [브라우저]
                             │
                             ▼
                  http://localhost:8081  ← nginx (진입점)
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                     ▼
   /api/*              /expenses*                그 외 (/)
        │                    │                     │
        ▼                    ▼                     ▼
  백엔드(Spring)        프론트 인스턴스 B          프론트 인스턴스 A
   localhost:8080        (지출 전용)                (일반)
                          localhost:3002            localhost:3001
        │
        ▼
  ┌───────────┬────────────┐
  │  MySQL    │   Redis    │
  │  :3306    │   :6379    │
  └───────────┴────────────┘
```

- **백엔드는 1개**만 띄웁니다 (8080, IntelliJ에서 그냥 Run).
- **프론트(Next.js)는 같은 코드**를 포트만 다르게 **2번 실행**합니다 (3001, 3002). 프로젝트를 물리적으로 분리하지 않습니다.
- **nginx**가 요청 경로를 보고 적절한 포트로 그대로 전달(`proxy_pass`)합니다.
- MySQL, Redis는 항상 1개씩만 존재하며, 프론트 두 인스턴스가 결국 같은 백엔드(8080) 하나를 공유하므로 데이터/로그인 상태 동기화는 원래부터 문제되지 않습니다.

> ⚠️ **한계**: 이 구조는 프론트(화면) 트래픽만 분산합니다. 지출 등록 시 실제 DB 쓰기·파일 업로드 부하는 여전히 백엔드 1개가 전부 처리합니다. 백엔드 자체의 부하 분산이 필요해지면 별도로 백엔드 인스턴스 분리를 검토해야 합니다.

---

## 2. 포트 정리

| 서비스 | 포트 | 개수 |
|---|---|---|
| MySQL | 3306 | 1개 (고정) |
| Redis | 6379 | 1개 (고정) |
| 백엔드 (Spring Boot) | 8080 | 1개 |
| 프론트 인스턴스 A (일반) | 3001 | 1개 |
| 프론트 인스턴스 B (지출 전용) | 3002 | 1개 |
| **nginx (최종 진입점)** | **8081** | 1개 |

---

## 3. 실행 순서 (모두 PowerShell 기준)



### 3-1. 백엔드 — IntelliJ에서 실행

`BackendApplication` 실행 버튼(▶️)으로 그냥 실행합니다. 명령어로 띄울 필요 없습니다.

### 3-2. 프론트 인스턴스 A (포트 3001)

```powershell
cd D:\unName\frontend
$env:NEXT_DIST_DIR=".next-main"
npm run dev -- -p 3001
```

### 3-3. 프론트 인스턴스 B (포트 3002, 새 PowerShell 창)

```powershell
cd D:\unName\frontend
$env:NEXT_DIST_DIR=".next-teams"
npm run dev -- -p 3002
```

> ⚠️ `NEXT_DIST_DIR` 환경변수로 `.next` 캐시 폴더를 분리하지 않으면, 두 인스턴스가 같은 빌드 캐시를 공유하면서 `EPERM: operation not permitted, rename ...` 에러가 반복됩니다. 반드시 인스턴스마다 다른 값을 지정하고, 새 터미널을 열 때마다 다시 설정해야 합니다 (세션마다 초기화됨).

`next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
```

### 3-4. nginx (새 PowerShell 창)

```powershell
cd D:\unName\infra
.\nginx-conf.ps1
```

`services.json`을 읽어서 `nginx.conf`를 자동 생성하고, 필요하면 nginx를 자동 설치한 뒤 재시작까지 한 번에 처리합니다.

---

## 4. `services.json` — 라우팅 규칙 관리

```json
[
  { "name": "expenses-frontend", "path": "/expenses", "port": 3002 },
  { "name": "backend-api", "path": "/api/", "port": 8080 },
  { "name": "frontend", "path": "/", "port": 3001 }
]
```

### 새 서비스를 추가하려면

1. 이 파일에 `{ "name": ..., "path": ..., "port": ... }` 한 줄 추가
2. `path`가 `"/"`(catch-all)인 항목은 **항상 배열 맨 마지막**에 위치 (nginx는 구체적인 경로부터 먼저 매칭하므로, `/`가 앞에 있으면 뒤의 규칙들이 전부 무시됨)
3. `.\nginx-conf.ps1` 재실행

서비스가 5개 이하일 때는 이 방식으로 충분합니다. 더 늘어나면 GCP Load Balancer + URL Map, 또는 Kubernetes Ingress 같은 관리형 라우팅으로 전환을 고려합니다.

> 참고: 백엔드 API 경로 중 일부만(`/api/teams/{teamId}/expenses`처럼) 별도 서버로 보내고 싶을 경우, nginx 정규식 location(`location ~ 패턴`)이 필요합니다. `services.json`에 `"regex": true`를 추가하면 스크립트가 자동으로 `location ~ 경로` 형태로 생성합니다. 현재는 백엔드가 1개뿐이라 사용하지 않습니다.

---

## 5. 환경변수 / CORS

`frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8081
```
프론트가 API를 호출할 때 nginx(8081)를 거치도록 설정합니다. 백엔드(8080)로 직접 요청하면 CORS 설정에 걸려 차단됩니다.

`backend/src/main/java/.../CorsConfig.java`
```java
.allowedOrigins(
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:8081"
)
```

## 6. 백엔드 분리는 하지 않은 이유

처음에는 지출 등록 API(`/api/teams/{teamId}/expenses`)만 별도 백엔드 인스턴스(8082)로 분리하는 방향도 검토했으나(nginx 정규식 라우팅으로 구현 가능), 아래 이유로 **백엔드는 1개로 유지**하기로 했습니다.

- 로컬 개발 환경에서 JDK 경로 미등록으로 인해 커맨드라인으로 백엔드 두 번째 인스턴스를 띄우는 데 어려움이 있었음
- 프론트 분리만으로도 nginx 경로 기반 라우팅의 핵심 원리는 충분히 학습 가능

추후 실제로 지출 등록 트래픽이 몰려 백엔드 부하가 문제가 되면, `services.json`에 `regex: true` 옵션을 활용해 `/api/teams/{teamId}/(expenses|statistics)` 패턴을 별도 백엔드 인스턴스로 라우팅하는 구조를 다시 검토합니다.