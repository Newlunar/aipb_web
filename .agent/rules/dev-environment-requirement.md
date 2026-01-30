---
trigger: always_on
---

## 🐍 Python & `uv` 전용 개발 규칙 (Python-Specific Rules)

### 1. 기술 스택 및 구현 원칙 ###
* **UI/Frontend:** Streamlit을 사용하여 MVP를 구현한다.
* **Backend:** 별도의 백엔드 프레임워크(FastAPI 등) 없이 Streamlit 내부 로직으로 최소화한다.
* **Data:** 실제 DB를 사용하지 않는다. `src/core/mock_data.py` 또는 각 서비스 내에 가상 데이터(Mock Data)를 정의하여 사용한다.
* **설계 철학:** "Fast MVP First". 복잡한 아키텍처보다 Streamlit의 기능을 최대한 활용한 빠른 프로토타이핑을 지향한다.
* **데이터 연동:** 각 단계의 데이터 연동은 src/ 내의 가상 데이터 객체를 호출하는 방식으로 설계한다.Streamlit의 st.session_state를 활용하여 상태 관리를 계획한다.

### 2. 의존성 및 환경 관리 (`uv` 중심)
* **패키지 관리:** 모든 패키지 설치 및 실행은 `uv`를 사용한다. (예: `uv pip install`, `uv run python`)
* **가상환경:** 프로젝트 루트의 `.venv`를 항상 참조하며, 새로운 패키지 추가 시 `pyproject.toml`에 명시적으로 반영되었는지 확인한다.
* **스크립트 실행:** `python script.py` 대신 `uv run script.py`를 제안하여 환경 격리를 보장한다.
* **폴더 구조 규칙**
- 소스 코드: `src/` (src layout 적용)
- 테스트: `tests/` (unit, integration 분리)
- 문서/계획: `docs/plans/`
- 기획안: `docs/descriptions`

### 3. 코드 스타일 및 아키텍처
* **타입 힌트(Type Hinting):** 모든 함수 정의에는 매개변수와 반환값의 타입을 명시해야 한다. (`typing` 모듈 활용)
```python
def get_asset_value(asset_id: str) -> float:

```
* **문서화:** 모든 클래스와 주요 함수에는 `Google Style Docstring`을 작성한다.


### 4. TDD 및 품질 게이트 (Python 특화)
* **테스트 프레임워크:** `pytest`를 기본으로 사용한다.
* **Mocking:** 외부 API(은행 연동, AI 모델 호출 등)는 `unittest.mock` 또는 `pytest-mock`을 사용하여 격리한다.
* **커버리지 확인:** `pytest-cov`를 활용해 비즈니스 로직의 커버리지를 체크하며, `dev-principal-guide.md`에 명시된 80% 기준을 엄격히 적용한다.
```bash
uv run pytest --cov=src --cov-report=term-missing

```

### 5. AI 자산 관리 프로젝트 특화 규칙
* **데이터 보안:** 코드 내에 API Key나 계좌 정보 등의 민감 정보(Sensitive Data)를 하드코딩하지 않는다. 반드시 `.env` 파일과 `python-dotenv`를 사용하도록 설계한다.
* **클린아키텍쳐:** 클린아키텍쳐를 고려한 개발을 진행한다.


### 6. 안티그래비티를 위한 행동 지침 (Behavioral Rules)
* **에러 분석:** `Traceback`이 발생하면 단순히 코드를 고치려 하지 말고, 발생 원인을 한 문장으로 요약한 뒤 수정 계획을 제시하라.
* **상태 확인:** 파일을 수정하기 전, `ls -R`이나 `cat`을 통해 현재 프로젝트 구조와 의존성을 먼저 파악하라.
* **단계별 커밋:** 각 TDD 단계(Red/Green/Refactor)가 완료될 때마다 변경 사항을 요약하여 사용자에게 보고하라.