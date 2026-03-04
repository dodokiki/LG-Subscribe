from bs4 import BeautifulSoup

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

# Find neo-card elements
neo_cards = soup.find_all(class_='neo-card--default')
first_card = neo_cards[0]

print('=== Looking for price-related elements ===\n')

# Look for all elements with "price" in class
price_elems = first_card.find_all(class_=lambda c: c and 'price' in str(c).lower())
print(f'Elements with "price" in class: {len(price_elems)}')
for elem in price_elems:
    print(f'  {elem.get("class")}: {elem.get_text()[:100]}')

# Look for currency symbols
baht_elems = first_card.find_all(string=lambda s: s and '฿' in s)
print(f'\nElements with ฿: {len(baht_elems)}')
for elem in baht_elems[:3]:
    parent = elem.parent
    print(f'  Parent: {parent.name} with class {parent.get("class")}: "{elem.strip()}"')

# Look for "เดือน" (month in Thai)
month_elems = first_card.find_all(string=lambda s: s and 'เดือน' in s)
print(f'\nElements with "เดือน": {len(month_elems)}')
for elem in month_elems[:3]:
    parent = elem.parent
    print(f'  Parent: {parent.name} with class {parent.get("class")}: "{elem.strip()}"')

# Print the bottom part of the card (where price usually is)
print('\n=== Card bottom section (last 1500 chars) ===')
card_html = str(first_card)
print(card_html[-1500:])
