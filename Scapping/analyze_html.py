from bs4 import BeautifulSoup
import re

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

# Find elements with 'product-item' in class
elems = soup.find_all(class_=re.compile('product-item'))
print(f'Found {len(elems)} elements with product-item in class')

for i, elem in enumerate(elems[:3]):
    print(f'\n=== Element {i} ===')
    print(f'Classes: {elem.get("class")}')
    print(f'Tag: {elem.name}')
    # Get first 200 chars of content
    text = elem.get_text()[:200] if elem.get_text() else "No text"
    print(f'Text: {text}')
    # Check for links
    links = elem.find_all('a', href=True)
    if links:
        print(f'Links: {[l.get("href")[:50] for l in links[:2]]}')
