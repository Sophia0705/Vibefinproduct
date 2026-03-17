# Vibe FinProduct

금융감독원(FSS) Open API를 활용해 **예·적금 상품 금리/조건을 수집 → 정규화 → 저장(MySQL) → 비교/검색**할 수 있게 만든 서비스입니다.

## 서비스 개요

- **문제**: 은행/상품별 금리(기본/우대), 가입조건, 기간(개월)별 옵션 정보가 흩어져 있어 비교가 번거로움
- **해결**: 금감원 Open API 데이터를 주기적으로 동기화해서 DB에 쌓고, 화면에서 **은행/상품유형(예금·적금)/검색어/페이지네이션**으로 빠르게 탐색

## 주요 기능

- **데이터 동기화(관리자)**: 금감원 API → MySQL upsert 적재
- **상품 조회**: 예금/적금 목록 + 기간별 금리 옵션 함께 조회
- **필터/검색**: 은행 필터, 상품명/은행명 검색, 페이지 번호 기반 페이지네이션
- **운영 편의(관리자)**: 동기화 반복 실행 시 발생할 수 있는 **옵션 중복 정리** 기능 제공

## 기술 스택 & 구조

- **Frontend (`frontend/`)**
  - Next.js (App Router) + Tailwind
  - `/products`: 조회/검색/필터/페이지네이션 UI
  - `/admin`: 관리자 동기화(로그인 보호)

- **Backend (`backend/`)**
  - NestJS + TypeORM + MySQL
  - 금감원 API 수집/매핑/저장 로직
  - 조회 API: 상품 목록/은행 목록 제공

- **DB 모델**
  - `saving_products`: 상품 기본정보(금융사/상품코드/상품명/가입조건 등)
  - `saving_product_options`: 기간(개월)별 금리 옵션(기본/우대, 적립유형 등)
  - 관계: `SavingProduct (1) : (N) SavingProductOption`

## 보안/운영 고려

- **API Key 보호**: 금감원 키는 브라우저에 노출하지 않고 **백엔드에서만** 사용
- **관리자 보호**
  - 프론트 `/admin`은 로그인(쿠키 gate)으로 접근 제한
  - 백엔드 관리자 API는 `x-admin-token` 헤더로 보호
- **로고(은행 CI)**
  - 외부 파비콘/로고 호출은 불안정해서 제거
  - `finCoNo -> 로컬 src` 매핑 방식으로 **프로젝트 정적 자산**을 사용하도록 구성

## 빠른 시작(요약)

실행/환경변수 상세는 각 폴더의 README를 참고하세요.

- `backend/README.md`
- `frontend/README.md`

일반적으로는:

```bash
# backend
cd backend
npm install
npm run start:dev

# frontend
cd ../frontend
npm install
npm run dev
```

## 라이선스/주의

- 은행 로고(CI)는 상표/저작권 이슈가 있을 수 있어 **각 은행의 사용 정책**을 확인하세요. 

