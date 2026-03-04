from bs4 import BeautifulSoup

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

# Find neo-card elements
neo_cards = soup.find_all(class_='neo-card')
print(f'Found {len(neo_cards)} neo-card elements')

if len(neo_cards) >= 4:
    # Get the 4th card (which shows ฿421 in the screenshot)
    card = neo_cards[3]
    print('\n=== Full HTML of 4th card ===')
    print(card.prettify())
