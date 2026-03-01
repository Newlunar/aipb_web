"""
위젯 코드 레지스트리 (C001 형식 넘버링)
각 template별 세부 위젯 식별용
"""
from typing import Literal

TemplateType = Literal["summary-card", "action-list", "bar-chart", "text-block"]

# code -> { template, data_source? 또는 variant, title }
WIDGET_CODE_REGISTRY: dict[str, dict] = {
    # ----- summary-card -----
    "SC001": {
        "template": "summary-card",
        "variant": "stats",
        "title": "요약 지표",
        "description": "관리 고객, AUM, 긴급 조치 등",
    },
    "SC002": {
        "template": "summary-card",
        "variant": "settings",
        "title": "요약 카드 설정",
        "description": "card_type별 value, description",
    },
    # ----- action-list -----
    "AL001": {
        "template": "action-list",
        "data_source": "maturity",
        "title": "만기 고객 목록",
        "description": "예금/펀드/ELS/채권 만기",
    },
    "AL002": {
        "template": "action-list",
        "data_source": "no-contact",
        "title": "장기 미접촉 고객",
        "description": "연락 없는 고객",
    },
    "AL003": {
        "template": "action-list",
        "data_source": "vip-risk",
        "title": "VIP 강등 위험 고객",
        "description": "VIP 기준 미달 위험",
    },
    # ----- bar-chart -----
    "BC001": {
        "template": "bar-chart",
        "data_source": "scenario-count",
        "title": "시나리오별 건수",
        "description": "시나리오 유형별 pending 건수",
    },
    "BC002": {
        "template": "bar-chart",
        "data_source": "event-by-grade",
        "title": "등급별 이벤트",
        "description": "VIP/일반별 만기·미접촉·VIP위험 건수",
    },
    "BC003": {
        "template": "bar-chart",
        "data_source": "monthly-aum",
        "title": "월별 AUM 추이",
        "description": "예금/펀드/주식 월별",
    },
    # ----- text-block -----
    "TB001": {
        "template": "text-block",
        "data_source": "feed",
        "title": "피드/브리핑",
        "description": "뉴스, 리서치, 시그널 등",
    },
}


def get_widget_by_code(code: str) -> dict | None:
    """코드로 위젯 설정 조회 (대소문자 무시)"""
    return WIDGET_CODE_REGISTRY.get(code.upper())


def get_codes_by_template(template: TemplateType) -> list[str]:
    """template별 등록된 코드 목록"""
    return [c for c, cfg in WIDGET_CODE_REGISTRY.items() if cfg.get("template") == template]


def list_all_codes() -> list[dict]:
    """전체 코드 목록 (코드, template, title)"""
    return [
        {
            "code": code,
            "template": cfg["template"],
            "title": cfg.get("title", ""),
            "description": cfg.get("description", ""),
        }
        for code, cfg in WIDGET_CODE_REGISTRY.items()
    ]
