# 시나리오 기반 데이터 모델 v1.0

## 1. 개요

### 1.1 설계 원칙

위젯 중심이 아닌 **비즈니스 도메인(시나리오) 중심**의 데이터 모델 설계

```
┌─────────────────────────────────────────────────────────────┐
│                    비즈니스 도메인 계층                       │
├─────────────────────────────────────────────────────────────┤
│  Scenario (시나리오)                                         │
│     └── 만기, 리밸런싱, 신규상품추천, 영업기회 등              │
│                                                             │
│  Customer (고객)                                             │
│     └── 고객 기본정보, 그룹, 등급                             │
│                                                             │
│  CustomerScenarioEvent (고객-시나리오 이벤트)                 │
│     └── 특정 고객에게 발생한 시나리오 이벤트                   │
│                                                             │
│  Feed (피드/콘텐츠)                                          │
│     └── 뉴스, 리서치, 공지사항, 시그널                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    표현 계층 (Widget)                        │
│  위젯은 위 데이터를 쿼리해서 보여주는 View일 뿐               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Entity 목록 (11개)

| # | Entity | 설명 |
|---|--------|------|
| 1 | User | 사용자 (WM, Admin) |
| 2 | Scenario | 시나리오 마스터 (7개 카테고리) |
| 3 | Customer | 고객 (3개 그룹) |
| 4 | Account | 계좌 |
| 5 | Securities | 증권 (5개 유형) |
| 6 | CustomerHolding | 고객 보유 증권 |
| 7 | CustomerScenarioEvent | 고객-시나리오 이벤트 (핵심) |
| 8 | ActionLog | 액션 로그 |
| 9 | Feed | 피드/콘텐츠 (5개 유형) |
| 10 | FeedScenarioTag | 피드-시나리오 연결 |
| 11 | SecurityFeed | 증권-피드 연결 |

---

## 2. Entity 정의

### 2.1 User (사용자)

WM, Admin 등 시스템 사용자

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| email | VARCHAR(100) | 이메일 (로그인 ID) |
| name | VARCHAR(100) | 이름 |
| employee_code | VARCHAR(50) | 사번 |
| role | VARCHAR(20) | 역할 (`admin`, `wm`, `viewer`) |
| permission_level | INTEGER | 권한 등급 (1=최고, 숫자 클수록 낮음) |
| branch_id | UUID | 소속 지점 FK (nullable) |
| phone | VARCHAR(20) | 연락처 |
| is_active | BOOLEAN | 활성화 여부 |
| last_login_at | TIMESTAMPTZ | 마지막 로그인 |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

**role 값:**

| role | 설명 |
|------|------|
| admin | 시스템 관리자 (전체 권한) |
| wm | Wealth Manager (고객 관리, 영업) |
| viewer | 조회 전용 |

**permission_level 예시:**

| level | 설명 |
|-------|------|
| 1 | 전체 관리자 (시스템 설정, 사용자 관리) |
| 2 | 지점장 (지점 내 데이터 관리) |
| 3 | 팀장 (팀 내 데이터 조회) |
| 4 | 일반 WM (본인 고객만) |
| 5 | 조회 전용 |

---

### 2.2 Scenario (시나리오 마스터)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| code | VARCHAR(50) | 시나리오 코드 (예: `DEPOSIT_MATURITY`) |
| name | VARCHAR(100) | 시나리오 명 (예: "정기예금 만기") |
| category | VARCHAR(30) | 분류 (7개 카테고리) |
| priority | INTEGER | 우선순위 (1=높음) |
| color | VARCHAR(20) | UI 표시 색상 |
| icon | VARCHAR(50) | 아이콘 코드 |
| description | TEXT | 시나리오 설명 |
| data_schema | JSONB | 시나리오별 필요 데이터 스키마 정의 |
| is_active | BOOLEAN | 활성화 여부 |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

**category 값 (7개):**

| category | 정의 | 핵심 포인트 |
|----------|------|------------|
| account | 계좌 상태 | 계좌 자체 상태 (휴면, 미수금 등) |
| opportunity | 영업 기회 | 상품 추천, 전환, 청약 등 세일즈 기회 |
| asset | 보유 자산 상태 | 포트폴리오/보유종목/상품 상태 변화 |
| relationship | 고객 관계 | CRM, 라이프 이벤트, 접촉 관리 |
| activity | 고객 디지털 행동 | 검색, 조회, 관심 등록 등 |
| transaction | 입출금 | 자금 이동 |
| trading | 매매 발생 | 실제 매수/매도 트랜잭션 |

---

### 2.3 Customer (고객)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| customer_code | VARCHAR(50) | 고객 코드 |
| name | VARCHAR(100) | 고객명 |
| phone | VARCHAR(20) | 연락처 |
| email | VARCHAR(100) | 이메일 |
| customer_group | VARCHAR(20) | 그룹 (`vip`, `general`, `prospect`) |
| grade | VARCHAR(20) | 등급 (VIP, Premium, General 등 세부) |
| birth_date | DATE | 생년월일 |
| wm_id | UUID | 담당 WM FK → User |
| branch_id | UUID | 소속 지점 FK |
| total_aum | DECIMAL(18,2) | 총 운용자산 |
| created_at | TIMESTAMPTZ | 등록일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

**customer_group 값:**

| group | 설명 |
|-------|------|
| vip | 주요고객 (핵심 관리 대상) |
| general | 일반 고객 |
| prospect | 가망 고객 (잠재 고객) |

---

### 2.4 Account (계좌)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| customer_id | UUID | 고객 FK |
| account_number | VARCHAR(50) | 계좌번호 |
| account_type | VARCHAR(30) | 계좌 유형 (deposit, fund, trust, isa 등) |
| product_name | VARCHAR(100) | 상품명 |
| balance | DECIMAL(18,2) | 잔액/평가금액 |
| maturity_date | DATE | 만기일 (해당 시) |
| interest_rate | DECIMAL(5,3) | 금리 (해당 시) |
| opened_at | DATE | 개설일 |
| status | VARCHAR(20) | 상태 (active, matured, closed) |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

---

### 2.5 Securities (증권/유가증권)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| symbol | VARCHAR(20) | 종목코드 (예: 005930, SPY) |
| name | VARCHAR(100) | 종목명 |
| name_en | VARCHAR(100) | 영문명 |
| security_type | VARCHAR(20) | 유형 (`stock`, `etf`, `bond`, `fund`, `els`) |
| market | VARCHAR(20) | 시장 (KOSPI, KOSDAQ, NYSE, NASDAQ 등) |
| sector | VARCHAR(50) | 섹터/업종 |
| currency | VARCHAR(10) | 통화 (KRW, USD 등) |
| current_price | DECIMAL(18,4) | 현재가 |
| price_updated_at | TIMESTAMPTZ | 가격 업데이트 시간 |
| is_active | BOOLEAN | 거래 가능 여부 |
| metadata | JSONB | 추가 정보 (배당률, 만기일, 발행사 등) |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |

**security_type 값:**

| type | 설명 |
|------|------|
| stock | 주식 |
| etf | ETF |
| bond | 채권 |
| fund | 펀드 |
| els | ELS/DLS |

**metadata 예시:**

```json
// 주식
{
  "dividend_yield": 2.5,
  "per": 12.3,
  "pbr": 1.2,
  "market_cap": 500000000000
}

// 채권
{
  "coupon_rate": 3.5,
  "maturity_date": "2028-06-15",
  "issuer": "한국전력",
  "credit_rating": "AAA"
}

// ETF
{
  "expense_ratio": 0.07,
  "tracking_index": "S&P 500",
  "aum": 100000000000
}
```

---

### 2.6 CustomerHolding (고객 보유 증권)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| customer_id | UUID | 고객 FK |
| account_id | UUID | 계좌 FK |
| security_id | UUID | 증권 FK |
| quantity | DECIMAL(18,4) | 보유 수량 |
| avg_purchase_price | DECIMAL(18,4) | 평균 매입가 |
| current_value | DECIMAL(18,2) | 현재 평가금액 |
| profit_loss | DECIMAL(18,2) | 평가손익 |
| profit_loss_rate | DECIMAL(8,4) | 수익률(%) |
| updated_at | TIMESTAMPTZ | 업데이트 일시 |

---

### 2.7 CustomerScenarioEvent (고객-시나리오 이벤트) ⭐ 핵심

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| customer_id | UUID | 고객 FK |
| scenario_id | UUID | 시나리오 FK |
| account_id | UUID | 관련 계좌 FK (nullable) |
| security_id | UUID | 관련 증권 FK (nullable) |
| event_date | DATE | 이벤트 발생/예정일 |
| event_data | JSONB | 시나리오 data_schema에 맞는 실제 데이터 |
| status | VARCHAR(20) | 상태 (pending, contacted, completed, dismissed) |
| priority | INTEGER | 긴급도 (시나리오 기본값 override) |
| assigned_wm_id | UUID | 담당 WM FK → User |
| notes | TEXT | 메모 |
| created_at | TIMESTAMPTZ | 생성일시 |
| updated_at | TIMESTAMPTZ | 수정일시 |
| completed_at | TIMESTAMPTZ | 처리완료일시 |

**이 테이블의 핵심 역할:**

- **액션 리스트 위젯**: `status='pending'`으로 필터링
- **캘린더 위젯**: `event_date`로 그룹핑
- **바 차트 위젯**: `scenario_id`로 집계
- **요약 타일 위젯**: 조건별 카운트

---

### 2.8 ActionLog (액션 로그)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| event_id | UUID | CustomerScenarioEvent FK |
| wm_id | UUID | 수행 WM FK → User |
| action_type | VARCHAR(30) | 액션 유형 (call, meeting, email, sms, memo) |
| action_detail | TEXT | 상세 내용 |
| result | VARCHAR(30) | 결과 (success, no_answer, scheduled, rejected) |
| next_action_date | DATE | 다음 액션 예정일 |
| created_at | TIMESTAMPTZ | 수행일시 |

---

### 2.9 Feed (피드/콘텐츠)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| feed_type | VARCHAR(30) | 유형 (`news`, `research`, `notice`, `alert`, `signal`) |
| title | VARCHAR(200) | 제목 |
| content | TEXT | 내용 |
| source | VARCHAR(100) | 출처 |
| link | VARCHAR(500) | 원문 링크 |
| icon | VARCHAR(50) | 아이콘 |
| is_pinned | BOOLEAN | 상단 고정 여부 |
| author_id | UUID | 작성자 FK → User |
| published_at | TIMESTAMPTZ | 게시일시 |
| expires_at | TIMESTAMPTZ | 만료일시 |
| signal_type | VARCHAR(30) | 시그널 유형 (signal일 때만, `buy`, `sell`, `hold`, `watch`) |
| signal_strength | INTEGER | 시그널 강도 (1~5, signal일 때만) |
| created_at | TIMESTAMPTZ | 생성일시 |

**feed_type 값:**

| type | 설명 |
|------|------|
| news | 뉴스 |
| research | 리서치/분석 |
| notice | 공지사항 |
| alert | 알림/경고 |
| signal | 투자 시그널 (매수/매도/관심 등) |

**signal 유형 예시:**

| signal_type | signal_strength | 설명 |
|-------------|-----------------|------|
| buy | 5 | 강력 매수 |
| buy | 3 | 매수 고려 |
| sell | 5 | 강력 매도 |
| sell | 3 | 매도 고려 |
| hold | 3 | 보유 유지 |
| watch | 2 | 관심 종목 |

---

### 2.10 FeedScenarioTag (피드-시나리오 연결)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| feed_id | UUID | Feed FK |
| scenario_id | UUID | Scenario FK |

---

### 2.11 SecurityFeed (증권-피드 연결)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| security_id | UUID | Securities FK |
| feed_id | UUID | Feed FK |
| relevance | VARCHAR(20) | 관련도 (`primary`, `secondary`, `mentioned`) |
| created_at | TIMESTAMPTZ | 생성일시 |

**relevance 값:**

| relevance | 설명 |
|-----------|------|
| primary | 해당 종목이 주제 (시그널, 종목 리서치) |
| secondary | 관련 종목 (섹터 분석, 비교 종목) |
| mentioned | 언급된 종목 (뉴스에서 간접 언급) |

---

## 3. 시나리오 카테고리 상세

### 3.1 카테고리 요약

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Scenario Category (7개)                          │
├──────────────┬──────────────────────────────────────────────────────┤
│ account      │ 계좌 상태: 휴면, 미수금, 계좌기념일                    │
├──────────────┼──────────────────────────────────────────────────────┤
│ opportunity  │ 영업 기회: 신규상품, 전환, 청약, 교차판매, 절세        │
├──────────────┼──────────────────────────────────────────────────────┤
│ asset        │ 자산 상태: 만기(예금/펀드/ELS/채권), 급등/급락,       │
│              │           손실과다, 집중투자, 리밸런싱, 배당락         │
├──────────────┼──────────────────────────────────────────────────────┤
│ relationship │ 고객 관계: 생일, 기념일, 장기미접촉, VIP승급/강등위험  │
├──────────────┼──────────────────────────────────────────────────────┤
│ activity     │ 디지털 행동: 종목검색, 컨텐츠조회, 관심등록, 앱사용    │
├──────────────┼──────────────────────────────────────────────────────┤
│ transaction  │ 입출금: 대규모입금/출금, 자동이체실패, 휴면해제        │
├──────────────┼──────────────────────────────────────────────────────┤
│ trading      │ 매매 발생: 주요종목 매도/매수, 대규모매매, 첫거래      │
└──────────────┴──────────────────────────────────────────────────────┘
```

### 3.2 카테고리별 시나리오 목록

#### account (계좌)

| code | name | 설명 |
|------|------|------|
| DORMANT_ACCOUNT | 휴면 계좌 | 일정 기간 거래 없음 |
| MARGIN_CALL | 미수금 발생 | 미수금/담보부족 |
| ACCOUNT_ANNIVERSARY | 계좌 개설 기념일 | 계좌 개설 N주년 |

#### opportunity (영업 기회)

| code | name | 설명 |
|------|------|------|
| NEW_PRODUCT_FIT | 신규상품 적합 | 고객 성향에 맞는 신규상품 출시 |
| PRODUCT_SWITCH | 상품 전환 추천 | 기존 상품 → 더 나은 상품 전환 기회 |
| SUBSCRIPTION_OPEN | 청약 오픈 | IPO/공모펀드 청약 기회 |
| CROSS_SELL | 교차 판매 | 미보유 상품군 추천 기회 |
| UP_SELL | 업셀링 | 상위 상품/서비스 추천 기회 |
| TAX_SAVING | 절세 상품 | 절세 니즈 맞춤 상품 추천 |

#### asset (보유 자산 상태)

| code | name | 설명 |
|------|------|------|
| DEPOSIT_MATURITY | 정기예금 만기 | 정기예금 만기 도래 |
| FUND_MATURITY | 펀드 만기 | 펀드 만기/상환 도래 |
| ELS_MATURITY | ELS 만기 | ELS/DLS 만기 도래 |
| BOND_MATURITY | 채권 만기 | 채권 만기 도래 |
| STOCK_SURGE | 급등종목 보유 | 보유종목 급등 (수익실현 기회) |
| STOCK_PLUNGE | 급락종목 보유 | 보유종목 급락 (손절/추매 판단) |
| LOSS_THRESHOLD | 손실률 과다 | 특정 종목 손실률 기준 초과 |
| PROFIT_THRESHOLD | 수익률 도달 | 목표 수익률 도달 |
| CONCENTRATION_ALERT | 집중투자 경고 | 단일 종목 비중 과다 |
| REBALANCE_NEEDED | 리밸런싱 필요 | 목표 배분 대비 편차 발생 |
| DIVIDEND_UPCOMING | 배당락 임박 | 보유종목 배당락일 접근 |

#### relationship (고객 관계)

| code | name | 설명 |
|------|------|------|
| BIRTHDAY | 생일 | 고객 생일 |
| ANNIVERSARY | 기념일 | 거래 기념일, 결혼기념일 등 |
| LONG_NO_CONTACT | 장기 미접촉 | 일정 기간 상담 없음 |
| VIP_UPGRADE | VIP 승급 | 등급 상향 축하 |
| VIP_DOWNGRADE_RISK | VIP 강등 위험 | 등급 유지 조건 미달 임박 |
| REFERRAL_OPPORTUNITY | 소개 기회 | 소개 영업 가능 고객 |

#### activity (고객 디지털 행동)

| code | name | 설명 |
|------|------|------|
| SEARCHED_SECURITY | 종목 검색 | 고객이 특정 종목 검색 |
| VIEWED_CONTENT | 컨텐츠 조회 | 고객이 리서치/뉴스 조회 |
| VIEWED_PRODUCT | 상품 조회 | 고객이 특정 상품 페이지 조회 |
| WISHLIST_ADD | 관심종목 등록 | 고객이 관심종목 추가 |
| APP_INACTIVE | 앱 미사용 | 일정 기간 앱 접속 없음 |
| FREQUENT_LOGIN | 빈번한 접속 | 평소 대비 잦은 앱 접속 |

#### transaction (입출금)

| code | name | 설명 |
|------|------|------|
| LARGE_DEPOSIT | 대규모 입금 | 일정 금액 이상 입금 발생 |
| LARGE_WITHDRAWAL | 대규모 출금 | 일정 금액 이상 출금 발생 |
| AUTO_TRANSFER_FAIL | 자동이체 실패 | 자동이체/CMA 연결 실패 |
| DORMANT_REACTIVATE | 휴면 해제 | 장기 휴면 후 거래 재개 |

#### trading (매매 발생)

| code | name | 설명 |
|------|------|------|
| KEY_STOCK_SOLD | 주요종목 매도 | 고객이 주요 보유종목 매도 |
| KEY_STOCK_BOUGHT | 주요종목 매수 | 고객이 주요종목 신규 매수 |
| LARGE_TRADE | 대규모 매매 | 일정 금액 이상 매매 발생 |
| FREQUENT_TRADING | 빈번한 매매 | 단기간 잦은 매매 (과매매 경고) |
| FIRST_TRADE | 첫 거래 | 계좌 개설 후 첫 매매 |

---

## 4. data_schema 예시

### 4.1 asset 카테고리

**정기예금 만기 (DEPOSIT_MATURITY)**

```json
{
  "required_fields": [
    { "key": "account_number", "type": "string", "label": "계좌번호" },
    { "key": "product_name", "type": "string", "label": "상품명" },
    { "key": "maturity_date", "type": "date", "label": "만기일" },
    { "key": "principal", "type": "number", "label": "원금" },
    { "key": "interest_rate", "type": "number", "label": "금리(%)" },
    { "key": "expected_interest", "type": "number", "label": "예상이자" }
  ],
  "optional_fields": [
    { "key": "renewal_recommendation", "type": "string", "label": "재예치 추천상품" }
  ]
}
```

**ELS 만기 (ELS_MATURITY)**

```json
{
  "required_fields": [
    { "key": "account_number", "type": "string", "label": "계좌번호" },
    { "key": "product_name", "type": "string", "label": "상품명" },
    { "key": "maturity_date", "type": "date", "label": "만기일" },
    { "key": "principal", "type": "number", "label": "원금" },
    { "key": "underlying_assets", "type": "array", "label": "기초자산" },
    { "key": "knock_in_status", "type": "string", "label": "낙인 여부" },
    { "key": "expected_return", "type": "number", "label": "예상 수익률(%)" }
  ],
  "optional_fields": [
    { "key": "early_redemption_history", "type": "array", "label": "조기상환 이력" }
  ]
}
```

**급등종목 보유 (STOCK_SURGE)**

```json
{
  "required_fields": [
    { "key": "security_symbol", "type": "string", "label": "종목코드" },
    { "key": "security_name", "type": "string", "label": "종목명" },
    { "key": "holding_quantity", "type": "number", "label": "보유수량" },
    { "key": "avg_purchase_price", "type": "number", "label": "평균매입가" },
    { "key": "current_price", "type": "number", "label": "현재가" },
    { "key": "profit_rate", "type": "number", "label": "수익률(%)" },
    { "key": "change_rate", "type": "number", "label": "등락률(%)" }
  ],
  "optional_fields": [
    { "key": "target_price", "type": "number", "label": "목표가" },
    { "key": "stop_loss_price", "type": "number", "label": "손절가" }
  ]
}
```

**집중투자 경고 (CONCENTRATION_ALERT)**

```json
{
  "required_fields": [
    { "key": "security_symbol", "type": "string", "label": "종목코드" },
    { "key": "security_name", "type": "string", "label": "종목명" },
    { "key": "holding_value", "type": "number", "label": "보유금액" },
    { "key": "total_aum", "type": "number", "label": "총 자산" },
    { "key": "concentration_rate", "type": "number", "label": "집중도(%)" },
    { "key": "threshold", "type": "number", "label": "기준치(%)" }
  ],
  "optional_fields": [
    { "key": "risk_grade", "type": "string", "label": "위험등급" },
    { "key": "diversification_suggestion", "type": "array", "label": "분산 제안" }
  ]
}
```

### 4.2 relationship 카테고리

**생일 (BIRTHDAY)**

```json
{
  "required_fields": [
    { "key": "birth_date", "type": "date", "label": "생년월일" },
    { "key": "age", "type": "number", "label": "나이" }
  ],
  "optional_fields": [
    { "key": "preferred_contact", "type": "string", "label": "선호 연락 방식" },
    { "key": "gift_history", "type": "array", "label": "선물 이력" }
  ]
}
```

**장기 미접촉 (LONG_NO_CONTACT)**

```json
{
  "required_fields": [
    { "key": "last_contact_date", "type": "date", "label": "마지막 접촉일" },
    { "key": "days_since_contact", "type": "number", "label": "미접촉 일수" },
    { "key": "last_contact_type", "type": "string", "label": "마지막 접촉 유형" }
  ],
  "optional_fields": [
    { "key": "contact_history", "type": "array", "label": "접촉 이력" },
    { "key": "preferred_contact", "type": "string", "label": "선호 연락 방식" }
  ]
}
```

**VIP 강등 위험 (VIP_DOWNGRADE_RISK)**

```json
{
  "required_fields": [
    { "key": "current_grade", "type": "string", "label": "현재 등급" },
    { "key": "required_aum", "type": "number", "label": "유지 필요 AUM" },
    { "key": "current_aum", "type": "number", "label": "현재 AUM" },
    { "key": "shortfall", "type": "number", "label": "부족 금액" },
    { "key": "evaluation_date", "type": "date", "label": "평가일" }
  ],
  "optional_fields": [
    { "key": "recommended_products", "type": "array", "label": "추천 상품" }
  ]
}
```

### 4.3 activity 카테고리

**종목 검색 (SEARCHED_SECURITY)**

```json
{
  "required_fields": [
    { "key": "security_symbol", "type": "string", "label": "검색 종목코드" },
    { "key": "security_name", "type": "string", "label": "검색 종목명" },
    { "key": "search_count", "type": "number", "label": "검색 횟수" },
    { "key": "last_searched_at", "type": "datetime", "label": "최근 검색일시" }
  ],
  "optional_fields": [
    { "key": "is_holding", "type": "boolean", "label": "보유 여부" },
    { "key": "related_content", "type": "array", "label": "관련 컨텐츠" }
  ]
}
```

**컨텐츠 조회 (VIEWED_CONTENT)**

```json
{
  "required_fields": [
    { "key": "content_id", "type": "string", "label": "컨텐츠 ID" },
    { "key": "content_title", "type": "string", "label": "컨텐츠 제목" },
    { "key": "content_type", "type": "string", "label": "컨텐츠 유형" },
    { "key": "viewed_at", "type": "datetime", "label": "조회일시" }
  ],
  "optional_fields": [
    { "key": "view_duration", "type": "number", "label": "체류시간(초)" },
    { "key": "related_securities", "type": "array", "label": "관련 종목" }
  ]
}
```

### 4.4 transaction 카테고리

**대규모 입금 (LARGE_DEPOSIT)**

```json
{
  "required_fields": [
    { "key": "account_number", "type": "string", "label": "계좌번호" },
    { "key": "deposit_amount", "type": "number", "label": "입금액" },
    { "key": "deposit_date", "type": "datetime", "label": "입금일시" },
    { "key": "source", "type": "string", "label": "입금 출처" }
  ],
  "optional_fields": [
    { "key": "previous_balance", "type": "number", "label": "입금 전 잔액" },
    { "key": "recommended_products", "type": "array", "label": "추천 상품" }
  ]
}
```

### 4.5 trading 카테고리

**주요종목 매도 (KEY_STOCK_SOLD)**

```json
{
  "required_fields": [
    { "key": "security_symbol", "type": "string", "label": "종목코드" },
    { "key": "security_name", "type": "string", "label": "종목명" },
    { "key": "sold_quantity", "type": "number", "label": "매도수량" },
    { "key": "sold_price", "type": "number", "label": "매도가" },
    { "key": "sold_amount", "type": "number", "label": "매도금액" },
    { "key": "traded_at", "type": "datetime", "label": "거래일시" }
  ],
  "optional_fields": [
    { "key": "remaining_quantity", "type": "number", "label": "잔여수량" },
    { "key": "realized_profit", "type": "number", "label": "실현손익" },
    { "key": "profit_rate", "type": "number", "label": "수익률(%)" }
  ]
}
```

**대규모 매매 (LARGE_TRADE)**

```json
{
  "required_fields": [
    { "key": "trade_type", "type": "string", "label": "매매유형(buy/sell)" },
    { "key": "security_symbol", "type": "string", "label": "종목코드" },
    { "key": "security_name", "type": "string", "label": "종목명" },
    { "key": "trade_amount", "type": "number", "label": "거래금액" },
    { "key": "traded_at", "type": "datetime", "label": "거래일시" }
  ],
  "optional_fields": [
    { "key": "threshold_amount", "type": "number", "label": "기준금액" },
    { "key": "account_number", "type": "string", "label": "계좌번호" }
  ]
}
```

---

## 5. ERD (Entity Relationship Diagram)

```
┌──────────────┐
│     User     │
│──────────────│
│ id           │◄─────────────────────────────────────┐
│ email        │                                      │
│ name         │                                      │
│ role         │         ┌──────────────┐             │
│ permission   │         │   Scenario   │             │
│ branch_id    │         │──────────────│             │
└──────────────┘         │ id           │◄────────┐   │
       │                 │ code         │         │   │
       │                 │ name         │         │   │
       │                 │ category     │ (7 types)   │
       │                 │ data_schema  │ (JSONB) │   │
       │                 │ priority     │         │   │
       ▼                 └──────────────┘         │   │
┌──────────────┐                │                 │   │
│   Customer   │                │                 │   │
│──────────────│                ▼                 │   │
│ id           │◄───────┬──────────────────────┐ │   │
│ name         │        │ CustomerScenarioEvent│ │   │
│ customer_group│ (vip│general│prospect)       │ │   │
│ grade        │        │──────────────────────│ │   │
│ wm_id ───────┼────────┤ customer_id          │ │   │
│ total_aum    │        │ scenario_id ─────────┼─┘   │
└──────────────┘        │ account_id           │     │
       │                │ security_id          │     │
       │                │ event_date           │     │
       ▼                │ event_data (JSONB)   │     │
┌──────────────┐        │ status               │     │
│   Account    │        │ assigned_wm_id ──────┼─────┘
│──────────────│        └──────────────────────┘
│ customer_id  │◄───────────────┘     │
│ account_no   │                      │
│ balance      │                      ▼
│ maturity_date│              ┌──────────────┐
└──────────────┘              │  ActionLog   │
                              │──────────────│
┌──────────────┐              │ event_id     │
│  Securities  │              │ wm_id        │
│──────────────│              │ action_type  │
│ id           │◄─────┐       │ result       │
│ symbol       │      │       └──────────────┘
│ name         │      │
│ security_type│ (stock│etf│bond│fund│els)
│ market       │      │
│ metadata     │      │
└──────────────┘      │
       │              │
       ▼              │
┌────────────────┐    │
│ CustomerHolding│    │
│────────────────│    │
│ customer_id    │    │
│ account_id     │    │
│ security_id ───┼────┘
│ quantity       │
│ profit_loss    │
└────────────────┘


┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│  Securities  │◄──────│   SecurityFeed   │──────►│    Feed      │
│──────────────│       │──────────────────│       │──────────────│
│ id           │       │ security_id      │       │ id           │
│ symbol       │       │ feed_id          │       │ title        │
│ name         │       │ relevance        │       │ feed_type    │
└──────────────┘       └──────────────────┘       │ signal_type  │
                                                  │ author_id    │
       ┌──────────────────┐                       └──────────────┘
       │ FeedScenarioTag  │───────────────────────────────┘
       │──────────────────│
       │ feed_id          │
       │ scenario_id      │
       └──────────────────┘
```

---

## 6. 위젯과 Entity 매핑

| 위젯 | 데이터 소스 | 쿼리 방식 |
|------|------------|----------|
| 액션 리스트 | `CustomerScenarioEvent` + `Customer` | `status='pending'` JOIN |
| 바 차트 | `CustomerScenarioEvent` | `scenario_id`별 COUNT/SUM |
| 캘린더 | `CustomerScenarioEvent` | `event_date`별 GROUP BY |
| 피드 | `Feed` | `published_at` 정렬 |
| 요약 타일 | `CustomerScenarioEvent` | 특정 조건 COUNT |

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-01-30 | 최초 작성 |
