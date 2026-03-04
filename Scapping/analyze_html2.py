from bs4 import BeautifulSoup
import re

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

# Find parent containers that have children with product-item class
product_containers = []

# Look for c-product-item as main class
containers = soup.find_all(class_='c-product-item')
print(f'Found {len(containers)} elements with c-product-item class')

for i, elem in enumerate(containers[:3]):
    print(f'\n=== Product Container {i} ===')
    print(f'Classes: {elem.get("class")}')
    print(f'Tag: {elem.name}')
    
    # Try to find product name
    name_elem = elem.find(class_=re.compile('name|title'))
    print(f'Name element: {name_elem.get("class") if name_elem else "Not found"}')
    if name_elem:
        print(f'Name text: {name_elem.get_text()[:100]}')
    
    # Try to find SKU/model
    sku_elem = elem.find(class_='c-product-item__sku')
    if sku_elem:
        print(f'SKU: {sku_elem.get_text()}')
    
    # Try to find link
    link = elem.find('a', href=True)
    if link:
        print(f'Link: {link.get("href")}')
    
    # Get some content
    print(f'Content preview: {elem.get_text()[:200]}')
