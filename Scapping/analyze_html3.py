from bs4 import BeautifulSoup
import re
import json

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

# Look for elements that might contain product data
# Find all elements with data attributes that might contain product info
data_elements = soup.find_all(attrs={"data-model": True})
print(f'Elements with data-model: {len(data_elements)}')

data_elements2 = soup.find_all(attrs={"data-product": True})
print(f'Elements with data-product: {len(data_elements2)}')

# Look for ec- prefixed classes (e-commerce)
ec_elements = soup.find_all(class_=re.compile('^ec-'))
print(f'Elements with ec- prefix: {len(ec_elements)}')
if ec_elements:
    for i, elem in enumerate(ec_elements[:5]):
        print(f'  {i}: {elem.get("class")}')

# Look for common product grid containers
grid_selectors = [
    'ul.products',
    '.product-grid',
    '.product-list',
    '[class*="grid"]',
    '[class*="list"]'
]

for selector in grid_selectors:
    elements = soup.select(selector)
    if elements:
        print(f'\nFound {len(elements)} elements for selector: {selector}')
        elem = elements[0]
        # Count direct children
        children = [c for c in elem.children if c.name]
        print(f'  First element has {len(children)} children')
        if children:
            print(f'  First child: {children[0].name} with classes {children[0].get("class")}')

# Look for the sku element's parent
sku_elem = soup.find(class_='c-product-item__sku')
if sku_elem:
    print(f'\nFound SKU element: {sku_elem.get_text()}')
    parent = sku_elem.parent
    level = 0
    while parent and level < 5:
        print(f'  Level {level} parent: {parent.name} with classes {parent.get("class")}')
        parent = parent.parent
        level += 1
