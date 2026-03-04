import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Re-enabled for speed
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def handle_cookie_consent(driver):
    """Handle cookie consent popup if present"""
    try:
        # Wait for cookie banner and accept
        wait = WebDriverWait(driver, 5)
        # Try common cookie consent button selectors
        selectors = [
            "button[id*='accept']",
            "button[class*='accept']",
            "button[id*='cookie']",
            "button[class*='cookie']",
            ".onetrust-accept-btn-handler",
            "#onetrust-accept-btn-handler",
            "button.c-button--primary"
        ]
        
        for selector in selectors:
            try:
                cookie_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                cookie_btn.click()
                print("Cookie consent handled")
                time.sleep(2)
                return
            except:
                continue
    except TimeoutException:
        print("No cookie consent popup found or already handled")

def wait_for_products(driver, timeout=30):
    """Wait for product cards to load"""
    try:
        # Scroll down to trigger lazy loading and get to products section
        print("Scrolling to load products...")
        driver.execute_script("window.scrollTo(0, 800);")
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, 1500);")
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, 2500);")
        time.sleep(4)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
        time.sleep(4)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(4)
        
        # Scroll back up to see products
        driver.execute_script("window.scrollTo(0, 1500);")
        time.sleep(3)
        
        wait = WebDriverWait(driver, timeout)
        # Wait for product container or cards to be present
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".neo-card")))
        
        # Wait specifically for prices to load
        print("Waiting for prices to load...")
        time.sleep(8)  # Extra wait for prices to render
        
        return True
    except TimeoutException:
        print("Timeout waiting for products to load")
        return False

def extract_products(driver, page_number):
    """Extract product information from current page"""
    products = []
    
    # Try multiple selectors for product cards
    product_selectors = [
        ".neo-card",  # Changed to parent container
        ".c-product-list__item",
        ".c-product-item",
        ".product-card"
    ]
    
    product_elements = []
    for selector in product_selectors:
        try:
            elements = driver.find_elements(By.CSS_SELECTOR, selector)
            if elements:
                product_elements = elements
                print(f"Found {len(elements)} products using selector: {selector}")
                break
        except:
            continue
    
    # Always save page source for debugging
    page_source = driver.page_source
    
    # Save screenshot for debugging
    try:
        driver.save_screenshot(f"d:\\LG Sub\\Scapping\\screenshot_page_{page_number}.png")
    except:
        pass
    
    with open(f"d:\\LG Sub\\Scapping\\debug_page_{page_number}.html", "w", encoding="utf-8") as f:
        f.write(page_source)
    
    # Print some of the HTML to see structure
    print(f"\n=== HTML Sample (first 500 chars after body) ===")
    body_start = page_source.find("<body")
    if body_start > 0:
        sample = page_source[body_start:body_start+1000]
        print(sample[:500])
    
    if not product_elements:
        print("No product elements found")
        return products
    
    for idx, element in enumerate(product_elements):
        try:
            product = {
                "product_name": None,
                "model_code": None,
                "monthly_price_text": None,
                "original_price_text": None,
                "discount_text": None,
                "detail_url": None,
                "image_url": None,
                "page_number": page_number
            }
            
            # Extract product name
            name_selectors = [
                ".neo-card--ufn h3",
                ".neo-card--ufn a",
                ".c-product-item__name",
                ".product-name",
                ".c-card__title",
                "h3",
                "h2"
            ]
            for sel in name_selectors:
                try:
                    name_elem = element.find_element(By.CSS_SELECTOR, sel)
                    product["product_name"] = name_elem.text.strip()
                    if product["product_name"]:
                        break
                except:
                    continue
            
            # Extract model code
            model_selectors = [
                ".c-product-item__sku",
                ".neo-card--sku .btn-copy",
                ".model-code",
                "[class*='model']",
                ".product-code",
                "[data-sku]"
            ]
            for sel in model_selectors:
                try:
                    model_elem = element.find_element(By.CSS_SELECTOR, sel)
                    # Try getting from data-sku attribute first
                    product["model_code"] = model_elem.get_attribute("data-sku") or model_elem.text.strip()
                    if product["model_code"]:
                        break
                except:
                    continue
            
            # Extract monthly price
            price_selectors = [
                ".cell-price",
                ".neo-price--price",
                ".c-price__monthly",
                ".monthly-price"
            ]
            for sel in price_selectors:
                try:
                    price_elem = element.find_element(By.CSS_SELECTOR, sel)
                    price_text = price_elem.text.strip()
                    if price_text:
                        product["monthly_price_text"] = price_text
                        break
                except:
                    continue
            
            # Extract original price
            original_price_selectors = [
                "del",
                ".cell-after del",
                ".c-price__original",
                ".original-price"
            ]
            for sel in original_price_selectors:
                try:
                    orig_elem = element.find_element(By.CSS_SELECTOR, sel)
                    product["original_price_text"] = orig_elem.text.strip()
                    if product["original_price_text"]:
                        break
                except:
                    continue
            
            # Extract discount
            discount_selectors = [
                ".neo-tag--box",
                ".c-badge--discount",
                ".discount",
                "[class*='discount']",
                ".badge-sale"
            ]
            for sel in discount_selectors:
                try:
                    disc_elem = element.find_element(By.CSS_SELECTOR, sel)
                    disc_text = disc_elem.text.strip()
                    if disc_text and disc_text.lower() != 'subscription':
                        product["discount_text"] = disc_text
                        break
                except:
                    continue
            
            # Extract detail URL
            link_selectors = [
                ".neo-card--ufn a",
                "a[href*='subscription']",
                "a[href*='lgsubscribe']",
                "a[href]"
            ]
            for sel in link_selectors:
                try:
                    link_elem = element.find_element(By.CSS_SELECTOR, sel)
                    href = link_elem.get_attribute("href")
                    if href:
                        # Make absolute URL if needed
                        if href.startswith('/'):
                            href = "https://www.lg.com" + href
                        product["detail_url"] = href
                        break
                except:
                    continue
            
            # Extract image URL
            img_selectors = [
                ".neo-card--top img",
                "img",
                ".c-image__img"
            ]
            for sel in img_selectors:
                try:
                    img_elem = element.find_element(By.CSS_SELECTOR, sel)
                    src = img_elem.get_attribute("src")
                    if src and not src.endswith(".svg"):
                        # Make absolute URL if needed
                        if src.startswith('/'):
                            src = "https://www.lg.com" + src
                        product["image_url"] = src
                        break
                except:
                    continue
            
            # Only add if we have at least a product name or detail URL
            if product["product_name"] or product["detail_url"]:
                products.append(product)
                print(f"  Product {idx + 1}: {product['product_name']}")
            
        except Exception as e:
            print(f"Error extracting product {idx}: {e}")
            continue
    
    return products

def has_next_page(driver):
    """Check if there's a next page available"""
    try:
        next_button_selectors = [
            ".c-pagination__next:not(.disabled)",
            ".pagination-next:not(.disabled)",
            "button[aria-label*='next']:not([disabled])",
            "a[aria-label*='next']",
            ".next-page:not(.disabled)"
        ]
        
        for selector in next_button_selectors:
            try:
                next_btn = driver.find_element(By.CSS_SELECTOR, selector)
                if next_btn.is_displayed() and next_btn.is_enabled():
                    return True, next_btn
            except:
                continue
        
        return False, None
    except:
        return False, None

def click_next_page(driver, next_button):
    """Click the next page button"""
    try:
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_button)
        time.sleep(1)
        next_button.click()
        time.sleep(3)  # Wait for page to load
        return True
    except Exception as e:
        print(f"Error clicking next page: {e}")
        return False

def main():
    url = "https://www.lg.com/th/subscription/all/?ec_subscribe_filter_name_for_subs_plp=%E0%B8%9C%E0%B8%A5%E0%B8%B4%E0%B8%95%E0%B8%A0%E0%B8%B1%E0%B8%93%E0%B8%91%E0%B9%8C%E0%B8%82%E0%B8%AD%E0%B8%87_LG_Subscribe&ec_model_status_code=ACTIVE"
    
    print("Initializing Chrome driver...")
    driver = setup_driver()
    
    try:
        print(f"Navigating to: {url}")
        driver.get(url)
        
        # Handle cookie consent
        handle_cookie_consent(driver)
        
        # Wait for initial products to load
        if not wait_for_products(driver):
            print("Failed to load products")
            driver.quit()
            return
        
        all_products = []
        page_number = 1
        seen_urls = set()
        
        while True:
            print(f"\n=== Scraping Page {page_number} ===")
            
            # Extract products from current page
            products = extract_products(driver, page_number)
            
            # Filter duplicates
            new_products = []
            for product in products:
                url_key = product.get("detail_url", "") or product.get("product_name", "")
                if url_key and url_key not in seen_urls:
                    seen_urls.add(url_key)
                    new_products.append(product)
            
            print(f"Found {len(new_products)} new unique products on page {page_number}")
            all_products.extend(new_products)
            
            # Check for next page
            has_next, next_button = has_next_page(driver)
            
            if not has_next:
                print("\nNo more pages available")
                break
            
            print(f"Moving to page {page_number + 1}...")
            if not click_next_page(driver, next_button):
                print("Failed to navigate to next page")
                break
            
            page_number += 1
            
            # Wait for products to load on new page
            if not wait_for_products(driver):
                print("Failed to load products on next page")
                break
        
        print(f"\n=== Scraping Complete ===")
        print(f"Total unique products scraped: {len(all_products)}")
        
        # Save to JSON file
        output_file = "d:\\LG Sub\\Scapping\\lg_subscribe_products.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_products, f, ensure_ascii=False, indent=2)
        
        print(f"Results saved to: {output_file}")
        
        # Don't print JSON to console due to encoding issues
        # Output is already saved to file
        
    except Exception as e:
        print(f"Error during scraping: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        driver.quit()
        print("\nBrowser closed")

if __name__ == "__main__":
    main()
