#!/usr/bin/env python3
"""
하이웍스 자동 출근 체크인 스크립트 (Playwright Python)
"""

import os
import sys
import time
from datetime import datetime
from typing import Optional
from playwright.sync_api import sync_playwright, Page, Browser
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 디버그 모드 설정
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'


def log(step: str, message: str) -> None:
    """디버그 로그 출력"""
    if not DEBUG:
        return
    timestamp = datetime.now().strftime('%H:%M:%S')
    print(f"[{timestamp}] {step}: {message}")


def save_screenshot(page: Page, name: str) -> Optional[str]:
    """스크린샷 저장"""
    if not DEBUG:
        return None
    filename = f"screenshot-{name}-{int(time.time() * 1000)}.png"
    page.screenshot(path=filename)
    log('스크린샷', f'{filename} 저장됨')
    return filename


def main():
    """메인 실행 함수"""
    browser: Optional[Browser] = None

    try:
        log('시작', '브라우저 실행 중...')

        with sync_playwright() as p:
            # 브라우저 실행
            browser = p.chromium.launch(
                headless=not DEBUG,  # 디버그 모드에서만 브라우저 표시
                args=['--no-sandbox']
            )

            # 컨텍스트 생성
            context = browser.new_context(
                viewport={'width': 1202, 'height': 1198}
            )

            page = context.new_page()
            timeout = 10000  # 타임아웃을 10초로 설정
            page.set_default_timeout(timeout)

            # 로그인 페이지 이동
            log('네비게이션', '로그인 페이지로 이동 중...')
            page.goto('https://login.office.hiworks.com/onda.me')
            save_screenshot(page, '01-login-page')

            # 로그인 ID 입력
            log('입력', '로그인 ID 입력 필드 찾는 중...')
            id_input = page.get_by_label('로그인 ID').or_(page.locator('input').first)
            id_input.click()

            user_id = os.getenv('HIWORKS_USER_ID')
            log('입력', f'사용자 ID 입력 중: {user_id}')
            id_input.fill(user_id)

            log('입력', 'Enter 키 누름')
            page.keyboard.press('Enter')

            # 페이지 로딩 대기
            time.sleep(1)
            save_screenshot(page, '02-after-id')

            # 비밀번호 입력
            log('입력', '비밀번호 입력 필드 찾는 중...')
            password_input = page.get_by_label('비밀번호').or_(
                page.locator('input[type="password"]').first
            )
            password = os.getenv('HIWORKS_PASSWORD')
            password_input.fill(password)

            log('입력', '비밀번호 입력 완료, Enter 키 누름')
            # 네비게이션 대기와 Enter 키 누르기
            page.keyboard.press('Enter')
            page.wait_for_load_state('networkidle')

            save_screenshot(page, '03-after-login')

            # 근무/경비처리 메뉴 클릭
            log('네비게이션', '근무/경비처리 메뉴 찾는 중...')
            work_menu = page.get_by_role('link', name='근무/경비처리').first

            work_menu.click()
            page.wait_for_load_state('networkidle')

            save_screenshot(page, '04-work-menu')

            # 출근하기 버튼 클릭
            log('액션', '출근하기 버튼 찾는 중...')
            checkin_button = page.get_by_role('button', name='출근').first

            checkin_button.click()
            page.wait_for_load_state('networkidle')

            save_screenshot(page, '05-after-checkin')

            log('완료', '출근 체크인이 완료되었습니다!')
            if not DEBUG:
                print('✅ 출근 체크인이 완료되었습니다!')

            # 디버그 모드에서만 결과 확인을 위해 3초 대기
            if DEBUG:
                time.sleep(3)

            # 브라우저 종료
            log('종료', '브라우저 종료 중...')
            browser.close()

    except Exception as err:
        print('\n❌ 오류 발생:', file=sys.stderr)
        print(f'메시지: {err}', file=sys.stderr)

        # 에러 발생 시 스크린샷 저장
        if browser:
            try:
                contexts = browser.contexts
                if contexts:
                    pages = contexts[0].pages
                    if pages:
                        save_screenshot(pages[0], 'error')
            except Exception as screenshot_err:
                print(f'스크린샷 저장 실패: {screenshot_err}', file=sys.stderr)

        sys.exit(1)


if __name__ == '__main__':
    main()
