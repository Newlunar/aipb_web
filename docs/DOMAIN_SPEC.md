# AI 자산관리 비서 - 도메인 명세서

> 이 문서는 기술 스택에 독립적인 비즈니스 도메인 및 핵심 개념을 정의합니다.

## 1. 개요

### 1.1 서비스 정의

**AI 자산관리 비서**는 금융기관의 WM(Wealth Manager)이 고객을 효율적으로 관리하고, 적시에 적절한 액션을 취할 수 있도록 지원하는 업무 보조 시스템입니다.

### 1.2 핵심 가치

| 가치 | 설명 |
|------|------|
| **적시성** | 고객에게 연락해야 할 최적의 시점을 알려줌 |
| **맥락 제공** | 왜 연락해야 하는지, 무엇을 제안해야 하는지 정보 제공 |
| **업무 효율화** | 반복적인 모니터링 업무를 자동화 |
| **기회 발굴** | 영업 기회를 사전에 식별하여 제안 |

### 1.3 사용자 페르소나

#### WM (Wealth Manager)
- **역할**: 고객 자산 관리 및 투자 상담
- **목표**: 고객 만족도 향상, AUM(운용자산) 증대, 효율적인 시간 관리
- **Pain Point**: 많은 고객 관리, 중요 일정 누락, 기회 포착 어려움

#### 관리자 (Admin)
- **역할**: 시스템 설정, 시나리오 관리, 사용자 권한 관리
- **목표**: 시스템 안정성 유지, 업무 규칙 최적화

---

## 2. 도메인 모델

### 2.1 핵심 엔티티

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│  Customer   │────▶│   Account   │
│   (WM)      │     │   (고객)     │     │   (계좌)    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Scenario   │     │  Holdings   │
                    │  Event      │     │  (보유자산)  │
                    └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Scenario   │
                    │  (시나리오)  │
                    └─────────────┘
```

### 2.2 엔티티 정의

#### User (사용자)
WM 및 관리자를 포함한 시스템 사용자

| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 |
| email | string | 이메일 (로그인 ID) |
| name | string | 이름 |
| role | enum | admin, wm, viewer |
| permission_level | integer | 권한 등급 (1~5) |
| branch_id | string | 소속 지점 |
| is_active | boolean | 활성 상태 |

#### Customer (고객)
WM이 관리하는 자산관리 고객

| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 |
| name | string | 고객명 |
| phone | string | 연락처 |
| email | string | 이메일 |
| customer_group | enum | vip, general, prospect |
| grade | string | 등급 (Diamond, Platinum, Gold 등) |
| total_aum | decimal | 총 운용자산 |
| wm_id | string | 담당 WM |
| birth_date | date | 생년월일 |
| join_date | date | 가입일 |
| last_contact_date | date | 최근 연락일 |

#### Account (계좌)
고객이 보유한 금융 계좌

| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | 계좌번호 |
| customer_id | string | 고객 ID |
| account_type | enum | deposit, fund, stock, wrap 등 |
| product_name | string | 상품명 |
| balance | decimal | 잔액 |
| maturity_date | date | 만기일 |
| interest_rate | decimal | 이율 |
| status | enum | active, dormant, closed |

#### Scenario (시나리오)
고객에게 발생할 수 있는 이벤트 유형 정의

| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 |
| code | string | 시나리오 코드 (DEPOSIT_MATURITY 등) |
| name | string | 시나리오명 |
| category | enum | 카테고리 (아래 참조) |
| description | string | 설명 |
| priority | integer | 기본 우선순위 (1~5) |
| color | string | 표시 색상 |
| icon | string | 아이콘 |
| data_schema | object | 시나리오별 필요 데이터 스키마 |

#### CustomerScenarioEvent (고객 시나리오 이벤트)
특정 고객에게 발생한 시나리오 이벤트 인스턴스

| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 |
| customer_id | string | 고객 ID |
| scenario_id | string | 시나리오 ID |
| account_id | string | 관련 계좌 (선택) |
| event_date | date | 이벤트 발생/예정일 |
| event_data | object | 시나리오별 상세 데이터 |
| status | enum | pending, contacted, completed, dismissed |
| priority | integer | 우선순위 |
| assigned_wm_id | string | 담당 WM |
| notes | string | 메모 |

---

## 3. 시나리오 카테고리

### 3.1 카테고리 정의

| 카테고리 | 코드 | 설명 | 예시 |
|----------|------|------|------|
| **계좌** | account | 계좌/상품 만기 관련 | 예금 만기, 펀드 만기 |
| **자산** | asset | 자산 변동 관련 | 자산 감소, 급등주 보유 |
| **입출금** | transaction | 입출금 패턴 관련 | 대량 입금, 대량 출금 |
| **매매** | trading | 매매 활동 관련 | 과다 매매, 손실 과다 |
| **활동** | activity | 고객 디지털 활동 | 종목 검색, 콘텐츠 조회 |
| **관계** | relationship | 고객 관계 관리 | 생일, 장기 미접촉 |
| **기회** | opportunity | 영업 기회 | 신상품 추천, VIP 승급 |

### 3.2 시나리오 목록

#### 계좌 (account)
| 코드 | 이름 | 설명 | 필요 데이터 |
|------|------|------|-------------|
| DEPOSIT_MATURITY | 예금 만기 | 정기예금 만기 도래 | principal, interest_rate, maturity_date |
| FUND_MATURITY | 펀드 만기 | 펀드 만기 도래 | principal, fund_name, maturity_date |
| ELS_MATURITY | ELS 만기 | ELS 상품 만기 | principal, product_name, expected_return |
| BOND_MATURITY | 채권 만기 | 채권 만기 도래 | principal, bond_name, yield_rate |

#### 자산 (asset)
| 코드 | 이름 | 설명 | 필요 데이터 |
|------|------|------|-------------|
| AUM_DECREASE | 자산 감소 | AUM 급격한 감소 | previous_aum, current_aum, change_rate |
| LARGE_WITHDRAWAL | 대량 출금 | 대규모 자금 출금 | amount, destination |
| STOCK_SURGE | 급등 종목 보유 | 보유 종목 급등 | stock_code, stock_name, return_rate |
| STOCK_PLUNGE | 급락 종목 보유 | 보유 종목 급락 | stock_code, stock_name, loss_rate |
| EXCESSIVE_LOSS | 과다 손실 | 전체 손실 과다 | total_loss, loss_rate |
| VIP_DOWNGRADE_RISK | VIP 강등 위험 | 등급 유지 기준 미달 | current_aum, threshold, shortfall |

#### 관계 (relationship)
| 코드 | 이름 | 설명 | 필요 데이터 |
|------|------|------|-------------|
| BIRTHDAY | 생일 | 고객 생일 | birth_date |
| ANNIVERSARY | 가입 기념일 | 가입 N주년 | join_date, years |
| LONG_NO_CONTACT | 장기 미접촉 | 연락 없이 N일 경과 | days_since_contact, last_contact_type |
| VIP_SPECIAL_DAY | VIP 기념일 | VIP 고객 특별일 | event_type, event_date |

#### 기회 (opportunity)
| 코드 | 이름 | 설명 | 필요 데이터 |
|------|------|------|-------------|
| NEW_PRODUCT_FIT | 신상품 적합 | 신상품 추천 대상 | product_id, fit_reason |
| PORTFOLIO_REBALANCE | 리밸런싱 필요 | 포트폴리오 조정 필요 | current_allocation, recommended |
| VIP_UPGRADE_CHANCE | VIP 승급 기회 | 승급 조건 근접 | current_aum, threshold, gap |
| CROSS_SELL | 교차 판매 기회 | 추가 상품 제안 | recommended_products |

---

## 4. 이벤트 상태 흐름

```
┌─────────┐     연락/처리      ┌───────────┐     완료      ┌───────────┐
│ pending │ ─────────────────▶ │ contacted │ ───────────▶ │ completed │
└─────────┘                    └───────────┘              └───────────┘
     │                                                          
     │ 무시/해제                                                 
     ▼                                                          
┌───────────┐                                                   
│ dismissed │                                                   
└───────────┘                                                   
```

| 상태 | 설명 | 전이 가능 상태 |
|------|------|----------------|
| pending | 처리 대기 | contacted, dismissed |
| contacted | 연락 완료 | completed, pending |
| completed | 처리 완료 | - |
| dismissed | 무시/해제 | pending |

---

## 5. 고객 등급 체계

### 5.1 고객 그룹

| 그룹 | 코드 | 설명 | 기준 예시 |
|------|------|------|----------|
| 주요고객 | vip | 핵심 관리 대상 | AUM 10억 이상 |
| 일반고객 | general | 일반 관리 대상 | AUM 1억~10억 |
| 가망고객 | prospect | 잠재 고객 | AUM 1억 미만 또는 신규 |

### 5.2 고객 등급

| 등급 | 기준 (AUM) | 혜택 |
|------|------------|------|
| Diamond | 50억 이상 | 전담 WM, 프리미엄 서비스 |
| Platinum | 20억~50억 | 우선 상담, 특별 이벤트 |
| Gold | 10억~20억 | VIP 라운지, 전용 상품 |
| Silver | 5억~10억 | 우대 수수료 |
| Bronze | 1억~5억 | 기본 서비스 |

---

## 6. 액션 유형

고객에게 취할 수 있는 액션 정의

| 액션 | 코드 | 설명 | 결과 기록 |
|------|------|------|----------|
| 전화 | call | 전화 연락 | 통화 시간, 메모 |
| 문자 | message | SMS/MMS 발송 | 발송 내용 |
| 이메일 | email | 이메일 발송 | 제목, 내용 |
| 방문 | visit | 고객 방문 상담 | 방문 시간, 메모 |
| 내방 | branch_visit | 지점 방문 상담 | 상담 시간, 메모 |

---

## 7. 위젯 시스템

### 7.1 위젯 개념

위젯은 대시보드에 표시되는 정보 단위로, **Template**과 **DataSource**의 조합으로 구성됩니다.

```
Widget = Template (UI 형태) + DataSource (데이터 매핑)
```

### 7.2 위젯 유형

| 유형 | 코드 | 설명 | 용도 |
|------|------|------|------|
| 액션 리스트 | action_list | 테이블 형태 목록 | 고객 목록, 이벤트 목록 |
| 바 차트 | bar_chart | 막대 차트 | 실적 비교, 분포 |
| 파이 차트 | pie_chart | 원형 차트 | 구성 비율 |
| 라인 차트 | line_chart | 선 차트 | 추세, 시계열 |
| 캘린더 | calendar | 달력 형태 | 일정, 만기일 |
| 피드 | feed | 타임라인 형태 | 뉴스, 알림 |
| 카드 | card | 단일 정보 카드 | 요약 지표 |
| 상태 | status | 상태 표시 | 목표 달성률 |

### 7.3 Template 속성

```yaml
template:
  id: string                    # 템플릿 ID
  type: string                  # 위젯 유형
  title: string                 # 제목
  
  size:
    width: 1-4                  # 그리드 너비
    height: number              # 그리드 높이
  
  grid:                         # 그리드 설정 (action_list)
    show_header: boolean
    row_height: compact|normal|comfortable
    stripe: boolean
    hover_highlight: boolean
  
  filter_area:                  # 필터 영역
    enabled: boolean
    position: top|inline
    show_search: boolean
  
  pagination:                   # 페이지네이션
    enabled: boolean
    position: bottom|top|both
    show_total: boolean
  
  action_area:                  # 액션 영역
    enabled: boolean
    position: row|toolbar|both
```

### 7.4 DataSource 속성

```yaml
datasource:
  id: string                    # 데이터소스 ID
  name: string                  # 이름
  
  query:                        # 쿼리 설정
    base_table: string          # 기본 테이블
    scenario_filter:
      categories: string[]      # 카테고리 필터
      codes: string[]           # 시나리오 코드 필터
    status_filter: string[]     # 상태 필터
    customer_group_filter: string[]
    date_range:
      type: relative|absolute
      relative_days: {start, end}
  
  columns:                      # 컬럼 바인딩
    - key: string
      label: string
      source: customer|scenario|event|account
      field: string
      format: text|number|currency|date|badge
      sortable: boolean
  
  filters:                      # 사용자 필터
    - key: string
      label: string
      type: select|multi_select|date_range|search
      options: [{value, label}]
  
  default_sort:
    field: string
    direction: asc|desc
  
  row_actions:                  # 행 액션
    - key: string
      label: string
      icon: string
      type: call|message|email|popup|navigate
```

---

## 8. 권한 체계

### 8.1 역할 (Role)

| 역할 | 설명 | 권한 |
|------|------|------|
| admin | 시스템 관리자 | 모든 권한 |
| wm | 자산관리사 | 담당 고객 관리, 대시보드 사용 |
| viewer | 조회자 | 조회만 가능 |

### 8.2 권한 등급 (Permission Level)

| 등급 | 설명 | 접근 범위 |
|------|------|----------|
| 1 | 최고 관리자 | 전체 시스템 |
| 2 | 본부 관리자 | 본부 내 모든 지점 |
| 3 | 지점장 | 지점 내 모든 WM |
| 4 | 팀장 | 팀 내 WM |
| 5 | 일반 WM | 본인 담당 고객만 |

---

## 9. 용어 사전

| 용어 | 영문 | 설명 |
|------|------|------|
| AUM | Assets Under Management | 운용 자산 총액 |
| WM | Wealth Manager | 자산관리사 |
| 시나리오 | Scenario | 고객에게 발생할 수 있는 이벤트 유형 |
| 이벤트 | Event | 특정 고객에게 발생한 시나리오 인스턴스 |
| 위젯 | Widget | 대시보드에 표시되는 정보 단위 |
| 템플릿 | Template | 위젯의 UI 형태 정의 |
| 데이터소스 | DataSource | 위젯의 데이터 매핑 정의 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-01-30 | 최초 작성 |
