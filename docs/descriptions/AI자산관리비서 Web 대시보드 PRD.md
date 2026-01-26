# AI자산관리비서 Web 대시보드 PRD
1. 프로젝트 개요 (Context & Goals)
    - 배경
        - 사내 투자정보와 영업 관련 업무 자료가 파편화되어 실제 WM이 영업을 위해 많은 시간을 할애하고 있음.
        - WM이 정보를 다루고 생산하는 능력에 따라서 영업 성과의 편차가 크기 때문에 격차를 줄여주기 위한 도구가 필요.
        - WM 지원 조직간의 연계가 독립적이고 느슨하여 시너지 효과가 저조.
    - 목적
        - WM이 영업준비에 할애하는 시간을 최소화하여 영업 효율성을 높임.
        - 투자전략 부문의 인사이트와 금융상품 정보를 WM에게 효율적으로 전달.
        - AI를 활용한 서비스로 WM의 상담 역량을 강화하여 고객 서비스 품질 제고.
    - 핵심 지표(Success Metrics)
        - Efficiency: WM의 고객 상담 준비 시간 50% 단축.
        - Adoption: 런칭 후 6개월 내 WM 서비스 침투율(사용률) 60% 달성.
        - Satisfaction: 사용자 만족도 조사를 통한 정성적 평가를 통해 효용성 검증.
2. 유저 스토리 (User Stories)
    - WM:  
        "나는 관리 고객에게 발생한 이벤트(고액 입출금, 상품 만기 등)를 즉시 파악하고, 최적화된 시각화 자료를 활용해 전문적인 상담을 하고 싶다."
    - 투자전략 부문 실무자:  
          "우리 조직에서 작성하는 시장 전망과 핵심 금융상품 정보가 WM들에게 파편화되지 않고 효율적으로 전달되어 실제 영업 현장에서 활용되길 원한다."
    - 관리자:  
          "사용자 조직과 권한에 따라 노출되는 정보 템플릿을 통제하고, 보안 정책에 맞게 시스템을 운영하고 싶다."
3. 서비스 구성
    - 서비스는 다음 3가지 영역으로 이루어져 있음
        - View 영역: UI/UX를 담당
        - Model 영역: 메타데이터 및 비즈니로 로직 데이터 파이프라인 역할
        - Provider 영역: 개별 비즈니스 로직 데이터 생산자 영역
4. 핵심 기능 요구사항 (Functional Requirements)
    - 3.1 정보 구조 및 권한 관리 (Admin & Governance)
        - [RQ-01] 사용자 그룹화 및 권한 관리: 직급, 지점, 역할(PB, RA 등)에 따라 사용자를 그룹핑하고 메뉴 및 데이터 접근 권한을 차등 부여.
        - [RQ-02] 정보 템플릿 관리: 제공되는 인사이트와 상품 정보는 사전에 정의된 특정 템플릿 형태로 존재하며, 관리자가 템플릿별 게시 및 수정 권한을 제어함. `위젯템플릿정의.md` 파일을 참고하여 구현
        - [RQ-03] 정보 커스터마이징: WM은 본인의 영업 스타일이나 주요 관심 고객군에 따라 대시보드에서 보고자 하는 정보 항목(위젯)을 개인별로 설정 가능.
    - 3.2 고객 맞춤형 인사이트 및 관리 (Client Intelligence)
        - [RQ-04] 고객 이벤트 알리미: 고객의 신변 변화(만기, 기념일) 및 자산 변동(거액 입출금, 담보부족 등) 발생 시 실시간 알림 제공.
        - [RQ-05] 고객 그룹핑 및 필터링: 관리 고객을 투자 성향, 자산 규모, 선호 상품별로 그룹핑하고 해당 그룹별로 맞춤형 리포트나 메시지를 일괄 관리하는 기능.
        - [RQ-06] 데이터 시각화: 포트폴리오 수익률 추이, 자산 배분 현황, 시장 변동성 지표 등을 차트 및 그래프로 시각화하여 상담 시 시각적 자료로 즉시 활용 가능.
    - 3.3 투자전략 및 상품 정보 전달 (Communication)
        - [RQ-07] 전략-상품 패키징: 투자전략 부문에서 발간한 하우스 뷰와 그에 매칭되는 추천 금융상품 정보를 연계하여 WM에게 통합 전달.
        - [RQ-08] AI브리핑 노트: 고객 이벤트와 전략 부문의 시장 뷰를 결합하여 "오늘 이 고객에게 제안할 한 줄 멘트와 상품" 요약 제공.
        - [RQ-09] 사내 영업정보 연경(WM 게시판 등): WM 게시판 등 사내 영업 정보와 플랫폼 연계
    - 3.4 투자전략 Web/BE 시스템 연동
        - [RQ-10] 투자전략 Web과 View 연동
        - [RQ-11] 투자전략 Back End AP 의 Provider 연동
5. 기술 및 UI/UX 정책
    - 시각화 정책: 복잡한 수치 데이터를 직관적인 인포그래픽(Bar, Pie, Heatmap 등)으로 변환 템플릿 제공.
    - 개인화 레이아웃: 사용자 대시보드 편집 기능 제공.
        - ![](https://ci3.googleusercontent.com/meips/ADKq_NZ4bfM8ney5UsDJwx8Wt6jNxYvwmlWDZdFw9qgmV7H4WDrqvSAZA6ZKRSdLnE_bxDpjki_wHQXCkYqTWNvu5ygP7Qk6krbg3jy-xWaUYwNU2mwZpiXZTLaECK8l1mSIq_IrPQy49V236ycHMDTm9yqVyQXln4VpUgewXnpmWpFy858L2K8kr2fa7JUO7ZxdOYVHyrFfllwU0SMVOfjBhWRZ9T6kurYc=s0-d-e1-ft#https://wiki.miraeassetsecurities.com/download/attachments/53774877/image-2025-12-30_16-28-7.png?version=1&modificationDate=1767079687682&api=v2)  
        - ![](https://ci3.googleusercontent.com/meips/ADKq_NZQFzwUkWcjnRBtJ_EHH5MTq9-CJHgAs6zlCssEaeiMdmbE8iJFlNGpNiKsZxc8jh1piz_PPrKQ3t8h4y5rHIB4QtV6nQP-T2ihw-GeUFBEWCXUjx4n0z7HOf4LzGAJ9T7LwaMU7pm9Hf5h7-GyjbWn6-Nezb-cLrvXCk957gQBZEonbw5I5lYyiKN3EcfOtej5l31dQLagNoNiOyJwH_NwpJXTi2EkmQ=s0-d-e1-ft#https://wiki.miraeassetsecurities.com/download/attachments/53774877/image-2025-12-30_16-28-20.png?version=1&modificationDate=1767079700473&api=v2)
    - 보안: 보안성 심사 요건에 부합하는 시스템 요건 준수 (개인정보보호 & 침해대응)
6. 단계별 로드맵 (Phasing)
    - Phase 1: MVP 권한 관리 체계 수립, 시각화 대시보드 구축, 투자전략/금융상품 정보 등 커스터마이징할 위젯 템플릿화.
    - Phase 2: 사내 지식 데이터 연동 (WM게시판 연동) 및 투자전략 Web/BE 연동
    - Phase 3: 고객 이벤트 알림 연동 및 고객 그룹핑 관리 기능 고도화.
    - Phase 4: 사용자 만족도 조사 및 사용 패턴 분석을 통한 개인화 추천 엔진 최적화.