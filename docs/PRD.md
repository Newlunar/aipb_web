# AI 자산관리비서 Web 대시보드 PRD v2.1

## 1. 프로젝트 개요

### 1.1 배경

- 사내 투자정보와 영업 관련 업무 자료가 파편화되어 WM이 영업 준비에 많은 시간을 할애
- WM의 정보 처리 역량에 따른 영업 성과 편차가 큼
- WM 지원 조직 간 연계가 느슨하여 시너지 효과 저조

### 1.2 목적

- WM의 영업 준비 시간 최소화로 영업 효율성 제고
- 투자전략 부문의 인사이트와 금융상품 정보를 WM에게 효율적으로 전달
- AI 활용 서비스로 WM 상담 역량 강화 및 고객 서비스 품질 향상

### 1.3 핵심 지표 (Success Metrics)

| 지표 | 목표 |
| ----------- | ------------ |
| Efficiency | WM 고객 상담 준비 시간 50% 단축 |
| Adoption | 런칭 후 6개월 내 WM 서비스 사용률 60% 달성 |
| Satisfaction | 사용자 만족도 조사 기반 효용성 검증 |

---

### 4.1 위젯 크기 가이드라인

| 위젯 유형 | 권장 크기 (width) | 용도 |
| ----------- | ------------ | ------------ |
| 요약 타일 | 1 | 단일 숫자 강조 |
| 상태형 | 1 | 긴급도 표시 |
| 바 차트 | 2 | 비교 시각화 |
| 캘린더 | 2 | 월간 일정 |
| 피드형 | 2 | 뉴스/알림 목록 |
| 액션 리스트 | 2~4 | 고객 목록 (데이터 양에 따라) |
| 도넛 차트 | 2 | 비율 시각화 |

---

## 5. 시스템 아키텍처

### 5.1 기술 스택

| 구분 | 기술 |
| ----------- | ------------ |
| Frontend | React |
| 차트 라이브러리 | Recharts |
| 데이터 저장 | JSON (파일 기반) |
| 패키지 관리 | pnpm |
| 테스트 | pytest, pytest-cov |

### 5.2 프로젝트 구조

```
aipb_web_e/
├── src/
│   ├── frontend/                        # React 프론트엔드
│   │   ├── components/                  # UI 컴포넌트 (위젯, 공용 뷰 등)
│   │   ├── pages/                       # 페이지 단위 컴포넌트
│   │   ├── styles/                      # 스타일(CSS/SCSS)
│   │   └── app.tsx                      # 엔트리포인트
│   ├── charts/                          # Recharts 기반 차트 컴포넌트 및 래퍼
│   ├── backend/                         # (옵션) API 모킹/서버
│   │   ├── mock_data.py                 # 테스트용 데이터 유틸리티
│   │   └── core/                        # 데이터 처리(엔진)
│   │       └── widget_engine.py         # 템플릿-데이터 결합 엔진
│   ├── domain/                          # 공유 타입/데이터 모델
│   │   └── models.py                    # Dataclass 모델 정의
│   ├── templates/                       # 위젯 템플릿 (비즈니스 로직)
│   │   ├── base_template.py             # 추상 베이스
│   │   ├── action_list.py               # 액션 리스트 템플릿
│   │   ├── bar_chart.py                 # 바 차트 템플릿
│   │   ├── feed.py                      # 피드형 템플릿
│   │   ├── calendar.py                  # 캘린더 템플릿
│   │   └── ...                          # 추가 템플릿
│   ├── tests/
│   │   ├── frontend/                    # 프론트엔드 테스트
│   │   ├── backend/                     # 백엔드(pytest) 테스트
│   │   └── coverage/                    # 테스트 커버리지 리포트
│   └── utils/                           # 공통 유틸리티 함수/모듈
├── data/
│   ├── widgets/
│   │   ├── attributes/                  # 위젯 속성 JSON
│   │   └── content/                     # 실제 값/컨텐츠 JSON
│   └── pages/
│       └── main_dashboard/
│           └── layout.json              # 레이아웃 스키마
├── package.json                         # pnpm 패키지 설정 (프론트엔드)
├── pnpm-lock.yaml
├── pytest.ini                           # pytest 설정
└── docs/
    └── descriptions/                    # 기획/기술 문서
```

### 5.3 템플릿-데이터 분리 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Widget Engine                          │
├─────────────────────────────────────────────────────────────┤
│  Template (Python)  +  Attributes (JSON)  +  Content (JSON) │
│        ↓                    ↓                    ↓          │
│   렌더링 로직          위젯 메타정보          표시할 데이터    │
│   (action_list.py)    (title, size,         (items, values) │
│                        visible)                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Page Layout (JSON)                       │
│   - 페이지별 위젯 배치 정보 (position: row, col)             │
│   - 동일 위젯을 여러 페이지에서 다른 위치에 배치 가능          │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 위젯 명세

### 6.1 위젯 템플릿 목록

#### Phase 1 (MVP) - 구현 완료

| # | 템플릿 | 클래스 | 용도 |
| ----------- | ------------ | ------------ | ------------ |
| 1 | 액션 리스트 | `ActionListTemplate` | 고객 목록 표시, 필터링, 상담 연결 버튼 |
| 2 | 바 차트 | `BarChartTemplate` | 날짜별/그룹별 데이터 비교 시각화 |
| 3 | 피드형 | `FeedTemplate` | 뉴스/알림 타임라인 표시 |
| 4 | 캘린더형 | `CalendarTemplate` | 일정/이벤트 캘린더 뷰 |

#### Phase 2 - 구현 예정

| # | 템플릿 | 클래스 | 용도 |
| ----------- | ------------ | ------------ | ------------ |
| 5 | 요약 타일 | `CardTemplate` | 핵심 숫자 강조, 건수 요약 표시 |
| 6 | 파이/도넛 차트 | `PieChartTemplate` | 점유율, 비중, 달성률 시각화 |
| 7 | 라인 차트 | `LineChartTemplate` | 시계열 추이 분석 |
| 8 | 상태형 | `StatusTemplate` | 신호등/배지로 긴급도 표시 |
| 9 | 검색창 | `QueryTemplate` | 게시판/리서치 자료 검색 |
| 10 | 메모형 | `MemoTemplate` | 일정별 메모 표시 및 편집 |

### 6.2 위젯 인터랙션 명세

#### 클릭 동작

| 위젯 | 클릭 대상 | 동작 | 결과 |
| ----------- | ------------ | ------------ | ------------ |
| 액션 리스트 | 고객 행 | 팝업 표시 | 고객 상세 정보 + 상담 연결 버튼 |
| 바 차트 | 개별 바 | 드릴다운 | 해당 카테고리 고객 목록 팝업 |
| 캘린더 | 일자 셀 | 드릴다운 | 해당일 시나리오별 건수 → 고객 목록 |
| 피드형 | 피드 항목 | 팝업 표시 | 뉴스/알림 상세 내용 |
| 요약 타일 | 카드 전체 | 드릴다운 | 관련 고객 목록 팝업 |
| 상태형 | 상태 배지 | 드릴다운 | 해당 상태 고객 목록 팝업 |
| 도넛 차트 | 섹터 | 드릴다운 | 해당 영역 상세 정보 |

#### 위젯 간 연동 (Phase 4 이후)

| 소스 위젯 | 타겟 위젯 | 연동 방식 |
| ----------- | ------------ | ------------ |
| 캘린더 | 액션 리스트 | 선택 일자로 필터링 |
| 요약 타일 | 액션 리스트 | 선택 시나리오로 필터링 |
| 바 차트 | 액션 리스트 | 선택 카테고리로 필터링 |

### 6.3 위젯 데이터 구조

#### 위젯 속성 (attributes/*.json)

```json
{
  "widget_id": "action_list_001",
  "template_type": "action_list",
  "title": "만기 고객 목록",
  "size": { "width": 2, "height": 1 },
  "visible": true
}
```

#### 위젯 콘텐츠 (content/*.json)

```json
{
  "widget_id": "action_list_001",
  "content": {
    "items": [...],
    "filters": ["scenario", "amount_range"]
  }
}
```

#### 페이지 레이아웃 (pages/*/layout.json)

```json
{
  "page_id": "main_dashboard",
  "title": "메인 대시보드",
  "widgets": [
    { "widget_id": "action_list_001", "position": { "row": 0, "col": 0 } },
    { "widget_id": "bar_chart_001", "position": { "row": 0, "col": 2 } }
  ]
}
```

### 6.4 페이지 구성

| 페이지 | 경로 | 기능 |
|--------|------|------|
| 위젯 보기 | `/` | 4열 그리드 레이아웃으로 위젯 렌더링, 자동 줄바꿈 지원 |
| 템플릿 관리 | `/template` | 위젯 생성/수정, 위젯 목록 관리, 페이지 레이아웃 관리 |

### 6.5 그리드 시스템

- **4열 기반 레이아웃**: `size.width` 값으로 위젯 너비 지정 (1~4)
- **자동 줄바꿈**: 행의 총 너비가 4를 초과하면 다음 줄로 자동 이동
- **빈 공간 처리**: 행의 총 너비가 4 미만이면 빈 열로 채움

---

## 7. 데이터 모델 (Dataclass)

### 7.1 Phase 1 모델

#### 액션 리스트

```python
@dataclass
class ActionListItem:
    customer_name: str
    account_number: str
    amount: float
    scenario: str
    action_type: str

@dataclass
class ActionListContent:
    items: List[ActionListItem]
    filters: List[str]
```

#### 바 차트

```python
@dataclass
class BarChartContent:
    categories: List[str]
    values: List[float]
    colors: Optional[List[str]] = None
    x_label: str = ""
    y_label: str = ""
```

#### 피드형

```python
@dataclass
class FeedItem:
    timestamp: str
    title: str
    content: str
    icon: Optional[str] = None
    link: Optional[str] = None

@dataclass
class FeedContent:
    items: List[FeedItem]
```

#### 캘린더형

```python
@dataclass
class CalendarEvent:
    date: str
    event_type: str
    count: int
    color: str
    scenarios: List[str]

@dataclass
class CalendarContent:
    events: List[CalendarEvent]
```

---

## 10. 향후 개발 로드맵

### Phase 0: model 및 template 정의

- [ ] model 정의
- [ ] template 속성 정의

### Phase 1: 페이지 및 템플릿 구현

- [ ] 템플릿-데이터 분리 아키텍처 구축
- [ ] 핵심 위젯 1종 구현 (액션 리스트)
- [ ] 위젯 보기 페이지
- [ ] 템플릿 관리 페이지 (위젯 생성/수정, 레이아웃 관리)
- [ ] 페이지별 레이아웃 분리

### Phase 2: 위젯 확장

- [ ] 요약 타일(Card) 위젯
- [ ] 파이/도넛 차트 위젯
- [ ] 라인 차트 위젯
- [ ] 상태형(Status) 위젯
- [ ] 검색창(Query) 위젯
- [ ] 메모형(Memo) 위젯
- [ ] 위젯 클릭 인터랙션 (팝업, 드릴다운)

### Phase 3: 권한 관리

- [ ] 사용자 그룹화 및 권한 관리 (직급, 지점, 역할별)
- [ ] 템플릿별 게시/수정 권한 제어
- [ ] 개인별 대시보드 커스터마이징

### Phase 4: 데이터 연동

- [ ] 투자전략 Web/BE 시스템 연동
- [ ] 사내 영업정보 연계 (WM 게시판 등)
- [ ] 고객 이벤트 실시간 알림 연동
- [ ] 위젯 간 연동 (필터 공유)

### Phase 5: AI 기능

- [ ] AI 브리핑 노트 (고객 이벤트 + 시장 뷰 결합)
- [ ] 개인화 추천 엔진

---

## 11. 실행 방법

```bash
# 의존성 설치
uv sync

# 앱 실행
uv run streamlit run src/presentation/app.py
```

---

## 12. 참고 문서
- [기존 PRD](./descriptions/AI자산관리비서%20Web%20대시보드%20PRD.md)
- [위젯 템플릿 정의](./descriptions/위젯템플릿정의.md)
