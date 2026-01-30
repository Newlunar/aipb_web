# AI 자산관리비서 Web 대시보드 PRD v2.0

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
|------|------|
| Efficiency | WM 고객 상담 준비 시간 50% 단축 |
| Adoption | 런칭 후 6개월 내 WM 서비스 사용률 60% 달성 |
| Satisfaction | 사용자 만족도 조사 기반 효용성 검증 |

---

## 2. 시스템 아키텍처

### 2.1 기술 스택
| 구분 | 기술 |
|------|------|
| Frontend | Streamlit |
| 차트 라이브러리 | Plotly |
| 데이터 저장 | JSON (파일 기반) |
| 패키지 관리 | uv (Python) |
| 테스트 | pytest, pytest-cov |

### 2.2 프로젝트 구조
```
aipb_web_d/
├── src/
│   ├── core/                    # 핵심 엔진
│   │   ├── widget_engine.py     # 위젯 엔진 (템플릿-데이터 결합)
│   │   └── mock_data.py         # 데이터 유틸리티
│   ├── domain/
│   │   └── models.py            # 데이터 모델 (Dataclass)
│   ├── templates/               # 위젯 템플릿
│   │   ├── base_template.py     # 추상 베이스 템플릿
│   │   ├── action_list.py       # 액션 리스트 템플릿
│   │   ├── bar_chart.py         # 바 차트 템플릿
│   │   ├── feed.py              # 피드형 템플릿
│   │   └── calendar.py          # 캘린더 템플릿
│   └── presentation/            # UI 레이어
│       ├── app.py               # 메인 앱 진입점
│       ├── widget_view_page.py  # 위젯 보기 페이지
│       └── template_manager_page.py  # 템플릿 관리 페이지
├── data/
│   ├── widgets/
│   │   ├── attributes/          # 위젯 속성 데이터 (JSON)
│   │   └── content/             # 위젯 컨텐츠 데이터 (JSON)
│   └── pages/
│       └── main_dashboard/
│           └── layout.json      # 페이지 레이아웃 데이터
└── docs/
    └── descriptions/            # 기획 문서
```

### 2.3 템플릿-데이터 분리 아키텍처
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

## 3. 구현된 기능

### 3.1 위젯 템플릿 (4종 구현 완료)

| # | 템플릿 | 클래스 | 용도 |
|---|--------|--------|------|
| 1 | 액션 리스트 | `ActionListTemplate` | 고객 목록 표시, 필터링, 상담 연결 버튼 |
| 2 | 바 차트 | `BarChartTemplate` | 날짜별/그룹별 데이터 비교 시각화 |
| 3 | 피드형 | `FeedTemplate` | 뉴스/알림 타임라인 표시 |
| 4 | 캘린더형 | `CalendarTemplate` | 일정/이벤트 캘린더 뷰 |

### 3.2 위젯 데이터 구조

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

#### 위젯 컨텐츠 (content/*.json)
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

### 3.3 페이지 구성

| 페이지 | 경로 | 기능 |
|--------|------|------|
| 위젯 보기 | `/` | 4열 그리드 레이아웃으로 위젯 렌더링, 자동 줄바꿈 지원 |
| 템플릿 관리 | `/template` | 위젯 생성/수정, 위젯 목록 관리, 페이지 레이아웃 관리 |

### 3.4 그리드 시스템
- **4열 기반 레이아웃**: `size.width` 값으로 위젯 너비 지정 (1~4)
- **자동 줄바꿈**: 행의 총 너비가 4를 초과하면 다음 줄로 자동 이동
- **빈 공간 처리**: 행의 총 너비가 4 미만이면 빈 열로 채움

---

## 4. 데이터 모델 (Dataclass)

### 4.1 액션 리스트
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

### 4.2 바 차트
```python
@dataclass
class BarChartContent:
    categories: List[str]
    values: List[float]
    colors: Optional[List[str]] = None
    x_label: str = ""
    y_label: str = ""
```

### 4.3 피드형
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

### 4.4 캘린더형
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

## 5. 향후 개발 계획

### Phase 1: MVP (현재 완료)
- [x] 템플릿-데이터 분리 아키텍처 구축
- [x] 핵심 위젯 4종 구현 (액션 리스트, 바 차트, 피드, 캘린더)
- [x] 위젯 보기 페이지 (4열 그리드, 자동 줄바꿈)
- [x] 템플릿 관리 페이지 (위젯 생성/수정, 레이아웃 관리)
- [x] 페이지별 레이아웃 분리

### Phase 2: 위젯 확장
- [ ] 요약 타일(Card) 위젯
- [ ] 파이/도넛 차트 위젯
- [ ] 라인 차트 위젯
- [ ] 상태형(Status) 위젯
- [ ] 검색창(Query) 위젯

### Phase 3: 권한 관리
- [ ] 사용자 그룹화 및 권한 관리 (직급, 지점, 역할별)
- [ ] 템플릿별 게시/수정 권한 제어
- [ ] 개인별 대시보드 커스터마이징

### Phase 4: 데이터 연동
- [ ] 투자전략 Web/BE 시스템 연동
- [ ] 사내 영업정보 연계 (WM 게시판 등)
- [ ] 고객 이벤트 실시간 알림 연동

### Phase 5: AI 기능
- [ ] AI 브리핑 노트 (고객 이벤트 + 시장 뷰 결합)
- [ ] 개인화 추천 엔진

---

## 6. 실행 방법

```bash
# 의존성 설치
uv sync

# 앱 실행
uv run streamlit run src/presentation/app.py
```

---

## 7. 참고 문서
- [기존 PRD](./descriptions/AI자산관리비서%20Web%20대시보드%20PRD.md)
- [위젯 템플릿 정의](./descriptions/위젯템플릿정의.md)
