from bs4 import BeautifulSoup
import json

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

# Find neo-card elements
neo_cards = soup.find_all(class_='neo-card--default')
print(f'Found {len(neo_cards)} neo-card--default elements')

products = []

for i, card in enumerate(neo_cards[:3]):
    print(f'\n=== Product {i} ===')
    product = {}
    
    # SKU
    sku_elem = card.find(class_='c-product-item__sku')
    if sku_elem:
        product['model_code'] = sku_elem.get_text().strip()
        print(f'SKU: {product["model_code"]}')
    
    # Name/Title
    name_elem = card.find(class_='c-product-item__name')
    if name_elem:
        product['product_name'] = name_elem.get_text().strip()
        print(f'Name: {product["product_name"]}')
    
    # Link
    link_elem = card.find('a', href=True)
    if link_elem:
        product['detail_url'] = link_elem.get('href')
        print(f'URL: {product["detail_url"]}')
    
    # Image
    img_elem = card.find('img')
    if img_elem:
        product['image_url'] = img_elem.get('src')
        print(f'Image: {product["image_url"][:80] if product["image_url"] else "None"}')
    
    # Price
    price_elem = card.find(class_='c-product-item__price')
    if price_elem:
        product['monthly_price_text'] = price_elem.get_text().strip()
        print(f'Price: {product["monthly_price_text"]}')
    
    # Original price
    orig_price_elem = card.find('del')
    if orig_price_elem:
        product['original_price_text'] = orig_price_elem.get_text().strip()
        print(f'Original Price: {product["original_price_text"]}')
    
    # Discount
    discount_elem = card.find(class_='c-badge')
    if discount_elem:
        product['discount_text'] = discount_elem.get_text().strip()
        print(f'Discount: {product["discount_text"]}')
    
    products.append(product)

print(f'\n\n=== Summary ===')
print(f'Total products extracted: {len(products)}')
print(json.dumps(products, ensure_ascii=False, indent=2))
