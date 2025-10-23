# 하이웍스 자동 출근 체크

하이웍스(Hiworks) 출근/퇴근 체크를 자동화하는 Android 네이티브 앱입니다.

## 주요 특징

- ✅ **순수 HTTP API 기반** - 브라우저 없이 동작
- 🚀 **빠른 실행 속도** - 네이티브 Android 앱
- 📱 **갤럭시 루틴 연동** - 앱 숏컷을 통한 자동 실행
- 💾 **낮은 리소스 사용** - 최소한의 메모리/CPU 사용
- 🔒 **안전한 인증** - 세션 쿠키 기반 인증
- 🐛 **디버그 모드** - 상세 로그 출력 지원
- 🎨 **Material 3 UI** - 현대적이고 직관적인 사용자 인터페이스

## 버전 히스토리

### v3.0.0 (현재)
- Android 네이티브 앱으로 전환
- Jetpack Compose 기반 UI
- 갤럭시 루틴 연동 지원 (App Shortcuts)
- 설정 화면 UI 제공

### v2.0.0
- 기존 Puppeteer(headless 브라우저) 제거
- 순수 HTTP API 호출 방식으로 전환
- 의존성 최소화 (dotenv만 필요)
- Android Termux 완벽 지원

### v1.0.0
- Puppeteer 기반 자동화

## 사전 요구사항

### Android 앱

- Android 8.0 (API 26) 이상
- Android Studio Koala (2024.1.1) 이상
- JDK 11 이상

### Node.js 스크립트 (레거시)

- Node.js 18.x 이상 (ES Module 지원)
- npm 또는 yarn

## 빌드 및 설치

### Android 앱 빌드

1. **저장소 클론**

```bash
git clone <repository-url>
cd hiworks-checkin
```

2. **Android Studio에서 프로젝트 열기**
   - Android Studio 실행
   - "Open an Existing Project" 선택
   - 프로젝트 루트 디렉토리 선택

3. **Gradle 동기화**
   - 프로젝트가 열리면 자동으로 Gradle 동기화 시작
   - 필요한 의존성이 자동으로 다운로드됨

4. **APK 빌드**

   **Debug 빌드:**
   ```bash
   ./gradlew assembleDebug
   ```
   생성된 APK: `app/build/outputs/apk/debug/app-debug.apk`

   **Release 빌드:**
   ```bash
   ./gradlew assembleRelease
   ```
   생성된 APK: `app/build/outputs/apk/release/app-release.apk`

5. **기기에 설치**

   USB 연결 후:
   ```bash
   ./gradlew installDebug
   ```

   또는 APK 파일을 직접 기기로 전송하여 설치

## 사용 방법

### 앱 초기 설정

1. 앱 실행
2. "설정" 버튼 클릭
3. 하이웍스 계정 정보 입력:
   - **Office Domain**: 회사의 하이웍스 도메인 (예: `yourcompany`)
   - **User ID**: 이메일 주소의 @ 앞부분
   - **Password**: 하이웍스 로그인 비밀번호
   - **디버그 모드**: 필요시 활성화
4. "저장" 버튼 클릭

### 출근 체크

**방법 1: 앱에서 직접 실행**

1. 앱 실행
2. "출근체크" 버튼 클릭
3. 결과 확인

**방법 2: 갤럭시 루틴 연동**

1. 갤럭시 루틴 앱 실행
2. 새 루틴 생성:
   - **조건**: 원하는 트리거 설정 (예: 특정 시간, 위치 도착 등)
   - **동작**: "앱 실행" → "하이웍스 출근체크" → "출근체크" 숏컷 선택
3. 루틴 저장

**방법 3: 홈 화면 숏컷**

1. 앱 아이콘을 길게 누르기
2. "출근체크" 숏컷을 홈 화면으로 드래그
3. 홈 화면에서 숏컷 탭하여 바로 실행

### 갤럭시 루틴 예시

**출근 시 자동 체크:**

- 조건: 평일 오전 8:30-9:30, 회사 근처 도착
- 동작: "하이웍스 출근체크" 숏컷 실행

## 기술 스택

### Android 앱

- **언어**: Kotlin
- **UI**: Jetpack Compose + Material 3
- **HTTP 클라이언트**: OkHttp
- **JSON 파싱**: Gson
- **비동기 처리**: Kotlin Coroutines
- **아키텍처**: MVVM (ViewModel + Repository)
- **최소 SDK**: API 26 (Android 8.0)
- **타겟 SDK**: API 35 (Android 15)

## API 엔드포인트

이 앱은 다음 하이웍스 API를 사용합니다:

1. **로그인 API**
   - `POST https://auth-api.office.hiworks.com/office-web/login`

2. **근무 정보 조회 API**
   - `GET https://hr-timecheck-api.office.hiworks.com/v4/web/user-work-info`

3. **출근 체크 API**
   - `POST https://hr-timecheck-api.office.hiworks.com/v4/web/time-record`

자세한 API 분석 내용은 [API_ANALYSIS.md](API_ANALYSIS.md)를 참고하세요.

## 문제 해결

### 로그인 실패

- 앱 설정에서 사용자 ID와 비밀번호를 확인하세요
- `OFFICE_DOMAIN`이 정확한지 확인하세요 (회사명만 입력, 전체 도메인 아님)
- 디버그 모드를 활성화하여 상세 로그를 확인하세요

### 출근 체크 실패

- 이미 출근 체크를 했는지 확인하세요
- 근무 시간대에 실행하고 있는지 확인하세요
- IP 보안 설정이 활성화되어 있는지 확인하세요
- 네트워크 연결 상태를 확인하세요

### 갤럭시 루틴에서 숏컷이 보이지 않음

- 앱을 한 번 이상 실행했는지 확인하세요
- 앱을 재설치한 경우 기기를 재부팅하세요
- 갤럭시 루틴 앱을 최신 버전으로 업데이트하세요

## 보안 고려사항

- 앱 설정의 비밀번호는 SharedPreferences에 평문으로 저장됩니다
- 비밀번호는 백업에서 제외되도록 설정되어 있습니다
- 공용 기기에서는 사용을 권장하지 않습니다
- 앱 잠금 기능과 함께 사용하는 것을 권장합니다

## 레거시: Node.js 스크립트

Node.js 버전의 스크립트는 `hiworks-checkin.js` 파일에 남아있습니다.

실행 방법:

```bash
npm install
npm start
```

자세한 내용은 Git 히스토리의 v2.0.0 태그를 참고하세요.

## 라이선스

ISC

## 기여

이슈나 풀 리퀘스트는 언제나 환영합니다!
