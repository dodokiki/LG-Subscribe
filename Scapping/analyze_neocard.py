from bs4 import BeautifulSoup

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

# Find neo-card parent containers
neo_cards = soup.find_all(class_='neo-card')
print(f'Found {len(neo_cards)} neo-card elements')

if neo_cards:
    first = neo_cards[0]
    print(f'\n=== First neo-card full content ===')
    print(first.prettify()[:5000])
