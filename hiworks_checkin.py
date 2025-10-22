#!/usr/bin/env python3
"""
하이웍스 자동 출근 체크인 스크립트 (Selenium - Termux 호환)
"""

import os
import sys
import time
from datetime import datetime
from typing import Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
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


def save_screenshot(driver, name: str) -> Optional[str]:
    """스크린샷 저장"""
    if not DEBUG:
        return None
    filename = f"screenshot-{name}-{int(time.time() * 1000)}.png"
    driver.save_screenshot(filename)
    log('스크린샷', f'{filename} 저장됨')
    return filename


def main():
    """메인 실행 함수"""
    driver = None

    try:
        log('시작', 'Chrome 브라우저 실행 중...')

        # Chrome 옵션 설정
        chrome_options = Options()

        if not DEBUG:
            chrome_options.add_argument('--headless')  # 헤드리스 모드

        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1202,1198')

        # Termux 환경을 위한 추가 옵션
        chrome_options.add_argument('--disable-software-rasterizer')
        chrome_options.add_argument('--disable-extensions')

        # WebDriver 초기화
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(30)
        wait = WebDriverWait(driver, 10)

        # 로그인 페이지 이동
        log('네비게이션', '로그인 페이지로 이동 중...')
        driver.get('https://login.office.hiworks.com/onda.me')
        time.sleep(1)
        save_screenshot(driver, '01-login-page')

        # 로그인 ID 입력
        log('입력', '로그인 ID 입력 필드 찾는 중...')
        try:
            # label로 찾기 시도
            id_input = wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@type='text' or @type='email']"))
            )
        except TimeoutException:
            # 대체 방법: 첫 번째 input 필드
            id_input = driver.find_element(By.TAG_NAME, 'input')

        id_input.click()

        user_id = os.getenv('HIWORKS_USER_ID')
        log('입력', f'사용자 ID 입력 중: {user_id}')
        id_input.send_keys(user_id)

        log('입력', 'Enter 키 누름')
        id_input.send_keys(Keys.RETURN)

        # 페이지 로딩 대기
        time.sleep(1)
        save_screenshot(driver, '02-after-id')

        # 비밀번호 입력
        log('입력', '비밀번호 입력 필드 찾는 중...')
        password_input = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
        )

        password = os.getenv('HIWORKS_PASSWORD')
        password_input.send_keys(password)

        log('입력', '비밀번호 입력 완료, Enter 키 누름')
        password_input.send_keys(Keys.RETURN)

        # 로그인 완료 대기
        time.sleep(2)
        save_screenshot(driver, '03-after-login')

        # 근무/경비처리 메뉴 클릭
        log('네비게이션', '근무/경비처리 메뉴 찾는 중...')
        try:
            # 텍스트로 링크 찾기
            work_menu = wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//a[contains(text(), '근무') and contains(text(), '경비처리')]")
                )
            )
        except TimeoutException:
            # 대체 방법: 부분 텍스트 매칭
            work_menu = wait.until(
                EC.element_to_be_clickable(
                    (By.PARTIAL_LINK_TEXT, '근무')
                )
            )

        work_menu.click()
        time.sleep(2)
        save_screenshot(driver, '04-work-menu')

        # 출근하기 버튼 클릭
        log('액션', '출근하기 버튼 찾는 중...')
        try:
            checkin_button = wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(text(), '출근')]")
                )
            )
        except TimeoutException:
            # 대체 방법
            checkin_button = wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//*[contains(text(), '출근')]")
                )
            )

        checkin_button.click()
        time.sleep(2)
        save_screenshot(driver, '05-after-checkin')

        log('완료', '출근 체크인이 완료되었습니다!')
        if not DEBUG:
            print('✅ 출근 체크인이 완료되었습니다!')

        # 디버그 모드에서만 결과 확인을 위해 3초 대기
        if DEBUG:
            time.sleep(3)

    except Exception as err:
        print('\n❌ 오류 발생:', file=sys.stderr)
        print(f'메시지: {err}', file=sys.stderr)
        print(f'타입: {type(err).__name__}', file=sys.stderr)

        # 에러 발생 시 스크린샷 저장
        if driver:
            try:
                save_screenshot(driver, 'error')
            except Exception as screenshot_err:
                print(f'스크린샷 저장 실패: {screenshot_err}', file=sys.stderr)

        sys.exit(1)

    finally:
        if driver:
            log('종료', '브라우저 종료 중...')
            driver.quit()


if __name__ == '__main__':
    main()
