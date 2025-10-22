const { chromium } = require('playwright');
require('dotenv').config();

// 디버그 모드 설정
const DEBUG = process.env.DEBUG === 'true';

// 로그 헬퍼 함수
const log = (step, message) => {
    if (!DEBUG) return;
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    console.log(`[${timestamp}] ${step}: ${message}`);
};

// 스크린샷 저장 함수
const saveScreenshot = async (page, name) => {
    if (!DEBUG) return;
    const filename = `screenshot-${name}-${Date.now()}.png`;
    await page.screenshot({ path: filename });
    log('스크린샷', `${filename} 저장됨`);
    return filename;
};

// 대기 함수
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    let browser;
    try {
        log('시작', '브라우저 실행 중...');
        browser = await chromium.launch({
            headless: !DEBUG, // 디버그 모드에서만 브라우저 표시
            args: ['--no-sandbox']
        });
        const context = await browser.newContext({
            viewport: {
                width: 1202,
                height: 1198
            }
        });
        const page = await context.newPage();
        const timeout = 10000; // 타임아웃을 10초로 설정
        page.setDefaultTimeout(timeout);

        log('네비게이션', '로그인 페이지로 이동 중...');
        await page.goto('https://login.office.hiworks.com/onda.me');
        await saveScreenshot(page, '01-login-page');

        log('입력', '로그인 ID 입력 필드 찾는 중...');
        // Playwright는 더 간단한 selector 사용
        const idInput = page.getByLabel('로그인 ID').or(page.locator('input').first());
        await idInput.click();

        log('입력', `사용자 ID 입력 중: ${process.env.HIWORKS_USER_ID}`);
        await idInput.fill(process.env.HIWORKS_USER_ID);

        log('입력', 'Enter 키 누름');
        await page.keyboard.press('Enter');

        // 페이지 로딩 대기
        await wait(1000);
        await saveScreenshot(page, '02-after-id');

        log('입력', '비밀번호 입력 필드 찾는 중...');
        // 비밀번호 필드는 label이나 동적 ID로 찾기
        const passwordInput = page.getByLabel('비밀번호').or(page.locator('input[type="password"]').first());
        await passwordInput.fill(process.env.HIWORKS_PASSWORD);

        log('입력', '비밀번호 입력 완료, Enter 키 누름');
        // Playwright는 waitForNavigation 대신 waitForURL 사용
        await Promise.all([
            page.waitForLoadState('networkidle'),
            page.keyboard.press('Enter')
        ]);

        await saveScreenshot(page, '03-after-login');

        log('네비게이션', '근무/경비처리 메뉴 찾는 중...');
        // 근무/경비처리 링크 찾기 - 첫 번째 요소 사용 (strict mode 회피)
        const workMenu = page.getByRole('link', { name: /근무.*경비처리/i }).first();

        await Promise.all([
            page.waitForLoadState('networkidle'),
            workMenu.click()
        ]);

        await saveScreenshot(page, '04-work-menu');

        log('액션', '출근하기 버튼 찾는 중...');
        // 출근하기 버튼 찾기 - 첫 번째 요소 사용
        const checkinButton = page.getByRole('button', { name: /출근/i }).first();

        await Promise.all([
            page.waitForLoadState('networkidle'),
            checkinButton.click()
        ]);

        await saveScreenshot(page, '05-after-checkin');

        log('완료', '출근 체크인이 완료되었습니다!');
        if (!DEBUG) {
            console.log('✅ 출근 체크인이 완료되었습니다!');
        }

        // 디버그 모드에서만 결과 확인을 위해 3초 대기
        if (DEBUG) {
            await wait(3000);
        }

    } catch (err) {
        console.error('\n❌ 오류 발생:');
        console.error('메시지:', err.message);
        console.error('위치:', err.stack);

        // 에러 발생 시 스크린샷 저장
        if (browser) {
            try {
                const contexts = browser.contexts();
                if (contexts.length > 0) {
                    const pages = contexts[0].pages();
                    if (pages.length > 0) {
                        await saveScreenshot(pages[0], 'error');
                    }
                }
            } catch (screenshotErr) {
                console.error('스크린샷 저장 실패:', screenshotErr.message);
            }
        }

        process.exit(1);
    } finally {
        if (browser) {
            log('종료', '브라우저 종료 중...');
            await browser.close();
        }
    }
})();
