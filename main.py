import os
import csv
import requests
from datetime import datetime

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

    for CITY in CITIES.split('\n'):
        URL = make_url(CITY)
        weather_data = fetch_weather_data(URL)

        if weather_data:
            curr_year = datetime.now().year
            filename = f'archive/{CITY}_{curr_year}.csv'
            save_to_csv(weather_data, filename)
        else:
            print('Failed to fetch weather data for', CITY)

if __name__ == '__main__':
    main()
