// src/utils/fetchWeatherData.ts

import Papa from 'papaparse';
import { WeatherRecord } from '../types/WeatherData';

export const fetchWeatherData = async (city: string): Promise<WeatherRecord[]> => {

  const year = new Date().getFullYear();

  const url = `https://raw.githubusercontent.com/drikusroor/weather-archive/main/archive/${city}_${year}.csv`;

  const response = await fetch(url);
  const csvText = await response.text();

  const parsedData = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const records: WeatherRecord[] = parsedData.data.map((row) => ({
    datetime: new Date(row[0].replace(' ', 'T') + 'Z'), // Parse as UTC
    location: row[1],
    temperature: parseFloat(row[2]),
    description: row[3],
  }));

  return records;
};

type WeatherDataIndex = {
  cities: Record<string, number[]>; // Maps city names to an array of years available
  last_updated: string;
};

export const fetchWeatherDataIndex = async (): Promise<WeatherDataIndex> => {

  const response = await fetch('https://raw.githubusercontent.com/drikusroor/weather-archive/main/archive/index.json');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error fetching weather data index: ${response.statusText}`);
  }

  if (!data || !data.cities || !data.last_updated) {
    throw new Error('Invalid data format received from index');
  }

  return {
    cities: data.cities,
    last_updated: data.last_updated,
  };
};