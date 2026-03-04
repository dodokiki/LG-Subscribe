import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver import ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


START_URL = (
    "https://www.lg.com/th/subscription/all/"
    "?ec_subscribe_filter_name_for_subs_plp="
    "%E0%B8%9C%E0%B8%A5%E0%B8%B4%E0%B8%95%E0%B8%A0%E0%B8%B1%E0%B8%93"
    "%E0%B8%91%E0%B9%8C%E0%B8%82%E0%B8%AD%E0%B8%87_LG_Subscribe"
    "&ec_model_status_code=ACTIVE"
)

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_JSON = BASE_DIR / "lg_subscribe_products_all_pages.json"
CATEGORY_URLS = [
    START_URL,
    "https://www.lg.com/th/subscription/refrigerators/",
    "https://www.lg.com/th/subscription/water-purifiers/",
    "https://www.lg.com/th/subscription/washers/",
    "https://www.lg.com/th/subscription/dryers/",
    "https://www.lg.com/th/subscription/styler/",
    "https://www.lg.com/th/subscription/air-conditioners/",
    "https://www.lg.com/th/subscription/air-purifiers/",
    "https://www.lg.com/th/subscription/vacuum-cleaners/",
    "https://www.lg.com/th/subscription/tvs/",
    "https://www.lg.com/th/subscription/soundbars/",
    "https://www.lg.com/th/subscription/microwave-ovens/",
    "https://www.lg.com/th/subscription/dishwashers/",
    "https://www.lg.com/th/subscription/dehumidifier/",
    "https://www.lg.com/th/subscription/monitors/",
]


def log(msg: str) -> None:
    print(msg, flush=True)


def setup_driver() -> webdriver.Chrome:
    options = ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1400")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
    return webdriver.Chrome(options=options)


def click_cookie_if_exists(driver: webdriver.Chrome) -> None:
    selectors = [
        "#onetrust-accept-btn-handler",
        ".onetrust-accept-btn-handler",
        "button[aria-label*='Accept']",
        "button[id*='accept']",
    ]
    for selector in selectors:
        try:
            btn = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
            )
            btn.click()
            time.sleep(1.0)
            return
        except Exception:
            continue


def wait_cards(driver: webdriver.Chrome) -> bool:
    try:
        WebDriverWait(driver, 12).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".neo-card"))
        )
        return True
    except TimeoutException:
        return False


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def extract_card(card, category_url: str, page_number: int) -> dict:
    def pick_text(selectors):
        for sel in selectors:
            try:
                text = normalize_space(card.find_element(By.CSS_SELECTOR, sel).text)
                if text:
                    return text
            except Exception:
                continue
        return ""

    def pick_attr(selectors, attr):
        for sel in selectors:
            try:
                value = (card.find_element(By.CSS_SELECTOR, sel).get_attribute(attr) or "").strip()
                if value:
                    return value
            except Exception:
                continue
        return ""

    detail_url = pick_attr(
        [
            ".neo-card--ufn a[href]",
            "a[href*='/th/'][href]",
            "a[href]",
        ],
        "href",
    )
    if detail_url.startswith("/"):
        detail_url = urljoin("https://www.lg.com", detail_url)

    image_url = pick_attr(
        [
            ".neo-card--top img",
            "img",
        ],
        "src",
    )
    if not image_url:
        image_url = pick_attr([".neo-card--top img", "img"], "data-src")
    if image_url.startswith("/"):
        image_url = urljoin("https://www.lg.com", image_url)

    model_code = pick_attr(
        [
            ".neo-card--sku .btn-copy[data-sku]",
            "[data-sku]",
        ],
        "data-sku",
    )
    if not model_code:
        model_code = pick_text(
            [
                ".neo-card--sku .btn-copy",
                ".neo-card--sku",
            ]
        )

    product_name = pick_text(
        [
            ".neo-card--ufn h3",
            ".neo-card--ufn a",
            "h3",
            "h2",
        ]
    )

    monthly_price_text = pick_text(
        [
            ".neo-price--price .cell-price",
            ".neo-price--price",
            ".cell-price",
        ]
    )
    original_price_text = pick_text(
        [
            ".neo-price--price .cell-after del",
            ".cell-after del",
            "del",
        ]
    )
    discount_text = pick_text(
        [
            ".neo-tag--box",
            "[class*='discount']",
        ]
    )

    return {
        "category_url": category_url,
        "product_name": product_name,
        "model_code": model_code,
        "monthly_price_text": monthly_price_text,
        "original_price_text": original_price_text,
        "discount_text": discount_text,
        "detail_url": detail_url,
        "image_url": image_url,
        "page_number": page_number,
    }


def next_page(driver: webdriver.Chrome) -> bool:
    selectors = [
        ".c-pagination__next:not(.disabled)",
        "a[aria-label*='Next']:not(.disabled)",
        "button[aria-label*='Next']:not([disabled])",
        ".pagination-next:not(.disabled)",
    ]

    for sel in selectors:
        try:
            btn = driver.find_element(By.CSS_SELECTOR, sel)
            cls = (btn.get_attribute("class") or "").lower()
            aria_disabled = (btn.get_attribute("aria-disabled") or "").lower()
            if "disabled" in cls or aria_disabled == "true":
                continue

            driver.execute_script("arguments[0].scrollIntoView({block:'center'});", btn)
            time.sleep(0.8)
            btn.click()
            return True
        except Exception:
            continue
    return False


def scrape_category(driver: webdriver.Chrome, category_url: str) -> list[dict]:
    log(f"\n=== Category: {category_url} ===")
    driver.get(category_url)
    click_cookie_if_exists(driver)
    time.sleep(2)

    if not wait_cards(driver):
        log("No cards found")
        return []

    items = []
    page_number = 1
    seen_signatures = set()

    while True:
        cards = driver.find_elements(By.CSS_SELECTOR, ".neo-card")
        if not cards:
            break

        for card in cards:
            item = extract_card(card, category_url, page_number)
            if item["product_name"] or item["detail_url"]:
                items.append(item)

        signature = "|".join((x.get("detail_url") or x.get("product_name") or "") for x in items[-len(cards):])
        if signature in seen_signatures:
            break
        seen_signatures.add(signature)

        log(f"Page {page_number}: {len(cards)} cards")

        if not next_page(driver):
            break

        page_number += 1
        if page_number > 30:
            break
        time.sleep(2)
        wait_cards(driver)

    return items


def main() -> None:
    driver = setup_driver()
    all_items = []
    seen_keys = set()

    try:
        driver.get(START_URL)
        click_cookie_if_exists(driver)
        time.sleep(2)

        category_links = CATEGORY_URLS
        log(f"Total category pages: {len(category_links)}")

        for link in category_links:
            rows = scrape_category(driver, link)
            for row in rows:
                key = row["detail_url"] or f"{row['category_url']}::{row['product_name']}"
                if key in seen_keys:
                    continue
                seen_keys.add(key)
                all_items.append(row)

        OUTPUT_JSON.write_text(
            json.dumps(all_items, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        log(f"\nSaved JSON: {OUTPUT_JSON}")
        log(f"Total unique products: {len(all_items)}")

    finally:
        driver.quit()


if __name__ == "__main__":
    main()
