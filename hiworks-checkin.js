const puppeteer = require('puppeteer'); // v23.0.0 or later
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

// 대기 함수 (waitForTimeout 대체)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    let browser;
    try {
        log('시작', '브라우저 실행 중...');
        browser = await puppeteer.launch({
            headless: !DEBUG, // 디버그 모드에서만 브라우저 표시
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        const timeout = 10000; // 타임아웃을 10초로 늘림
        page.setDefaultTimeout(timeout);

        log('설정', '뷰포트 설정 중...');
        await page.setViewport({
            width: 1202,
            height: 1198
        });

        log('네비게이션', '로그인 페이지로 이동 중...');
        await page.goto('https://login.office.hiworks.com/onda.me');
        await saveScreenshot(page, '01-login-page');

        log('입력', '로그인 ID 입력 필드 찾는 중...');
        await puppeteer.Locator.race([
            page.locator('::-p-aria(로그인 ID)'),
            page.locator('input'),
            page.locator('::-p-xpath(//*[@id=\\"root\\"]/div/main/div/div[1]/form/fieldset/div[2]/div/input)'),
            page.locator(':scope >>> input')
        ])
            .setTimeout(timeout)
            .click({
                offset: {
                    x: 90,
                    y: 11.109375,
                },
            });

        log('입력', `사용자 ID 입력 중: ${process.env.HIWORKS_USER_ID}`);
        await puppeteer.Locator.race([
            page.locator('::-p-aria(로그인 ID)'),
            page.locator('input'),
            page.locator('::-p-xpath(//*[@id=\\"root\\"]/div/main/div/div[1]/form/fieldset/div[2]/div/input)'),
            page.locator(':scope >>> input')
        ])
            .setTimeout(timeout)
            .fill(process.env.HIWORKS_USER_ID);

        log('입력', 'Enter 키 누름');
        await page.keyboard.down('Enter');
        await page.keyboard.up('Enter');

        // 페이지 로딩 대기
        await wait(1000);
        await saveScreenshot(page, '02-after-id');

        log('입력', '비밀번호 입력 필드 찾는 중...');
        await puppeteer.Locator.race([
            page.locator('::-p-aria(비밀번호)'),
            page.locator('#mantine-3d735brq0'),
            page.locator('::-p-xpath(//*[@id=\\"mantine-3d735brq0\\"])'),
            page.locator(':scope >>> #mantine-3d735brq0')
        ])
            .setTimeout(timeout)
            .fill(process.env.HIWORKS_PASSWORD);

        log('입력', '비밀번호 입력 완료, Enter 키 누름');
        const promises = [];
        promises.push(page.waitForNavigation());
        await page.keyboard.down('Enter');
        await Promise.all(promises);
        await page.keyboard.up('Enter');

        await saveScreenshot(page, '03-after-login');

        log('네비게이션', '근무/경비처리 메뉴 찾는 중...');
        const workMenuPromises = [];
        workMenuPromises.push(page.waitForNavigation());

        await puppeteer.Locator.race([
            page.locator('::-p-aria(근무/경비처리) >>>> ::-p-aria([role=\\"image\\"])'),
            page.locator('div.split-wrap div > div > div > div:nth-of-type(3) svg'),
            page.locator('::-p-xpath(//*[@id=\\"contents\\"]/div[1]/div/div/div/div[3]/a/span/span[2]/svg)'),
            page.locator(':scope >>> div.split-wrap div > div > div > div:nth-of-type(3) svg')
        ])
            .setTimeout(timeout)
            .click({
                offset: {
                    x: 12,
                    y: 25,
                },
            });

        await Promise.all(workMenuPromises);
        await saveScreenshot(page, '04-work-menu');

        log('액션', '출근하기 버튼 찾는 중...');
        const checkinPromises = [];
        checkinPromises.push(page.waitForNavigation());

        await puppeteer.Locator.race([
            page.locator('::-p-aria(출근하기)'),
            page.locator('li:nth-of-type(1) img'),
            page.locator('::-p-xpath(//*[@id=\\"contents\\"]/div/section[3]/div/div[2]/div[2]/ul/li[1]/button/img)'),
            page.locator(':scope >>> li:nth-of-type(1) img')
        ])
            .setTimeout(timeout)
            .click({
                offset: {
                    x: 14.6484375,
                    y: 19.25,
                },
            });

        await Promise.all(checkinPromises);
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
                const pages = await browser.pages();
                if (pages.length > 0) {
                    await saveScreenshot(pages[0], 'error');
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
