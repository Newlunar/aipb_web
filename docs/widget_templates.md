# 위젯 템플릿 속성 정의 v1.1

## 1. 개요

위젯은 **Template(UI 형태)**와 **DataSource(데이터 매핑)**를 분리하여 정의합니다.

### 템플릿-데이터소스 분리 원칙

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

### 장점

- **재사용성**: 같은 템플릿으로 다양한 데이터 소스 표시 가능
- **유연성**: 데이터 매핑만 변경하여 새로운 위젯 생성
- **관심사 분리**: UI와 데이터 로직 분리

---

## 2. 액션 리스트 템플릿 (ActionListTemplate)

### 2.1 용도

- 테이블/그리드 형태의 고객 목록 표시
- 필터링/정렬/페이지네이션 지원
- 행 클릭 및 액션 버튼 지원

---

## 3. Template 정의

템플릿은 **UI 형태와 구조**만 정의합니다.

### 3.1 Template 스키마

```typescript
interface ActionListTemplate {
  // === 템플릿 식별 ===
  template_id: string;           // 템플릿 고유 ID
  template_type: "action_list";  // 템플릿 유형
  
  // === 제목 ===
  title: string;                 // 위젯 제목
  description?: string;          // 위젯 설명
  
  // === 레이아웃 ===
  size: {
    width: 1 | 2 | 3 | 4;        // 그리드 너비 (4열 기준)
    height?: number;             // 그리드 높이 (기본: 1)
  };
  
  // === 그리드 설정 ===
  grid: {
    show_header: boolean;        // 헤더 표시 여부
    row_height?: "compact" | "normal" | "comfortable";
    stripe?: boolean;            // 줄무늬 배경
    border?: boolean;            // 테두리
    hover_highlight?: boolean;   // 호버 시 강조
  };
  
  // === 필터 영역 ===
  filter_area: {
    enabled: boolean;
    position: "top" | "inline";  // 필터 위치
    show_search?: boolean;       // 검색창 표시
    show_reset?: boolean;        // 초기화 버튼
  };
  
  // === 페이지네이션 ===
  pagination: {
    enabled: boolean;
    position: "bottom" | "top" | "both";
    show_total?: boolean;        // 총 건수 표시
    show_page_size?: boolean;    // 페이지 크기 선택
    page_size_options?: number[];
  };
  
  // === 액션 영역 ===
  action_area: {
    enabled: boolean;
    position: "row" | "toolbar" | "both";
  };
  
  // === 클릭 동작 ===
  row_click: {
    enabled: boolean;
    action: "popup" | "navigate" | "expand" | "none";
  };
  
  // === 스타일 ===
  style?: {
    header_bg?: string;
    row_highlight_color?: string;
  };
}
```

### 3.2 Template 예시

```json
{
  "template_id": "action_list_default",
  "template_type": "action_list",
  "title": "",
  "description": "",
  
  "size": { "width": 2, "height": 1 },
  
  "grid": {
    "show_header": true,
    "row_height": "normal",
    "stripe": true,
    "border": true,
    "hover_highlight": true
  },
  
  "filter_area": {
    "enabled": true,
    "position": "top",
    "show_search": true,
    "show_reset": true
  },
  
  "pagination": {
    "enabled": true,
    "position": "bottom",
    "show_total": true,
    "show_page_size": true,
    "page_size_options": [10, 20, 50]
  },
  
  "action_area": {
    "enabled": true,
    "position": "row"
  },
  
  "row_click": {
    "enabled": true,
    "action": "popup"
  }
}
```

---

## 4. DataSource 정의

데이터소스는 **어떤 데이터를 가져와서 어떻게 표시할지** 정의합니다.

### 4.1 DataSource 스키마

```typescript
interface ActionListDataSource {
  // === 데이터소스 식별 ===
  datasource_id: string;         // 데이터소스 고유 ID
  name: string;                  // 데이터소스 이름
  
  // === 쿼리 설정 ===
  query: {
    base_table: "customer_scenario_events";
    
    // 시나리오 필터
    scenario_filter?: {
      categories?: string[];     // 예: ["asset", "relationship"]
      codes?: string[];          // 예: ["DEPOSIT_MATURITY", "BIRTHDAY"]
    };
    
    // 상태 필터
    status_filter?: ("pending" | "contacted" | "completed" | "dismissed")[];
    
    // 고객 그룹 필터
    customer_group_filter?: ("vip" | "general" | "prospect")[];
    
    // 담당 WM 필터 (null = 로그인 사용자)
    wm_filter?: string | null;
    
    // 날짜 범위
    date_range?: {
      type: "relative" | "absolute";
      relative_days?: { start: number; end: number };
      absolute_dates?: { start: string; end: string };
    };
  };
  
  // === 컬럼 바인딩 ===
  columns: ColumnBinding[];
  
  // === 사용자 필터 설정 ===
  filters: FilterConfig[];
  
  // === 기본 정렬 ===
  default_sort: {
    field: string;
    direction: "asc" | "desc";
  };
  
  // === 기본 페이지 크기 ===
  default_page_size: number;
  
  // === 행 액션 ===
  row_actions: RowAction[];
  
  // === 행 강조 규칙 ===
  row_highlight_rules?: {
    field: string;
    rules: { condition: string; color: string }[];
  };
}
```

### 4.2 ColumnBinding (컬럼 바인딩)

```typescript
interface ColumnBinding {
  key: string;                   // 컬럼 키
  label: string;                 // 컬럼 헤더
  
  // 데이터 소스
  source: "customer" | "scenario" | "event" | "account";
  field: string;                 // 필드명 (예: "name", "event_data.principal")
  
  // 표시 옵션
  width?: string;                // 너비 (예: "120px", "20%")
  align?: "left" | "center" | "right";
  
  // 포맷팅
  format?: {
    type: "text" | "number" | "currency" | "date" | "badge" | "progress";
    options?: Record<string, any>;
  };
  
  // 정렬 가능
  sortable?: boolean;
  
  // 클릭 가능
  clickable?: boolean;
}
```

### 4.3 FilterConfig (필터 설정)

```typescript
interface FilterConfig {
  key: string;                   // 필터 키
  label: string;                 // 필터 레이블
  type: "select" | "multi_select" | "date_range" | "search" | "number_range";
  
  // 옵션 (정적)
  options?: { value: string; label: string }[];
  
  // 옵션 (동적)
  dynamic_options?: {
    source: "scenarios" | "customers" | "users";
    value_field: string;
    label_field: string;
    filter?: Record<string, any>;
  };
  
  // 기본값
  default_value?: any;
  
  // 적용 대상
  target: {
    source: "customer" | "scenario" | "event";
    field: string;
  };
}
```

### 4.4 RowAction (행 액션)

```typescript
interface RowAction {
  key: string;                   // 액션 키
  label: string;                 // 버튼 레이블
  icon?: string;                 // 아이콘
  type: "call" | "message" | "email" | "popup" | "navigate" | "custom";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  visible_condition?: string;    // 조건부 표시
}
```

---

## 5. Widget Instance (위젯 인스턴스)

Template와 DataSource를 조합하여 실제 위젯을 생성합니다.

### 5.1 Widget Instance 스키마

```typescript
interface WidgetInstance {
  widget_id: string;             // 위젯 고유 ID
  template_id: string;           // 참조할 템플릿 ID
  datasource_id: string;         // 참조할 데이터소스 ID
  
  // 오버라이드 (템플릿 기본값 덮어쓰기)
  title_override?: string;       // 제목 오버라이드
  size_override?: { width?: number; height?: number };
  
  visible: boolean;              // 표시 여부
  created_at: string;
  updated_at: string;
}
```

### 5.2 관계도

```
┌──────────────────┐     ┌──────────────────┐
│    Template      │     │   DataSource     │
│──────────────────│     │──────────────────│
│ action_list_     │     │ ds_maturity      │
│ default          │     │ ds_no_contact    │
│                  │     │ ds_vip_risk      │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │    ┌───────────────────┤
         │    │                   │
         ▼    ▼                   ▼
┌──────────────────┐     ┌──────────────────┐
│ Widget Instance  │     │ Widget Instance  │
│──────────────────│     │──────────────────│
│ 만기 고객 목록    │     │ VIP 강등 위험    │
│ template: default│     │ template: default│
│ datasource:      │     │ datasource:      │
│   ds_maturity    │     │   ds_vip_risk    │
└──────────────────┘     └──────────────────┘
```

---

## 6. 예시: 만기 고객 목록 위젯

### 6.1 Template

```json
{
  "template_id": "action_list_default",
  "template_type": "action_list",
  "title": "고객 목록",
  
  "size": { "width": 2, "height": 1 },
  
  "grid": {
    "show_header": true,
    "row_height": "normal",
    "stripe": true,
    "hover_highlight": true
  },
  
  "filter_area": {
    "enabled": true,
    "position": "top",
    "show_search": true
  },
  
  "pagination": {
    "enabled": true,
    "position": "bottom",
    "show_total": true
  },
  
  "action_area": {
    "enabled": true,
    "position": "row"
  },
  
  "row_click": {
    "enabled": true,
    "action": "popup"
  }
}
```

### 6.2 DataSource

```json
{
  "datasource_id": "ds_maturity",
  "name": "만기 고객 데이터",
  
  "query": {
    "base_table": "customer_scenario_events",
    "scenario_filter": {
      "codes": ["DEPOSIT_MATURITY", "FUND_MATURITY", "ELS_MATURITY", "BOND_MATURITY"]
    },
    "status_filter": ["pending"],
    "wm_filter": null,
    "date_range": {
      "type": "relative",
      "relative_days": { "start": 0, "end": 30 }
    }
  },
  
  "columns": [
    {
      "key": "customer_name",
      "label": "고객명",
      "source": "customer",
      "field": "name",
      "width": "120px",
      "clickable": true
    },
    {
      "key": "grade",
      "label": "등급",
      "source": "customer",
      "field": "grade",
      "width": "80px",
      "format": { "type": "badge" }
    },
    {
      "key": "scenario",
      "label": "시나리오",
      "source": "scenario",
      "field": "name",
      "width": "120px"
    },
    {
      "key": "event_date",
      "label": "만기일",
      "source": "event",
      "field": "event_date",
      "width": "100px",
      "format": { "type": "date", "options": { "pattern": "MM/DD" } },
      "sortable": true
    },
    {
      "key": "principal",
      "label": "원금",
      "source": "event",
      "field": "event_data.principal",
      "width": "120px",
      "align": "right",
      "format": { "type": "currency" },
      "sortable": true
    }
  ],
  
  "filters": [
    {
      "key": "scenario",
      "label": "시나리오",
      "type": "multi_select",
      "dynamic_options": {
        "source": "scenarios",
        "value_field": "code",
        "label_field": "name",
        "filter": { "category": "asset" }
      },
      "target": { "source": "scenario", "field": "code" }
    },
    {
      "key": "customer_group",
      "label": "고객 그룹",
      "type": "select",
      "options": [
        { "value": "all", "label": "전체" },
        { "value": "vip", "label": "주요고객" },
        { "value": "general", "label": "일반" }
      ],
      "default_value": "all",
      "target": { "source": "customer", "field": "customer_group" }
    }
  ],
  
  "default_sort": { "field": "event_date", "direction": "asc" },
  "default_page_size": 10,
  
  "row_actions": [
    { "key": "call", "label": "전화", "icon": "phone", "type": "call", "variant": "primary" },
    { "key": "detail", "label": "상세", "icon": "info", "type": "popup", "variant": "ghost" }
  ],
  
  "row_highlight_rules": {
    "field": "priority",
    "rules": [
      { "condition": "priority == 1", "color": "#fef2f2" }
    ]
  }
}
```

### 6.3 Widget Instance

```json
{
  "widget_id": "widget_maturity_001",
  "template_id": "action_list_default",
  "datasource_id": "ds_maturity",
  "title_override": "만기 고객 목록",
  "visible": true
}
```

---

## 7. Supabase 테이블 구조

### 7.1 templates 테이블

```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(50) UNIQUE NOT NULL,
    template_type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    config JSONB NOT NULL,  -- grid, filter_area, pagination 등
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.2 datasources 테이블

```sql
CREATE TABLE datasources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    datasource_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    config JSONB NOT NULL,  -- query, columns, filters 등
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.3 widget_instances 테이블

```sql
CREATE TABLE widget_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_id VARCHAR(50) UNIQUE NOT NULL,
    template_id VARCHAR(50) NOT NULL REFERENCES templates(template_id),
    datasource_id VARCHAR(50) NOT NULL REFERENCES datasources(datasource_id),
    title_override VARCHAR(200),
    size_override JSONB,
    visible BOOLEAN DEFAULT true,
    created_by VARCHAR(20) REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Source 별 필드 매핑

| source | 테이블 | 사용 가능 필드 |
|--------|--------|----------------|
| customer | customers | id, name, phone, email, customer_group, grade, total_aum |
| scenario | scenarios | code, name, category, priority, color, icon |
| event | customer_scenario_events | event_date, event_data.*, status, priority, notes |
| account | accounts | account_number, account_type, product_name, balance, maturity_date |

---

## 9. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-01-30 | 최초 작성 |
| 1.1 | 2026-01-30 | Template/DataSource 분리 구조로 변경 |
