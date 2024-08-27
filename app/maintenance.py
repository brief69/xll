import requests
from bs4 import BeautifulSoup
import logging

logging.basicConfig(filename='maintenance.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

def check_website_structure(url, expected_element):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        element = soup.find(**expected_element)
        if element:
            logging.info(f"Structure check passed for {url}")
        else:
            logging.warning(f"Structure check failed for {url}. Expected element not found.")
    except Exception as e:
        logging.error(f"Error checking structure for {url}: {str(e)}")

def run_maintenance():
    checks = [
        ("https://finance.yahoo.com/quote/USDJPY=X", {'name': 'fin-streamer', 'attrs': {'data-symbol': 'USDJPY=X', 'data-field': 'regularMarketPrice'}}),
        ("https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=JPY", {'name': 'p', 'class': 'result__BigRate-sc-1bsijpp-1'}),
        ("https://coinmarketcap.com/currencies/bitcoin/", {'name': 'div', 'class': 'priceValue'}),
        ("https://www.coingecko.com/en/coins/bitcoin", {'name': 'span', 'class': 'no-wrap'}),
    ]

    for url, expected_element in checks:
        check_website_structure(url, expected_element)

if __name__ == "__main__":
    run_maintenance()
