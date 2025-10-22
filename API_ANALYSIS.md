# 하이웍스 출근 체크 API 분석 결과

## 핵심 발견 사항

HAR 파일 분석 결과, 하이웍스 출근 체크를 위해 필요한 핵심 API들을 파악했습니다.

## 필수 API 흐름

### 1. 로그인 API
**엔드포인트:** `POST https://auth-api.office.hiworks.com/office-web/login`

**요청 헤더:**
```
Content-Type: application/json
Accept: application/json
Origin: https://login.office.hiworks.com
Referer: https://login.office.hiworks.com/
```

**요청 본문:**
```json
{
  "id": "your-email@domain.com",
  "password": "your-password",
  "ip_security_level": "1"
}
```

**응답:**
- Status: 200 OK
- 쿠키에 인증 정보가 설정됨 (브라우저가 자동으로 처리)

---

### 2. 사용자 근무 정보 조회 API
**엔드포인트:** `GET https://hr-timecheck-api.office.hiworks.com/v4/web/user-work-info`

**요청 헤더:**
```
Accept: application/json, text/plain, */*
Origin: https://hr-work.office.hiworks.com
Referer: https://hr-work.office.hiworks.com/
```

**응답 예시:**
```json
{
  "data": {
    "date": "2025-10-22",
    "start_at": "2025-10-22 09:14:26",
    "start_status": 0,
    "enable_start": "N",
    "end_at": "0000-00-00 00:00:00",
    "end_status": 2,
    "enable_end": "Y",
    "work_status": "근무중",
    "enable_etc": "N",
    "details": [
      {
        "id": 5975887,
        "time": "2025-10-22 09:14:26",
        "name": "출근",
        "title": "출근",
        "detail_name": "출근",
        "include_work": "Y",
        "type": "start",
        "check_app": "WEB",
        "is_outside": false,
        "is_temp": false,
        "is_remote": false,
        "location": {
          "place_name": null,
          "latitude": null,
          "longitude": null
        },
        "status": 0,
        "status_name": "NORMAL"
      }
    ],
    "use_start_check": "Y",
    "use_end_check": "Y"
  }
}
```

**분석:**
- `enable_start`: "N"이면 이미 출근 체크를 했음
- `enable_end`: "Y"면 퇴근 체크가 가능함
- `details` 배열에 출퇴근 기록이 포함됨

---

### 3. 출근 체크 API (핵심!)
**엔드포인트:** `POST https://hr-timecheck-api.office.hiworks.com/v4/web/time-record`

**요청 헤더:**
```
Content-Type: application/json
Accept: application/json, text/plain, */*
Origin: https://hr-work.office.hiworks.com
Referer: https://hr-work.office.hiworks.com/
```

**요청 본문:**
```json
{
  "data": {
    "type": "1"
  }
}
```

**type 값:**
- `"1"`: 출근 체크
- `"2"`: 퇴근 체크 (추정)

**응답 (실패 예시):**
```json
{
  "errors": {
    "status": 400,
    "title": "Bad Request",
    "message": "해당 근무체크를 할 수 없습니다."
  }
}
```

**참고:** HAR 파일에서는 이미 출근한 상태에서 다시 출근 체크를 시도하여 400 에러가 발생했습니다.

---

## 불필요한 API들 (필터링 가능)

다음 API들은 출근 체크 자동화에 **불필요**합니다:

### Google Analytics 관련
- `https://analytics.google.com/g/collect`
- `https://www.googleadservices.com/pagead/conversion/`
- `https://www.googletagmanager.com/gtag/js`

### 배너/공지 관련
- `https://banner-api.office.hiworks.com/banners/login/`
- `https://cache-api.office.hiworks.com/notices`
- `https://board-api.office.hiworks.com/office-notices/home`

### UI 데이터 관련
- `https://schedule-api.office.hiworks.com/schedules`
- `https://menu-api-v4.office.hiworks.com/tab-menu`
- `https://count-api.office.hiworks.com/alarm`

### 모니터링 관련
- `https://app-sentry.hiworks.com:9000/api/`

---

## 자동화 구현 방안

### 옵션 1: requests 라이브러리 사용 (권장)
세션을 유지하면서 API 호출만으로 출근 체크가 가능합니다.

```python
import requests

# 1. 세션 생성
session = requests.Session()

# 2. 로그인
login_response = session.post(
    'https://auth-api.office.hiworks.com/office-web/login',
    json={
        'id': 'your-email@domain.com',
        'password': 'your-password',
        'ip_security_level': '1'
    },
    headers={
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://login.office.hiworks.com',
        'Referer': 'https://login.office.hiworks.com/',
    }
)

# 3. 로그인 성공 확인
if login_response.status_code == 200:
    print("로그인 성공")

    # 4. 현재 근무 상태 확인
    work_info = session.get(
        'https://hr-timecheck-api.office.hiworks.com/v4/web/user-work-info',
        headers={
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://hr-work.office.hiworks.com',
            'Referer': 'https://hr-work.office.hiworks.com/',
        }
    )

    work_data = work_info.json()
    enable_start = work_data['data']['enable_start']

    # 5. 출근 체크가 가능한 경우에만 실행
    if enable_start == 'Y':
        checkin_response = session.post(
            'https://hr-timecheck-api.office.hiworks.com/v4/web/time-record',
            json={'data': {'type': '1'}},
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://hr-work.office.hiworks.com',
                'Referer': 'https://hr-work.office.hiworks.com/',
            }
        )

        if checkin_response.status_code == 200:
            print("출근 체크 성공!")
        else:
            print(f"출근 체크 실패: {checkin_response.text}")
    else:
        print("이미 출근 체크를 했습니다.")
else:
    print(f"로그인 실패: {login_response.text}")
```

### 옵션 2: Selenium/Playwright (백업)
만약 API 방식이 작동하지 않거나 추가 보안 검증이 있는 경우를 대비한 방법입니다.

---

## 주요 장점

1. **Headless 브라우저 불필요**: 순수 HTTP 요청만으로 가능
2. **빠른 실행**: 브라우저 로딩 시간 없이 즉시 실행
3. **Android Termux 호환**: Python requests만 있으면 실행 가능
4. **리소스 절약**: 메모리/CPU 사용량 최소화

---

## 주의사항

1. **쿠키/세션 관리**: `requests.Session()`을 사용하여 자동으로 쿠키 관리
2. **중복 체크 방지**: 출근 전에 `enable_start` 값을 확인하여 중복 방지
3. **IP 보안**: `ip_security_level`을 "1"로 설정하여 로그인
4. **에러 처리**: 네트워크 오류, 인증 실패 등에 대한 적절한 에러 처리 필요

---

## 다음 단계

1. 위의 Python 코드를 테스트
2. 환경 변수로 아이디/비밀번호 관리 (.env 파일)
3. 스케줄러 설정 (cron, systemd timer 등)
4. 로그 기록 및 알림 기능 추가
5. Android Termux에서 테스트
