import os
import csv
import requests
from datetime import datetime
import urllib.parse

# get from env
API_KEY = os.environ.get('WEATHER_API_KEY')
CITIES = os.environ.get('CITIES')

def make_url(city):
    return f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric'

def fetch_weather_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return None

def save_to_csv(data, filename):
    fieldnames = ['timestamp', 'city', 'temperature', 'weather']
    row = {
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'city': data['name'],
        'temperature': data['main']['temp'],
        'weather': data['weather'][0]['description']
    }

    try:
        with open(filename, 'a', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writerow(row)
    except IOError as e:
        print(f'I/O error: {e}')

def main():
    # Split and clean the cities - this will handle both \n and \r\n line endings
    cities = [city.strip() for city in CITIES.splitlines()]

    for city in cities:
        if not city:  # Skip empty lines
            continue
            
        URL = make_url(city)
        weather_data = fetch_weather_data(URL)

        if weather_data:
            curr_year = datetime.now().year
            filename = f'archive/{city}_{curr_year}.csv'
            
            # Clean the filename if needed, but shouldn't be necessary now
            filename = filename.replace('\r', '').replace('\n', '')
            
            save_to_csv(weather_data, filename)
        else:
            print('Failed to fetch weather data for', city)

if __name__ == '__main__':
    main()