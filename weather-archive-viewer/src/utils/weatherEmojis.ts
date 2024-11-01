// src/utils/weatherEmojis.ts

export const weatherEmojis: { [key: string]: string } = {
  'clear sky': '☀️',
  'few clouds': '🌤️',
  'scattered clouds': '⛅',
  'broken clouds': '🌥️',
  'shower rain': '🌦️',
  'light intensity drizzle': '🌧️',
  'light rain': '🌧️',
  'moderate rain': '🌧️',
  'very heavy rain': '🌧️',
  'overcast clouds': '☁️',
  rain: '🌧️',
  thunderstorm: '⛈️',
  'thunderstorm with light rain': '⛈️',
  'thunderstorm with heavy rain': '⛈️',
  snow: '❄️',
  'haze': '🌫️',
  mist: '🌫️',
  'heavy intensity rain': '🌧️',
};

export function getWeatherEmoji(description: string): string {
  const emoji = weatherEmojis[description.toLowerCase()];

  if (!emoji) {
    console.warn(`No emoji found for weather description: ${description}`);
  }

  return emoji || '❓';
}
