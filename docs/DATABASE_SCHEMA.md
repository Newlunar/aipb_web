# AI 자산관리 비서 - 데이터베이스 스키마

> 이 문서는 표준 SQL 기반의 데이터베이스 스키마를 정의합니다.
> PostgreSQL, MySQL, SQLite 등 다양한 RDBMS에 적용 가능합니다.

## 1. ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ email           │
│ name            │
│ role            │
│ permission_level│
│ branch_id       │
└────────┬────────┘
         │
         │ 1:N (담당)
         ▼
┌─────────────────┐       ┌─────────────────┐
│   customers     │       │   scenarios     │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ name            │       │ code (UK)       │
│ customer_group  │       │ name            │
│ grade           │       │ category        │
│ total_aum       │       │ priority        │
│ wm_id (FK)      │───┐   │ data_schema     │
└────────┬────────┘   │   └────────┬────────┘
         │            │            │
         │ 1:N        │            │
         ▼            │            │
┌─────────────────┐   │            │
│    accounts     │   │            │
│─────────────────│   │            │
│ id (PK)         │   │            │
│ customer_id(FK) │   │            │
│ account_type    │   │            │
│ product_name    │   │            │
│ balance         │   │            │
│ maturity_date   │   │            │
└────────┬────────┘   │            │
         │            │            │
         │            │            │
         ▼            ▼            ▼
┌─────────────────────────────────────────┐
│       customer_scenario_events          │
│─────────────────────────────────────────│
│ id (PK)                                 │
│ customer_id (FK) ───────────────────────│
│ scenario_id (FK) ───────────────────────│
│ account_id (FK, nullable)               │
│ event_date                              │
│ event_data (JSON)                       │
│ status                                  │
│ priority                                │
│ assigned_wm_id (FK)                     │
└─────────────────────────────────────────┘
```

---

## 2. 테이블 정의

### 2.1 users (사용자)

```sql
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,              -- w33000001 형식
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    employee_code VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'viewer',
    permission_level INTEGER NOT NULL DEFAULT 5,
    branch_id VARCHAR(20),
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_users_role CHECK (role IN ('admin', 'wm', 'viewer')),
    CONSTRAINT chk_users_permission CHECK (permission_level BETWEEN 1 AND 5)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch ON users(branch_id);
CREATE INDEX idx_users_active ON users(is_active);
```

### 2.2 scenarios (시나리오 마스터)

```sql
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- 또는 AUTO_INCREMENT
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL DEFAULT 3,
    color VARCHAR(20),
    icon VARCHAR(50),
    data_schema JSON,                        -- 시나리오별 필요 데이터 스키마
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_scenarios_category CHECK (
        category IN ('account', 'asset', 'transaction', 'trading', 
                     'activity', 'relationship', 'opportunity')
    ),
    CONSTRAINT chk_scenarios_priority CHECK (priority BETWEEN 1 AND 5)
);

CREATE INDEX idx_scenarios_category ON scenarios(category);
CREATE INDEX idx_scenarios_active ON scenarios(is_active);
```

### 2.3 customers (고객)

```sql
CREATE TABLE customers (
    id VARCHAR(20) PRIMARY KEY,              -- c00000001 형식
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    customer_group VARCHAR(20) NOT NULL DEFAULT 'general',
    grade VARCHAR(20),
    total_aum DECIMAL(18, 2) NOT NULL DEFAULT 0,
    wm_id VARCHAR(20),
    birth_date DATE,
    join_date DATE,
    last_contact_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_customers_wm FOREIGN KEY (wm_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_customers_group CHECK (
        customer_group IN ('vip', 'general', 'prospect')
    )
);

CREATE INDEX idx_customers_wm ON customers(wm_id);
CREATE INDEX idx_customers_group ON customers(customer_group);
CREATE INDEX idx_customers_grade ON customers(grade);
```

### 2.4 accounts (계좌)

```sql
CREATE TABLE accounts (
    id VARCHAR(20) PRIMARY KEY,              -- 123-456789 형식
    customer_id VARCHAR(20) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    product_name VARCHAR(200),
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    maturity_date DATE,
    interest_rate DECIMAL(5, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    opened_at DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_accounts_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT chk_accounts_type CHECK (
        account_type IN ('deposit', 'savings', 'fund', 'stock', 
                         'wrap', 'els', 'bond', 'pension', 'isa')
    ),
    CONSTRAINT chk_accounts_status CHECK (
        status IN ('active', 'dormant', 'closed')
    )
);

CREATE INDEX idx_accounts_customer ON accounts(customer_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_maturity ON accounts(maturity_date);
```

### 2.5 securities (증권)

```sql
CREATE TABLE securities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,        -- 종목코드
    name VARCHAR(200) NOT NULL,
    security_type VARCHAR(20) NOT NULL,
    market VARCHAR(20),
    sector VARCHAR(50),
    current_price DECIMAL(18, 2),
    price_updated_at TIMESTAMP WITH TIME ZONE,
    metadata JSON,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_securities_type CHECK (
        security_type IN ('stock', 'etf', 'bond', 'fund', 'els', 'dls')
    )
);

CREATE INDEX idx_securities_code ON securities(code);
CREATE INDEX idx_securities_type ON securities(security_type);
```

### 2.6 customer_holdings (고객 보유 현황)

```sql
CREATE TABLE customer_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(20) NOT NULL,
    account_id VARCHAR(20) NOT NULL,
    security_id UUID NOT NULL,
    quantity DECIMAL(18, 4) NOT NULL,
    avg_price DECIMAL(18, 2) NOT NULL,
    current_value DECIMAL(18, 2),
    profit_loss DECIMAL(18, 2),
    profit_loss_rate DECIMAL(8, 4),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_holdings_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_holdings_account FOREIGN KEY (account_id) 
        REFERENCES accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_holdings_security FOREIGN KEY (security_id) 
        REFERENCES securities(id) ON DELETE CASCADE
);

CREATE INDEX idx_holdings_customer ON customer_holdings(customer_id);
CREATE INDEX idx_holdings_account ON customer_holdings(account_id);
CREATE INDEX idx_holdings_security ON customer_holdings(security_id);
```

### 2.7 customer_scenario_events (고객 시나리오 이벤트)

```sql
CREATE TABLE customer_scenario_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(20) NOT NULL,
    scenario_id UUID NOT NULL,
    account_id VARCHAR(20),
    event_date DATE NOT NULL,
    event_data JSON,                         -- 시나리오별 상세 데이터
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority INTEGER NOT NULL DEFAULT 3,
    assigned_wm_id VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_events_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_scenario FOREIGN KEY (scenario_id) 
        REFERENCES scenarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_account FOREIGN KEY (account_id) 
        REFERENCES accounts(id) ON DELETE SET NULL,
    CONSTRAINT fk_events_wm FOREIGN KEY (assigned_wm_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_events_status CHECK (
        status IN ('pending', 'contacted', 'completed', 'dismissed')
    ),
    CONSTRAINT chk_events_priority CHECK (priority BETWEEN 1 AND 5)
);

CREATE INDEX idx_events_customer ON customer_scenario_events(customer_id);
CREATE INDEX idx_events_scenario ON customer_scenario_events(scenario_id);
CREATE INDEX idx_events_status ON customer_scenario_events(status);
CREATE INDEX idx_events_date ON customer_scenario_events(event_date);
CREATE INDEX idx_events_wm ON customer_scenario_events(assigned_wm_id);
CREATE INDEX idx_events_data ON customer_scenario_events USING GIN (event_data);  -- PostgreSQL
```

### 2.8 action_logs (활동 로그)

```sql
CREATE TABLE action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    action_data JSON,
    result VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_logs_event FOREIGN KEY (event_id) 
        REFERENCES customer_scenario_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_logs_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_logs_action CHECK (
        action_type IN ('call', 'message', 'email', 'visit', 'branch_visit', 
                        'status_change', 'assign', 'note')
    )
);

CREATE INDEX idx_logs_event ON action_logs(event_id);
CREATE INDEX idx_logs_user ON action_logs(user_id);
CREATE INDEX idx_logs_type ON action_logs(action_type);
CREATE INDEX idx_logs_created ON action_logs(created_at);
```

### 2.9 feeds (피드/시그널)

```sql
CREATE TABLE feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_type VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    source VARCHAR(100),
    url VARCHAR(500),
    published_at TIMESTAMP WITH TIME ZONE,
    importance INTEGER DEFAULT 3,
    metadata JSON,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_feeds_type CHECK (
        feed_type IN ('news', 'report', 'signal', 'alert', 'notice')
    )
);

CREATE INDEX idx_feeds_type ON feeds(feed_type);
CREATE INDEX idx_feeds_published ON feeds(published_at);
```

### 2.10 templates (위젯 템플릿)

```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(50) UNIQUE NOT NULL,
    template_type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    config JSON NOT NULL,                    -- UI 설정
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_templates_type CHECK (
        template_type IN ('action_list', 'bar_chart', 'pie_chart', 'line_chart',
                          'calendar', 'feed', 'card', 'status', 'query', 'memo')
    )
);

CREATE INDEX idx_templates_type ON templates(template_type);
CREATE INDEX idx_templates_active ON templates(is_active);
```

### 2.11 datasources (데이터소스)

```sql
CREATE TABLE datasources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    datasource_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    config JSON NOT NULL,                    -- 쿼리, 컬럼, 필터 설정
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_datasources_active ON datasources(is_active);
```

### 2.12 widget_instances (위젯 인스턴스)

```sql
CREATE TABLE widget_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_id VARCHAR(50) UNIQUE NOT NULL,
    template_id VARCHAR(50) NOT NULL,
    datasource_id VARCHAR(50) NOT NULL,
    title_override VARCHAR(200),
    size_override JSON,
    position JSON,                           -- 대시보드 내 위치
    visible BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_widgets_template FOREIGN KEY (template_id) 
        REFERENCES templates(template_id),
    CONSTRAINT fk_widgets_datasource FOREIGN KEY (datasource_id) 
        REFERENCES datasources(datasource_id),
    CONSTRAINT fk_widgets_user FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_widgets_template ON widget_instances(template_id);
CREATE INDEX idx_widgets_datasource ON widget_instances(datasource_id);
CREATE INDEX idx_widgets_user ON widget_instances(created_by);
```

---

## 3. event_data JSON 스키마 예시

### 3.1 예금 만기 (DEPOSIT_MATURITY)

```json
{
  "principal": 500000000,
  "interest_rate": 3.5,
  "maturity_date": "2026-02-15",
  "product_name": "정기예금 1년",
  "expected_interest": 17500000
}
```

### 3.2 장기 미접촉 (LONG_NO_CONTACT)

```json
{
  "days_since_contact": 45,
  "last_contact_date": "2025-12-16",
  "last_contact_type": "call",
  "recommended_action": "전화 상담"
}
```

### 3.3 VIP 강등 위험 (VIP_DOWNGRADE_RISK)

```json
{
  "current_aum": 950000000,
  "threshold": 1000000000,
  "shortfall": 50000000,
  "current_grade": "Gold",
  "downgrade_to": "Silver",
  "evaluation_date": "2026-03-01"
}
```

### 3.4 급등 종목 보유 (STOCK_SURGE)

```json
{
  "stock_code": "005930",
  "stock_name": "삼성전자",
  "quantity": 1000,
  "avg_price": 70000,
  "current_price": 85000,
  "return_rate": 21.4,
  "holding_value": 85000000
}
```

---

## 4. 시나리오 마스터 데이터

```sql
-- 계좌 카테고리
INSERT INTO scenarios (code, name, category, priority, color, icon, data_schema) VALUES
('DEPOSIT_MATURITY', '정기예금 만기', 'account', 2, '#F59E0B', 'calendar', 
 '{"principal": "number", "interest_rate": "number", "maturity_date": "date"}'),
('FUND_MATURITY', '펀드 만기', 'account', 2, '#3B82F6', 'trending-up',
 '{"principal": "number", "fund_name": "string", "maturity_date": "date"}'),
('ELS_MATURITY', 'ELS 만기', 'account', 2, '#10B981', 'bar-chart',
 '{"principal": "number", "product_name": "string", "expected_return": "number"}'),
('BOND_MATURITY', '채권 만기', 'account', 2, '#8B5CF6', 'file-text',
 '{"principal": "number", "bond_name": "string", "yield_rate": "number"}');

-- 관계 카테고리
INSERT INTO scenarios (code, name, category, priority, color, icon, data_schema) VALUES
('BIRTHDAY', '생일', 'relationship', 3, '#EC4899', 'cake', 
 '{"birth_date": "date"}'),
('ANNIVERSARY', '가입 기념일', 'relationship', 4, '#F97316', 'gift',
 '{"join_date": "date", "years": "number"}'),
('LONG_NO_CONTACT', '장기 미접촉', 'relationship', 1, '#EF4444', 'phone-missed',
 '{"days_since_contact": "number", "last_contact_type": "string"}'),
('VIP_DOWNGRADE_RISK', 'VIP 강등 위험', 'relationship', 1, '#DC2626', 'alert-triangle',
 '{"current_aum": "number", "threshold": "number", "shortfall": "number"}');

-- 기회 카테고리
INSERT INTO scenarios (code, name, category, priority, color, icon, data_schema) VALUES
('NEW_PRODUCT_FIT', '신상품 적합', 'opportunity', 3, '#06B6D4', 'star',
 '{"product_id": "string", "fit_reason": "string"}'),
('VIP_UPGRADE_CHANCE', 'VIP 승급 기회', 'opportunity', 2, '#22C55E', 'arrow-up',
 '{"current_aum": "number", "threshold": "number", "gap": "number"}');
```

---

## 5. 뷰 (View) 정의

### 5.1 고객 이벤트 상세 뷰

```sql
CREATE VIEW v_customer_events AS
SELECT 
    e.id,
    e.event_date,
    e.event_data,
    e.status,
    e.priority,
    e.notes,
    c.id AS customer_id,
    c.name AS customer_name,
    c.customer_group,
    c.grade AS customer_grade,
    c.total_aum,
    c.phone AS customer_phone,
    s.code AS scenario_code,
    s.name AS scenario_name,
    s.category AS scenario_category,
    s.color AS scenario_color,
    s.icon AS scenario_icon,
    u.id AS wm_id,
    u.name AS wm_name
FROM customer_scenario_events e
JOIN customers c ON e.customer_id = c.id
JOIN scenarios s ON e.scenario_id = s.id
LEFT JOIN users u ON e.assigned_wm_id = u.id;
```

### 5.2 대시보드 통계 뷰

```sql
CREATE VIEW v_dashboard_stats AS
SELECT 
    u.id AS wm_id,
    COUNT(DISTINCT c.id) AS total_customers,
    SUM(c.total_aum) AS total_aum,
    COUNT(DISTINCT CASE WHEN c.customer_group = 'vip' THEN c.id END) AS vip_count,
    COUNT(DISTINCT CASE WHEN e.status = 'pending' THEN e.id END) AS pending_events,
    COUNT(DISTINCT CASE WHEN e.status = 'pending' AND c.customer_group = 'vip' THEN e.id END) AS vip_pending_events
FROM users u
LEFT JOIN customers c ON u.id = c.wm_id
LEFT JOIN customer_scenario_events e ON c.id = e.customer_id
WHERE u.role = 'wm'
GROUP BY u.id;
```

---

## 6. 인덱스 전략

### 6.1 자주 사용되는 쿼리 패턴

| 쿼리 | 인덱스 |
|------|--------|
| WM별 고객 목록 | `idx_customers_wm` |
| 상태별 이벤트 조회 | `idx_events_status` |
| 날짜 범위 이벤트 | `idx_events_date` |
| 시나리오별 이벤트 | `idx_events_scenario` |
| JSON 필드 검색 | `idx_events_data` (GIN) |

### 6.2 복합 인덱스 권장

```sql
-- WM + 상태별 이벤트 조회
CREATE INDEX idx_events_wm_status ON customer_scenario_events(assigned_wm_id, status);

-- 고객 + 날짜별 이벤트 조회
CREATE INDEX idx_events_customer_date ON customer_scenario_events(customer_id, event_date);

-- 시나리오 + 상태별 이벤트 조회
CREATE INDEX idx_events_scenario_status ON customer_scenario_events(scenario_id, status);
```

---

## 7. DBMS별 차이점

| 기능 | PostgreSQL | MySQL | SQLite |
|------|------------|-------|--------|
| UUID | `gen_random_uuid()` | `UUID()` | 별도 함수 필요 |
| JSON 인덱스 | GIN | 지원 제한 | 미지원 |
| BOOLEAN | 네이티브 | TINYINT(1) | INTEGER |
| TIMESTAMP | `TIMESTAMP WITH TIME ZONE` | `DATETIME` | TEXT |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-01-30 | 최초 작성 |
