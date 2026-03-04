from bs4 import BeautifulSoup

html = open('d:\\LG Sub\\Scapping\\debug_page_1.html', encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

neo_cards = soup.find_all(class_='neo-card')
first = neo_cards[0]

# Look for elements containing numbers
all_elements = first.find_all()
for elem in all_elements:
    text = elem.get_text(strip=True)
    # Look for numbers that might be prices
    if any(char.isdigit() for char in text) and len(text) < 50:
        # Check if it's not the SKU
        if '27LX6TDGA' not in text and '4.8' not in text:
            print(f'{elem.name} | class={elem.get("class")} | text="{text}"')
