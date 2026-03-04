from bs4 import BeautifulSoup

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

# Search for any price-like patterns in the entire page
import re

# Search for Thai Baht symbol or price patterns
price_pattern = re.compile(r'฿|บาท|\d+,?\d*\s*เดือน')
matches = price_pattern.findall(html[:100000])  # Search first 100k chars
print(f'Found {len(matches)} price-like patterns in first 100k chars')
print(f'Sample matches: {matches[:10]}')

# Find elements that contain numbers that might be prices
neo_cards = soup.find_all(class_='neo-card')
if neo_cards:
    first = neo_cards[0]
    # Get all text
    text_content = first.get_text()
    print(f'\n=== All text content from first card ===')
    print(text_content)
