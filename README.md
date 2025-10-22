# 하이웍스 자동 출근 체크인 (Playwright)

하이웍스 출근 체크인을 자동화하는 Playwright 기반 스크립트입니다.

## 주요 변경사항 (Puppeteer → Playwright)

이 프로젝트는 Puppeteer에서 Playwright로 완전히 마이그레이션되었습니다.

### Playwright 장점
- 더 빠른 실행 속도
- 더 안정적인 요소 선택 (Auto-waiting)
- 강력한 디버깅 도구
- 여러 브라우저 지원 (Chromium, Firefox, WebKit)
- 더 나은 테스트 리포트

### 주요 코드 변경사항
- `puppeteer` → `playwright` 라이브러리 사용
- `page.locator()` → `page.getByLabel()`, `page.getByRole()` 등 더 의미있는 셀렉터 사용
- `page.waitForNavigation()` → `page.waitForLoadState('networkidle')` 사용
- Browser Context 패턴으로 더 나은 격리 환경 제공

## 설치

```bash
npm install
```

Playwright 브라우저 설치:
```bash
npx playwright install
```

## 환경 설정

`.env.example` 파일을 `.env`로 복사하고 정보를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
OFFICE_DOMAIN=your_office_domain_here
HIWORKS_USER_ID=your_id_here
HIWORKS_PASSWORD=your_password_here
DEBUG=false
```

## 사용법

### 일반 실행
```bash
npm start
# 또는
npm run checkin
```

### 디버그 모드 실행
디버그 모드에서는 브라우저가 보이고, 각 단계별 스크린샷이 저장됩니다:
```bash
npm run debug
```

## 스크립트 동작 방식

1. Playwright Chromium 브라우저 실행
2. 하이웍스 로그인 페이지 접속
3. 사용자 ID 입력
4. 비밀번호 입력 및 로그인
5. 근무/경비처리 메뉴 클릭
6. 출근하기 버튼 클릭
7. 브라우저 종료

## 디버그 모드

`DEBUG=true`로 설정하면:
- 브라우저가 화면에 표시됨
- 각 단계별 상세 로그 출력
- 스크린샷 자동 저장 (`screenshot-*.png`)
- 에러 발생 시 스크린샷 저장

## Playwright 설정

`playwright.config.js` 파일에서 다양한 설정을 변경할 수 있습니다:
- 타임아웃 설정
- 스크린샷/비디오 옵션
- 테스트 브라우저 선택 (Chromium, Firefox, WebKit)
- 리포트 형식

## 문제 해결

### 브라우저가 실행되지 않을 때
```bash
npx playwright install
```

### 요소를 찾을 수 없을 때
디버그 모드로 실행하여 스크린샷을 확인하세요:
```bash
npm run debug
```

### 로그인 실패
1. `.env` 파일의 계정 정보 확인
2. 하이웍스 로그인 페이지 구조 변경 여부 확인
3. 디버그 모드로 실행하여 어느 단계에서 실패하는지 확인

## 라이선스

ISC

## 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!
