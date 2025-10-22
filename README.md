# Termux에서 하이웍스 자동 출근 체크인 설정 가이드

Android Termux 환경에서 Selenium을 사용한 하이웍스 자동 출근 체크인 스크립트입니다.

## Termux 설치 및 설정

### 1. Termux 설치
Google Play Store에서 Termux를 설치하거나, F-Droid에서 설치하세요.
- F-Droid 권장: https://f-droid.org/packages/com.termux/

### 2. 패키지 업데이트
```bash
pkg update && pkg upgrade
```

### 3. 필요한 패키지 설치
```bash
# Python 설치
pkg install python

# Git 설치 (선택사항)
pkg install git

# 크론 설치 (자동화용)
pkg install cronie
```

### 4. 스토리지 접근 권한
```bash
termux-setup-storage
```

## 프로젝트 설정

### 1. 프로젝트 클론 또는 복사
```bash
# Git으로 클론하는 경우
git clone <repository-url>
cd hiworks-checkin

# 또는 파일을 직접 복사한 경우
cd ~/storage/downloads/hiworks-checkin
```

### 2. Python 패키지 설치
```bash
pip install -r requirements-termux.txt
```

### 3. Chromedriver 설치

Termux에서 Chromedriver를 사용하는 방법은 두 가지가 있습니다:

#### 방법 A: Chromium 설치 (권장)
```bash
pkg install chromium

# Chromedriver 다운로드
# ARM 아키텍처에 맞는 버전 필요
# https://chromedriver.chromium.org/downloads
```

#### 방법 B: 외부 Chrome 사용
Android Chrome 앱과 ADB를 통한 연결이 필요합니다.

### 4. 환경 설정
```bash
# .env 파일 생성
cp .env.example .env

# nano 또는 vi로 편집
nano .env
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
python hiworks_checkin_selenium.py
```

### 디버그 모드
```bash
DEBUG=true python hiworks_checkin_selenium.py
```

## 자동화 설정 (Cron)

### 1. Crond 시작
```bash
crond
```

### 2. Crontab 편집
```bash
crontab -e
```

### 3. 스케줄 추가
```cron
# 매일 오전 9시에 실행
0 9 * * * cd ~/hiworks-checkin && python hiworks_checkin_selenium.py >> ~/checkin.log 2>&1

# Termux가 백그라운드에서 종료되지 않도록 wake lock 필요
0 9 * * * termux-wake-lock && cd ~/hiworks-checkin && python hiworks_checkin_selenium.py && termux-wake-unlock
```

### 4. Termux:Boot 사용 (선택사항)
Termux:Boot 앱을 설치하여 기기 재시작 시 자동으로 크론을 시작할 수 있습니다.

```bash
# ~/.termux/boot/ 디렉토리 생성
mkdir -p ~/.termux/boot

# 시작 스크립트 생성
nano ~/.termux/boot/start-cron.sh
```

`start-cron.sh` 내용:
```bash
#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
crond
```

실행 권한 부여:
```bash
chmod +x ~/.termux/boot/start-cron.sh
```

## 문제 해결

### Chromedriver를 찾을 수 없는 경우
```bash
# Chromedriver 경로 확인
which chromedriver

# PATH에 추가
export PATH=$PATH:/data/data/com.termux/files/usr/bin
```

### 권한 오류
```bash
# 스크립트 실행 권한 부여
chmod +x hiworks_checkin_selenium.py
```

### Chrome/Chromium 버전 불일치
Chrome 버전과 Chromedriver 버전이 일치해야 합니다.
```bash
# Chromium 버전 확인
chromium --version

# 일치하는 Chromedriver 다운로드 필요
```

### 메모리 부족
Termux는 메모리가 제한적이므로:
```bash
# 헤드리스 모드 사용 (DEBUG=false)
# 다른 앱 종료
# 기기 재시작
```

## 대안: Appium 사용

Selenium 대신 Appium을 사용하여 Android 네이티브 앱을 직접 제어할 수도 있습니다.
하지만 설정이 더 복잡하므로 Selenium을 먼저 시도하는 것을 권장합니다.

## 배터리 최적화 해제

Termux가 백그라운드에서 종료되지 않도록 설정:
1. 설정 > 앱 > Termux
2. 배터리 > 배터리 최적화 해제
3. 백그라운드 제한 해제

## 참고사항

- Termux는 Android 12 이상에서 phantom process killer 문제가 있을 수 있습니다
- 안정적인 실행을 위해 기기를 충전 중인 상태에서 실행하는 것을 권장합니다
- 네트워크 연결이 안정적인지 확인하세요

## 라이선스

ISC
