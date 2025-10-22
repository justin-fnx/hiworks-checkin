# 하이웍스 자동 출근 체크

하이웍스(Hiworks) 출근/퇴근 체크를 자동화하는 Node.js 스크립트입니다.

## 주요 특징

- ✅ **순수 HTTP API 기반** - 브라우저 없이 동작
- 🚀 **빠른 실행 속도** - 브라우저 로딩 불필요
- 📱 **Android Termux 호환** - 모바일 기기에서도 실행 가능
- 💾 **낮은 리소스 사용** - 최소한의 메모리/CPU 사용
- 🔒 **안전한 인증** - 세션 쿠키 기반 인증
- 🐛 **디버그 모드** - 상세 로그 출력 지원

## 버전 히스토리

### v2.0.0 (현재)
- 기존 Puppeteer(headless 브라우저) 제거
- 순수 HTTP API 호출 방식으로 전환
- 의존성 최소화 (dotenv만 필요)
- Android Termux 완벽 지원

### v1.0.0
- Puppeteer 기반 자동화

## 사전 요구사항

- Node.js 18.x 이상 (ES Module 지원)
- npm 또는 yarn

## 설치 방법

### 1. 저장소 클론

```bash
git clone <repository-url>
cd hiworks-checkin
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
OFFICE_DOMAIN=your-domain.com
HIWORKS_USER_ID=your-username
HIWORKS_PASSWORD=your-password
DEBUG=false
```

**환경 변수 설명:**
- `OFFICE_DOMAIN`: 하이웍스 오피스 도메인 (예: `onda.me`)
- `HIWORKS_USER_ID`: 사용자 ID (이메일 @ 앞부분만)
- `HIWORKS_PASSWORD`: 비밀번호
- `DEBUG`: 디버그 모드 활성화 (`true`/`false`)

## 사용 방법

### 기본 실행

```bash
npm start
# 또는
npm run checkin
```

### 디버그 모드

```bash
npm run debug
```

디버그 모드에서는 다음 정보가 출력됩니다:
- 각 API 요청 URL 및 헤더
- 요청/응답 본문
- 쿠키 정보
- 상세 에러 스택

## 출력 예시

### 정상 실행 시

```
🚀 하이웍스 자동 출근 체크 시작...

📝 로그인 중...
✅ 로그인 성공

📊 근무 정보 조회 중...
   현재 상태: 근무 전

⏰ 출근 체크 실행 중...
✅ 출근 체크 완료!

🔍 결과 확인 중...
✅ 출근 시간이 기록되었습니다: 2025-10-22 09:14:26

🎉 모든 작업이 완료되었습니다!
```

### 이미 출근한 경우

```
🚀 하이웍스 자동 출근 체크 시작...

📝 로그인 중...
✅ 로그인 성공

📊 근무 정보 조회 중...
   현재 상태: 근무중
   출근 시간: 2025-10-22 09:14:26

⚠️  이미 출근 체크를 완료했습니다.
   출근 시간: 2025-10-22 09:14:26
```

## 자동화 설정

### cron (Linux/macOS)

매일 오전 9시에 자동 실행:

```bash
crontab -e
```

다음 줄 추가:

```
0 9 * * * cd /path/to/hiworks-checkin && /usr/local/bin/node hiworks-checkin.js >> /tmp/hiworks-checkin.log 2>&1
```

### systemd timer (Linux)

1. 서비스 파일 생성: `/etc/systemd/system/hiworks-checkin.service`

```ini
[Unit]
Description=Hiworks Check-in Service

[Service]
Type=oneshot
WorkingDirectory=/path/to/hiworks-checkin
ExecStart=/usr/local/bin/node hiworks-checkin.js
User=your-username
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
```

2. 타이머 파일 생성: `/etc/systemd/system/hiworks-checkin.timer`

```ini
[Unit]
Description=Hiworks Check-in Timer

[Timer]
OnCalendar=*-*-* 09:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

3. 타이머 활성화:

```bash
sudo systemctl daemon-reload
sudo systemctl enable hiworks-checkin.timer
sudo systemctl start hiworks-checkin.timer
```

### Android Termux

1. Termux 설치 및 패키지 업데이트:

```bash
pkg update && pkg upgrade
pkg install nodejs git
```

2. 저장소 클론 및 설정:

```bash
git clone <repository-url>
cd hiworks-checkin
npm install
nano .env  # 환경 변수 설정
```

3. Termux cron 설정:

```bash
pkg install cronie termux-services
sv-enable crond
crontab -e
```

다음 줄 추가:

```
0 9 * * * cd ~/hiworks-checkin && node hiworks-checkin.js >> ~/hiworks-checkin.log 2>&1
```

## API 엔드포인트

이 스크립트는 다음 하이웍스 API를 사용합니다:

1. **로그인 API**
   - `POST https://auth-api.office.hiworks.com/office-web/login`

2. **근무 정보 조회 API**
   - `GET https://hr-timecheck-api.office.hiworks.com/v4/web/user-work-info`

3. **출근 체크 API**
   - `POST https://hr-timecheck-api.office.hiworks.com/v4/web/time-record`

자세한 API 분석 내용은 [API_ANALYSIS.md](API_ANALYSIS.md)를 참고하세요.

## 문제 해결

### 로그인 실패

- `.env` 파일의 사용자 ID와 비밀번호를 확인하세요
- `OFFICE_DOMAIN`이 정확한지 확인하세요
- 디버그 모드(`DEBUG=true`)로 실행하여 상세 로그를 확인하세요

### 출근 체크 실패

- 이미 출근 체크를 했는지 확인하세요
- 근무 시간대에 실행하고 있는지 확인하세요
- IP 보안 설정이 활성화되어 있는지 확인하세요

### Android Termux에서 실행 안됨

- Node.js 버전 확인: `node --version` (18.x 이상 필요)
- 네트워크 연결 확인
- Termux 백그라운드 실행 권한 확인

## 보안 고려사항

- `.env` 파일은 절대 공개 저장소에 커밋하지 마세요
- `.gitignore`에 `.env`가 포함되어 있는지 확인하세요
- 비밀번호는 안전하게 관리하세요
- 공용 서버에서 실행할 경우 파일 권한을 적절히 설정하세요 (`chmod 600 .env`)

## 라이선스

ISC

## 기여

이슈나 풀 리퀘스트는 언제나 환영합니다!
