// src/utils/fetchData.ts

import Papa from 'papaparse';
import { WeatherRecord } from '../types/WeatherData';

export const fetchWeatherData = async (city: string): Promise<WeatherRecord[]> => {
  const url = `https://raw.githubusercontent.com/drikusroor/weather-archive/main/archive/${city}_2024.csv`;

  const response = await fetch(url);
  const csvText = await response.text();

  const parsedData = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const records: WeatherRecord[] = parsedData.data.map((row) => ({
    datetime: new Date(row[0]),
    location: row[1],
    temperature: parseFloat(row[2]),
    description: row[3],
  }));

  return records;
};
