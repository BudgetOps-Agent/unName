# Frontend

Next.js Pages Router 기반 프론트엔드 프로젝트입니다.

TypeScript를 사용하여 타입 안정성을 확보하고, 컴포넌트 단위로 UI를 구성하였습니다.


---

# 실행 방법

## 프로젝트 설치

```bash
npm install
```

또는

```bash
npm ci
```

---

## 개발 서버 실행

```bash
npm run dev
```

실행 후 브라우저에서 확인

```text
http://localhost:3000
```

---

## 프로덕션 빌드

```bash
npm run build
```

---

## 프로덕션 실행

```bash
npm run start
```

---

<!-- ## 코드 검사

```bash
npm run lint
``` -->

---

# 프로젝트 구조

```text
src

├─ pages
│
├─ shared
│  ├─ components
│  └─ layouts
│
└─ styles
```

---

# 폴더 설명

## pages

페이지 및 라우팅을 관리합니다.

```text
URL

↓

Page

↓

Component
```

---

## shared

프로젝트 전반에서 사용하는 공통 자원을 관리합니다.

### components

재사용 가능한 UI 컴포넌트를 관리합니다.

예시

* Button
* Input
* Card
* Modal

### layouts

공통 레이아웃을 관리합니다.

예시

* Header
* Footer
* Navigation

---

## styles

전역 스타일 및 공통 스타일을 관리합니다.

---

# 화면 처리 흐름

```text
사용자 요청

↓

Page

↓

Layout

↓

Component

↓

UI 렌더링
```

---

# 컴포넌트 처리 흐름

```text
Page

↓

Layout

↓

Component

↓

Props 전달

↓

UI 렌더링
```

---

# 계층별 역할

| 계층         | 역할        |
| ---------- | --------- |
| Pages      | 페이지 및 라우팅 |
| Components | UI 컴포넌트   |
| Layouts    | 공통 레이아웃   |
| Styles     | 스타일 관리    |

---

# 설계 원칙

* 컴포넌트 단위로 UI 구성
* 공통 UI 재사용
* TypeScript 기반 타입 관리
* Layout을 통한 공통 구조 관리
* 유지보수가 쉬운 구조 설계
