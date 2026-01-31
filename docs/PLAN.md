# AI 자산관리 비서 웹 대시보드 - 작업 이력

## 프로젝트 개요

- **프로젝트명**: AI 자산관리 비서 웹 대시보드 (AIPB Web)
- **목적**: WM(Wealth Manager)을 위한 고객 관리 및 업무 지원 대시보드
- **시작일**: 2026-01-30
- **Supabase 프로젝트 ID**: `wedncjxqcywayomokgzu`

---

## Phase 0: 데이터 모델 및 백엔드 설정

### 0.1 시나리오 기반 데이터 모델 설계 ✅

- **완료일**: 2026-01-30
- **산출물**: `docs/scenario_model.md`
- **내용**:
  - 위젯 중심 → 시나리오 중심 모델로 재설계
  - 7개 시나리오 카테고리 정의:
    - `account`: 계좌 관련 (예금만기, 펀드만기 등)
    - `asset`: 자산 관련 (자산감소, 급등/급락 종목 등)
    - `transaction`: 입출금 관련 (대량입금, 대량출금 등)
    - `trading`: 매매 관련 (과다매매, 손실과다 등)
    - `activity`: 고객활동 (검색종목, 관심컨텐츠 등)
    - `relationship`: 고객관계 (생일, 기념일, 장기미접촉 등)
    - `opportunity`: 영업기회 (신상품추천, VIP승급기회 등)
  - 11개 엔티티 정의
  - 커스텀 ID 포맷 적용:
    - customer_id: `c` + 8자리 숫자 (예: c00000001)
    - account_id: 3-6자리 형식 (예: 123-456789)
    - wm_id: `w33` + 6자리 숫자 (예: w33000001)

### 0.2 Supabase 테이블 생성 ✅

- **완료일**: 2026-01-30
- **생성 테이블** (11개):

| 테이블 | 설명 | PK 타입 |
|--------|------|---------|
| `users` | WM/관리자 정보 | VARCHAR (w33xxxxxx) |
| `scenarios` | 시나리오 마스터 | UUID |
| `customers` | 고객 정보 | VARCHAR (cxxxxxxxx) |
| `accounts` | 계좌 정보 | VARCHAR (xxx-xxxxxx) |
| `securities` | 증권 정보 | UUID |
| `customer_holdings` | 고객 보유 현황 | UUID |
| `customer_scenario_events` | 고객별 이벤트 | UUID |
| `action_logs` | 활동 로그 | UUID |
| `feeds` | 피드/시그널 | UUID |
| `feed_scenario_tags` | 피드-시나리오 연결 | UUID |
| `security_feeds` | 증권-피드 연결 | UUID |

- **인덱스**: 
  - `GIN(event_data)` - JSONB 검색 최적화
  - 주요 FK 컬럼 인덱스

### 0.3 시나리오 마스터 데이터 입력 ✅

- **완료일**: 2026-01-30
- **입력 건수**: 41개 시나리오
- **카테고리별 분포**:

| 카테고리 | 건수 | 주요 시나리오 |
|----------|------|---------------|
| account | 4 | DEPOSIT_MATURITY, FUND_MATURITY, ELS_MATURITY, BOND_MATURITY |
| asset | 11 | AUM_DECREASE, LARGE_WITHDRAWAL, STOCK_SURGE, EXCESSIVE_LOSS 등 |
| transaction | 4 | LARGE_DEPOSIT, LARGE_WITHDRAWAL, RECURRING_TRANSFER, UNUSUAL_TRANSACTION |
| trading | 4 | EXCESSIVE_TRADING, HIGH_TURNOVER, CONCENTRATED_POSITION, MARGIN_WARNING |
| activity | 4 | SEARCH_STOCK, INTEREST_CONTENT, APP_LOGIN_PATTERN, PAGE_VIEW_PATTERN |
| relationship | 6 | BIRTHDAY, ANNIVERSARY, LONG_NO_CONTACT, VIP_DOWNGRADE_RISK 등 |
| opportunity | 8 | NEW_PRODUCT_FIT, PORTFOLIO_REBALANCE, TAX_SAVING, VIP_UPGRADE_CHANCE 등 |

### 0.4 샘플 데이터 입력 ✅

- **완료일**: 2026-01-30
- **입력 데이터**:

| 테이블 | 건수 |
|--------|------|
| users | 3 |
| customers | 8 |
| accounts | 10 |
| securities | 5 |
| customer_holdings | 8 |
| customer_scenario_events | 12 |
| feeds | 3 |
| security_feeds | 2 |

### 0.5 위젯 템플릿 정의 ✅

- **완료일**: 2026-01-30
- **산출물**: `docs/widget_templates.md`
- **구조**: Template/DataSource 분리 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Widget Instance                          │
├─────────────────────────────────────────────────────────────┤
│  Template (UI 형태)        +      DataSource (데이터 매핑)   │
│       ↓                              ↓                      │
│  - title                         - 쿼리 조건                │
│  - 그리드 구조                    - 컬럼 바인딩              │
│  - 공통 UI 요소                   - 필터 설정               │
│  - 스타일/레이아웃                - 정렬/페이지네이션         │
└─────────────────────────────────────────────────────────────┘
```

- **Supabase 테이블**:
  - `templates` - UI 형태 정의
  - `datasources` - 데이터 매핑 정의
  - `widget_instances` - Template + DataSource 조합

- **샘플 위젯**: 
  - 만기 고객 목록
  - 장기 미접촉 고객
  - VIP 강등 위험 고객

---

## Phase 1: 프론트엔드 구현

### 1.1 프로젝트 초기화 ✅

- **완료일**: 2026-01-30
- **경로**: `frontend/`
- **기술 스택**:
  - React 18 + Vite 7.x + TypeScript
  - Tailwind CSS 4.x (@tailwindcss/vite)
  - @supabase/supabase-js
  - lucide-react (아이콘)
  - react-router-dom
  - @tanstack/react-query

### 1.2 미래에셋 브랜드 테마 적용 ✅

- **완료일**: 2026-01-30
- **참고**: https://webzine.securities.miraeasset.com/webzine2601/
- **색상 팔레트**:

| 용도 | 색상 코드 | 설명 |
|------|-----------|------|
| Primary | #F47920 | 오렌지 (버튼, 강조) |
| Primary Dark | #E06810 | 오렌지 다크 |
| Primary Light | #FF9950 | 오렌지 라이트 |
| Secondary | #002B5B | 네이비 (사이드바, 헤더) |
| Secondary Dark | #001E40 | 네이비 다크 |
| Secondary Light | #1E4A7A | 네이비 라이트 |
| Accent | #00A0E9 | 블루 |

- **폰트**: Pretendard (CDN)

### 1.3 공통 컴포넌트 구현 ✅

- **완료일**: 2026-01-30
- **컴포넌트**:

| 컴포넌트 | 파일 | 기능 |
|----------|------|------|
| Layout | `components/layout/Layout.tsx` | 전체 레이아웃 (Sidebar + Header + Content) |
| Sidebar | `components/layout/Sidebar.tsx` | 접기/펼치기 네비게이션, 메뉴 뱃지 |
| Header | `components/layout/Header.tsx` | 검색, 알림, 사용자 메뉴 드롭다운 |

### 1.4 ActionList 위젯 구현 ✅

- **완료일**: 2026-01-30
- **파일**: `components/widgets/ActionList/`
- **기능**:
  - 테이블 형태 고객 목록 표시
  - 검색 및 필터링 (고객 그룹 등)
  - 정렬 (오름차순/내림차순)
  - 페이지네이션 (페이지 크기 선택)
  - 행 액션 버튼 (전화, 문자, 상세)
  - 뱃지 포맷팅 (등급, 상태별 색상)
  - 통화 포맷팅 (억/만 단위)

### 1.5 대시보드 페이지 구현 ✅

- **완료일**: 2026-01-30
- **파일**: `pages/Dashboard.tsx`
- **구성**:
  - 요약 카드 4개:
    - 관리 고객 (명)
    - 총 AUM (억)
    - 오늘 일정 (건)
    - 긴급 조치 (건, VIP 포함)
  - 만기 고객 목록 위젯
  - 장기 미접촉 고객 위젯
  - VIP 강등 위험 위젯
  - 오늘의 일정 (플레이스홀더)

### 1.6 Supabase 연동 ✅

- **완료일**: 2026-01-30
- **환경 설정**: `frontend/.env`

```
VITE_SUPABASE_URL=https://wedncjxqcywayomokgzu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

- **구현 hooks**:

| Hook | 파일 | 용도 |
|------|------|------|
| useWidgetData | `hooks/useWidgetData.ts` | 범용 이벤트 데이터 조회 |
| useMaturityData | `hooks/useWidgetData.ts` | 만기 고객 데이터 |
| useNoContactData | `hooks/useWidgetData.ts` | 미접촉 고객 데이터 |
| useVipRiskData | `hooks/useWidgetData.ts` | VIP 강등 위험 데이터 |
| useDashboardStats | `hooks/useDashboardStats.ts` | 대시보드 통계 |

- **쿼리 최적화**:
  - 시나리오 코드로 ID 먼저 조회 후 이벤트 필터링
  - 에러 발생 시 목 데이터로 폴백

### 1.7 UI 세부 조정 ✅

- **완료일**: 2026-01-31
- **작업 내용**:

#### 위젯 템플릿 규격 정의

| 위젯 유형 | 가로 규격 | 세로 규격 |
|----------|----------|----------|
| 요약 카드 (SummaryCard) | 5열 그리드 기준 1칸 | 자동 |
| 액션리스트 (ActionListWidget) | 3칸 또는 2칸 | 260px 고정 |
| 일정 위젯 | 3칸 | 260px 고정 |

#### 전역 고객 그룹 필터

- **파일**: `contexts/FilterContext.tsx`
- **기능**: 헤더에서 선택한 고객 그룹이 모든 위젯에 공통 적용
- **옵션**: 전체 고객, VIP 고객, 주요 고객, 일반 고객, 잠재 고객

#### 헤더 레이아웃 변경

- **배경색**: 주황색 (`bg-primary`)
- **구성**: 타이틀 + 부제 | 고객 그룹 필터 | 알림 아이콘 | 프로필
- **텍스트**: 흰색 계열

#### 사이드바 개선

- **배경색**: 네이비 → 흰색 (`bg-white`)
- **선택 상태**: 옅은 회색 배경 + 주황색 텍스트
- **로고 영역**:
  - 상단: "AI자산관리비서" (작은 회색)
  - 하단: "투자전략 Web" (굵은 검정)
- **폰트 크기**: `text-sm` → `text-base` (약 14% 증가)
- **너비**: `w-60` → `w-52` (240px → 208px)
- **아이콘 크기**: 24px 통일

#### 콘텐츠 영역

- 헤더와 콘텐츠 사이 24px 간격 (흰색 배경)
- 콘텐츠 영역 패딩: 24px
- 위젯 컨테이너: 흰색 배경 + 둥근 모서리 + 그림자

---

## 대기 중인 작업

### Phase 1 계속 (우선순위순)

| 우선 | 항목 | 설명 | 상태 |
|------|------|------|------|
| ✅ | 1.7 UI 세부 조정 | 컴포넌트 스타일링, 레이아웃 규격, 전역 필터 | 완료 |
| 🔴 | 1.8 위젯 설정 페이지 | 위젯 CRUD, 템플릿/데이터소스 관리, 대시보드 레이아웃 편집 | ⏳ |
| 🟡 | 1.9 추가 위젯 | 바 차트, 캘린더, 피드 위젯 | ⏳ |
| 🟡 | 1.10 고객 상세 | 고객 정보, 계좌, 이벤트 이력 | ⏳ |
| 🟢 | 1.11 라우팅 | React Router, 다른 페이지 | ⏳ |

#### 1.7 UI 세부 조정 (추가 가능)

- [ ] 반응형 레이아웃 (모바일/태블릿/데스크톱)
- [ ] 다크모드 지원
- [ ] 로딩 스켈레톤 UI
- [ ] 토스트/알림 컴포넌트
- [ ] 모달/다이얼로그 컴포넌트
- [ ] 폼 컴포넌트 (Input, Select, DatePicker 등)
- [ ] 애니메이션 효과 (트랜지션, 호버)
- [ ] 접근성(a11y) 개선

#### 1.8 위젯 설정 페이지 상세

- [ ] 위젯 목록 조회/검색
- [ ] 위젯 생성 마법사
  - 템플릿 선택
  - 데이터소스 설정
  - 컬럼/필터 설정
  - 미리보기
- [ ] 위젯 수정/삭제
- [ ] 대시보드 레이아웃 편집 (드래그앤드롭)
- [ ] 위젯 복제 기능
- [ ] 템플릿 관리 (Admin)
- [ ] 데이터소스 관리 (Admin)

### Phase 2: 보안 및 배포

| 우선 | 항목 | 설명 | 상태 |
|------|------|------|------|
| 🟡 | 2.1 RLS 설정 | 권한별 데이터 접근 제어 | ⏳ |
| 🟡 | 2.2 인증 구현 | Supabase Auth 연동 | ⏳ |
| 🟢 | 2.3 배포 | Vercel/Netlify 배포 | ⏳ |

---

## 프로젝트 구조

```
aipb_web_e/
├── docs/
│   ├── PRD.md                    # 요구사항 정의서 (레거시)
│   ├── scenario_model.md         # 데이터 모델 문서 (레거시)
│   ├── widget_templates.md       # 위젯 템플릿 정의 (레거시)
│   ├── PLAN.md                   # 작업 이력 (이 파일)
│   │
│   │ # 기술 독립적 문서 (다른 스택에서도 활용 가능)
│   ├── DOMAIN_SPEC.md            # 도메인 명세서 (비즈니스 로직, 시나리오)
│   ├── DATABASE_SCHEMA.md        # 데이터베이스 스키마 (표준 SQL)
│   ├── UI_SPEC.md                # UI/UX 명세서 (디자인 시스템, 화면 설계)
│   │
│   │ # 프로젝트 특정 문서
│   └── IMPLEMENTATION_REACT_SUPABASE.md  # React+Supabase 구현 가이드
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Layout, Sidebar, Header
│   │   │   └── widgets/          # ActionListWidget
│   │   ├── contexts/             # FilterContext (전역 필터)
│   │   ├── data/                 # mockData.ts
│   │   ├── hooks/                # useWidgetData, useDashboardStats
│   │   ├── lib/                  # supabase.ts
│   │   ├── pages/                # Dashboard.tsx
│   │   └── types/                # database.ts
│   ├── .env                      # Supabase 환경변수
│   ├── .env.example              # 환경변수 예시
│   └── index.html
└── (Python 백엔드 - 미사용)
```

---

## 개발 서버 실행

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

---

## 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-01-30 | 0.1.0 | Phase 0 완료 (데이터 모델, Supabase 설정) |
| 2026-01-30 | 0.2.0 | Phase 1.1-1.6 완료 (프론트엔드 기본 구현) |
| 2026-01-31 | 0.3.0 | Phase 1.7 완료 (UI 세부 조정, 레이아웃 규격, 전역 필터) |
