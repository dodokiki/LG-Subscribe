from bs4 import BeautifulSoup
import json

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

# Find neo-card elements
neo_cards = soup.find_all(class_='neo-card--default')
print(f'Found {len(neo_cards)} neo-card--default elements\n')

# Print full structure of first card
first_card = neo_cards[0]
print('=== Full structure of first card ===')
print(first_card.prettify()[:2000])
