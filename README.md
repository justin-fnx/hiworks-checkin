# 하이웍스 자동 출근 체크인 (Playwright Python)

하이웍스 출근 체크인을 자동화하는 Playwright Python 기반 스크립트입니다.

## 주요 변경사항

### Node.js → Python 마이그레이션
이 프로젝트는 Node.js에서 Python으로 완전히 마이그레이션되었습니다.
Android 환경에서도 동작할 수 있도록 Python 기반으로 변경되었습니다.

### Playwright Python 장점
- 더 빠른 실행 속도
- 더 안정적인 요소 선택 (Auto-waiting)
- 강력한 디버깅 도구
- 여러 브라우저 지원 (Chromium, Firefox, WebKit)
- Python 생태계 활용 가능
- Android 디바이스 연동 지원

## 요구사항

- Python 3.8 이상

## 설치

### 1. Python 가상환경 생성 (권장)
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate  # Windows
```

### 2. 필요한 패키지 설치
```bash
pip install -r requirements.txt
```

### 3. Playwright 브라우저 설치
```bash
playwright install chromium
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
python3 hiworks_checkin.py
```

### 디버그 모드 실행
디버그 모드에서는 브라우저가 보이고, 각 단계별 스크린샷이 저장됩니다:
```bash
DEBUG=true python3 hiworks_checkin.py
```

또는 `.env` 파일에서 `DEBUG=true`로 설정 후:
```bash
python3 hiworks_checkin.py
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

## 자동화 설정 (Cron)

매일 특정 시간에 자동으로 출근 체크인하려면 crontab을 설정하세요:

```bash
# crontab 편집
crontab -e

# 매일 오전 9시에 실행 (예시)
0 9 * * * cd /path/to/hiworks-checkin && /path/to/venv/bin/python3 hiworks_checkin.py >> /path/to/logs/checkin.log 2>&1
```

## 문제 해결

### Python 버전 확인
```bash
python3 --version  # 3.8 이상이어야 함
```

### 브라우저가 실행되지 않을 때
```bash
playwright install chromium
```

### 요소를 찾을 수 없을 때
디버그 모드로 실행하여 스크린샷을 확인하세요:
```bash
DEBUG=true python3 hiworks_checkin.py
```

### 로그인 실패
1. `.env` 파일의 계정 정보 확인
2. 하이웍스 로그인 페이지 구조 변경 여부 확인
3. 디버그 모드로 실행하여 어느 단계에서 실패하는지 확인

### 패키지 설치 오류
가상환경을 사용하고 pip를 업그레이드하세요:
```bash
python3 -m pip install --upgrade pip
pip install -r requirements.txt
```

## 라이선스

ISC

## 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!
