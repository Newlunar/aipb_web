# AI 자산관리 비서 - React + Supabase 구현 가이드

> 이 문서는 React + Supabase 기술 스택으로 구현된 프로젝트의 상세 구현 사항을 기술합니다.

## 1. 기술 스택

### 1.1 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.x | UI 라이브러리 |
| Vite | 7.x | 빌드 도구 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.x | 스타일링 |
| React Router | 6.x | 라우팅 |
| TanStack Query | 5.x | 서버 상태 관리 |
| Lucide React | - | 아이콘 |

### 1.2 백엔드

| 기술 | 용도 |
|------|------|
| Supabase | BaaS (PostgreSQL, Auth, Storage) |
| PostgREST | REST API 자동 생성 |
| Row Level Security | 데이터 접근 제어 |

---

## 2. 프로젝트 구조

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   ├── widgets/
│   │   │   ├── ActionList/
│   │   │   │   ├── ActionListWidget.tsx
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── ui/                    # (예정) 공통 UI 컴포넌트
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   ├── data/
│   │   └── mockData.ts            # 목 데이터
│   ├── hooks/
│   │   ├── useWidgetData.ts       # 위젯 데이터 훅
│   │   ├── useDashboardStats.ts   # 대시보드 통계 훅
│   │   └── index.ts
│   ├── lib/
│   │   └── supabase.ts            # Supabase 클라이언트
│   ├── pages/
│   │   └── Dashboard.tsx          # 대시보드 페이지
│   ├── types/
│   │   └── database.ts            # 데이터베이스 타입
│   ├── App.tsx
│   ├── index.css                  # 글로벌 스타일 + Tailwind
│   └── main.tsx
├── .env                           # 환경변수
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. 환경 설정

### 3.1 환경변수

```bash
# .env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3.2 Vite 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 3.3 Tailwind 테마

```css
/* src/index.css */
@import "tailwindcss";

:root {
  --color-primary: #F47920;
  --color-primary-dark: #E06810;
  --color-secondary: #002B5B;
  --color-secondary-light: #1E4A7A;
}

@theme {
  --color-primary: var(--color-primary);
  --color-primary-dark: var(--color-primary-dark);
  --color-secondary: var(--color-secondary);
  --color-secondary-light: var(--color-secondary-light);
}
```

---

## 4. Supabase 연동

### 4.1 클라이언트 설정

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 4.2 타입 정의

```typescript
// src/types/database.ts
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          customer_group: 'vip' | 'general' | 'prospect'
          grade: string | null
          total_aum: number
          // ...
        }
      }
      scenarios: {
        Row: {
          id: string
          code: string
          name: string
          category: string
          // ...
        }
      }
      customer_scenario_events: {
        Row: {
          id: string
          customer_id: string
          scenario_id: string
          event_date: string
          event_data: Record<string, any>
          status: 'pending' | 'contacted' | 'completed' | 'dismissed'
          // ...
        }
      }
      // ... 기타 테이블
    }
  }
}
```

### 4.3 데이터 조회 패턴

```typescript
// 기본 조회
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('wm_id', wmId)

// 관계 조회 (JOIN)
const { data, error } = await supabase
  .from('customer_scenario_events')
  .select(`
    *,
    customers (id, name, grade, customer_group, total_aum),
    scenarios (code, name, category, color)
  `)
  .in('scenario_id', scenarioIds)
  .eq('status', 'pending')
  .order('event_date', { ascending: true })
  .limit(50)
```

---

## 5. 커스텀 훅

### 5.1 useWidgetData

```typescript
// src/hooks/useWidgetData.ts
interface UseWidgetDataOptions {
  scenarioCodes?: string[]
  status?: string[]
  limit?: number
}

export function useWidgetData(options: UseWidgetDataOptions) {
  const [data, setData] = useState<ActionListData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // 1. 시나리오 코드로 ID 조회
      // 2. 이벤트 데이터 조회 (고객, 시나리오 JOIN)
      // 3. 데이터 변환
    }
    fetchData()
  }, [JSON.stringify(options)])

  return { data, isLoading, error, refetch: fetchData }
}

// 파생 훅
export const useMaturityData = () => useWidgetData({
  scenarioCodes: ['DEPOSIT_MATURITY', 'FUND_MATURITY', 'ELS_MATURITY'],
  status: ['pending'],
  limit: 50
})

export const useNoContactData = () => useWidgetData({
  scenarioCodes: ['LONG_NO_CONTACT'],
  status: ['pending'],
  limit: 50
})
```

### 5.2 useDashboardStats

```typescript
// src/hooks/useDashboardStats.ts
interface DashboardStats {
  totalCustomers: number
  totalAum: number
  todaySchedules: number
  urgentActions: number
  vipUrgentCount: number
}

export function useDashboardStats() {
  // 고객 통계 및 이벤트 통계 조회
  // ...
}
```

---

## 6. 컴포넌트 구현

### 6.1 Layout 컴포넌트

```typescript
// src/components/layout/Layout.tsx
export function Layout({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState('/')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 6.2 ActionListWidget 컴포넌트

```typescript
// src/components/widgets/ActionList/ActionListWidget.tsx
interface ActionListWidgetProps {
  title: string
  data: ActionListData[]
  templateConfig: ActionListTemplateConfig
  dataSourceConfig: ActionListDataSourceConfig
  isLoading?: boolean
  onRowClick?: (row: ActionListData) => void
  onAction?: (action: string, row: ActionListData) => void
}

export function ActionListWidget({
  title,
  data,
  templateConfig,
  dataSourceConfig,
  isLoading,
  onRowClick,
  onAction
}: ActionListWidgetProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState(dataSourceConfig.default_sort.field)
  
  // 필터링, 정렬, 페이지네이션 로직
  // 렌더링
}
```

---

## 7. Supabase 프로젝트 정보

### 7.1 프로젝트 설정

| 항목 | 값 |
|------|-----|
| Project ID | `wedncjxqcywayomokgzu` |
| Region | Northeast Asia (Seoul) |
| URL | `https://wedncjxqcywayomokgzu.supabase.co` |

### 7.2 테이블 목록

| 테이블 | 레코드 수 | 설명 |
|--------|----------|------|
| users | 3 | WM 사용자 |
| scenarios | 41 | 시나리오 마스터 |
| customers | 8 | 고객 |
| accounts | 10 | 계좌 |
| securities | 5 | 증권 |
| customer_holdings | 8 | 보유 현황 |
| customer_scenario_events | 12 | 이벤트 |
| templates | 1 | 위젯 템플릿 |
| datasources | 3 | 데이터소스 |
| widget_instances | 3 | 위젯 인스턴스 |

---

## 8. 개발 명령어

```bash
# 의존성 설치
cd frontend
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:5173

# 빌드
npm run build

# 미리보기
npm run preview

# 타입 체크
npm run typecheck

# 린트
npm run lint
```

---

## 9. 배포 가이드

### 9.1 Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 9.2 환경변수 설정

Vercel 대시보드에서 환경변수 설정:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 9.3 빌드 설정

| 항목 | 값 |
|------|-----|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## 10. 향후 개발 계획

### 10.1 Phase 1 계속

- [ ] UI 세부 조정
  - [ ] 반응형 레이아웃
  - [ ] 다크모드
  - [ ] 스켈레톤 로딩
  - [ ] 토스트 알림
  
- [ ] 위젯 설정 페이지
  - [ ] 위젯 CRUD
  - [ ] 드래그앤드롭 레이아웃

- [ ] 추가 위젯
  - [ ] BarChartWidget
  - [ ] CalendarWidget
  - [ ] FeedWidget

### 10.2 Phase 2

- [ ] Supabase Auth 연동
- [ ] RLS 설정
- [ ] 프로덕션 배포

---

## 11. 트러블슈팅

### 11.1 Supabase 쿼리 필터 이슈

**문제**: 관계 테이블의 필드로 직접 필터링 불가

```typescript
// ❌ 작동 안함
.in('scenarios.code', scenarioCodes)

// ✅ 해결: 2단계 쿼리
const scenarioIds = await getScenarioIds(scenarioCodes)
.in('scenario_id', scenarioIds)
```

### 11.2 환경변수 로드 이슈

**문제**: Vite에서 환경변수가 로드되지 않음

```typescript
// ❌ 작동 안함
process.env.SUPABASE_URL

// ✅ 해결: Vite 전용 prefix 사용
import.meta.env.VITE_SUPABASE_URL
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-01-30 | 최초 작성 |
