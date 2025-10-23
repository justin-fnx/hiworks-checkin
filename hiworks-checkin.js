import https from 'https';
import { config } from 'dotenv';

config();

// 디버그 모드 설정
const DEBUG = process.env.DEBUG === 'true';

// 로그 헬퍼 함수
const log = (step, message) => {
    if (!DEBUG) return;
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    console.log(`[${timestamp}] ${step}: ${message}`);
};

// HTTPS 요청 헬퍼 함수
const httpsRequest = (url, options = {}, postData = null) => {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);

        const requestOptions = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            ...options
        };

        log('요청', `${requestOptions.method} ${url}`);
        if (postData) {
            log('요청 본문', JSON.stringify(postData));
        }

        const req = https.request(requestOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                log('응답', `상태 코드: ${res.statusCode}`);
                log('응답 본문', data);

                // 쿠키 추출
                const cookies = res.headers['set-cookie'] || [];

                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    cookies: cookies,
                    body: data,
                    json: () => {
                        try {
                            return JSON.parse(data);
                        } catch (e) {
                            return null;
                        }
                    }
                });
            });
        });

        req.on('error', (err) => {
            log('오류', err.message);
            reject(err);
        });

        if (postData) {
            req.write(JSON.stringify(postData));
        }

        req.end();
    });
};

// 쿠키 파싱 및 저장
class CookieJar {
    constructor() {
        this.cookies = {};
    }

    addCookies(cookieHeaders) {
        if (!cookieHeaders) return;

        cookieHeaders.forEach(cookie => {
            const parts = cookie.split(';')[0].split('=');
            const name = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            this.cookies[name] = value;
            log('쿠키 저장', `${name}=${value}`);
        });
    }

    getCookieHeader() {
        return Object.entries(this.cookies)
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
    }
}

// 1. 로그인 함수
const login = async (officeDomain, userId, password, cookieJar) => {
    log('로그인', '로그인 시작...');

    const loginUrl = 'https://auth-api.office.hiworks.com/office-web/login';
    const postData = {
        id: `${userId}@${officeDomain}`,
        password: password,
        ip_security_level: '1'
    };

    const response = await httpsRequest(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://login.office.hiworks.com',
            'Referer': 'https://login.office.hiworks.com/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
    }, postData);

    if (response.statusCode !== 200) {
        throw new Error(`로그인 실패: ${response.statusCode} - ${response.body}`);
    }

    // 쿠키 저장
    cookieJar.addCookies(response.cookies);

    log('로그인', '로그인 성공!');
    return response.json();
};

// 2. 근무 정보 조회 함수
const getWorkInfo = async (cookieJar) => {
    log('근무 정보', '현재 근무 정보 조회 중...');

    const workInfoUrl = 'https://hr-timecheck-api.office.hiworks.com/v4/web/user-work-info';

    const response = await httpsRequest(workInfoUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://hr-work.office.hiworks.com',
            'Referer': 'https://hr-work.office.hiworks.com/',
            'Cookie': cookieJar.getCookieHeader(),
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
    });

    if (response.statusCode !== 200) {
        throw new Error(`근무 정보 조회 실패: ${response.statusCode} - ${response.body}`);
    }

    const data = response.json();
    log('근무 정보', `조회 성공 - enable_start: ${data.data?.enable_start}`);

    return data;
};

// 3. 출근 체크 함수
const checkIn = async (cookieJar) => {
    log('출근 체크', '출근 체크 시작...');

    const checkInUrl = 'https://hr-timecheck-api.office.hiworks.com/v4/web/time-record';
    const postData = {
        data: {
            type: '1'  // 1: 출근, 2: 퇴근
        }
    };

    const response = await httpsRequest(checkInUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://hr-work.office.hiworks.com',
            'Referer': 'https://hr-work.office.hiworks.com/',
            'Cookie': cookieJar.getCookieHeader(),
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
    }, postData);

    if (response.statusCode / 100 !== 2) {
        const errorData = response.json();
        throw new Error(`출근 체크 실패: ${response.statusCode} - ${errorData?.errors?.message || response.body}`);
    }

    log('출근 체크', '출근 체크 성공!');
    return response.json();
};

// 메인 실행 함수
const main = async () => {
    try {
        console.log('\n🚀 하이웍스 자동 출근 체크 시작...\n');

        // 환경 변수 확인
        const officeDomain = process.env.OFFICE_DOMAIN;
        const userId = process.env.HIWORKS_USER_ID;
        const password = process.env.HIWORKS_PASSWORD;

        if (!officeDomain || !userId || !password) {
            throw new Error('환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.');
        }

        log('설정', `도메인: ${officeDomain}, 사용자: ${userId}`);

        // 쿠키 저장소 초기화
        const cookieJar = new CookieJar();

        // 1. 로그인
        console.log('📝 로그인 중...');
        await login(officeDomain, userId, password, cookieJar);
        console.log('✅ 로그인 성공\n');

        // 2. 현재 근무 정보 조회
        console.log('📊 근무 정보 조회 중...');
        const workInfo = await getWorkInfo(cookieJar);

        const enableStart = workInfo.data?.enable_start;
        const workStatus = workInfo.data?.work_status;
        const startAt = workInfo.data?.start_at;

        console.log(`   현재 상태: ${workStatus || '알 수 없음'}`);

        if (startAt && startAt !== '0000-00-00 00:00:00') {
            console.log(`   출근 시간: ${startAt}`);
        }

        // 3. 출근 체크 여부 확인
        if (enableStart === 'N') {
            console.log('\n⚠️  이미 출근 체크를 완료했습니다.');
            console.log(`   출근 시간: ${startAt}\n`);
            return;
        }

        if (enableStart !== 'Y') {
            console.log('\n⚠️  출근 체크를 할 수 없는 상태입니다.');
            console.log(`   현재 상태: ${workStatus || '알 수 없음'}\n`);
            return;
        }

        // 4. 출근 체크 실행
        console.log('\n⏰ 출근 체크 실행 중...');
        await checkIn(cookieJar);
        console.log('✅ 출근 체크 완료!\n');

        // 5. 결과 확인
        console.log('🔍 결과 확인 중...');
        const updatedWorkInfo = await getWorkInfo(cookieJar);
        const newStartAt = updatedWorkInfo.data?.start_at;

        if (newStartAt && newStartAt !== '0000-00-00 00:00:00') {
            console.log(`✅ 출근 시간이 기록되었습니다: ${newStartAt}\n`);
        }

        console.log('🎉 모든 작업이 완료되었습니다!\n');

    } catch (error) {
        console.error('\n❌ 오류 발생:');
        console.error('메시지:', error.message);

        if (DEBUG) {
            console.error('상세 정보:', error.stack);
        }

        console.error('');
        process.exit(1);
    }
};

// 실행
main();
