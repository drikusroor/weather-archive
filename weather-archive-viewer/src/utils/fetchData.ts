// src/utils/fetchWeatherData.ts

import Papa from 'papaparse';
import { WeatherRecord } from '../types/WeatherData';

export const fetchWeatherData = async (city: string, years?: number[]): Promise<WeatherRecord[]> => {
  const yearsToFetch = years || [new Date().getFullYear()];
  
  const allRecords: WeatherRecord[] = [];
  
  for (const year of yearsToFetch) {
    try {
      const url = `https://raw.githubusercontent.com/drikusroor/weather-archive/main/archive/${city}_${year}.csv`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`No data available for ${city} in ${year}`);
        continue;
      }
      
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
      
      allRecords.push(...records);
    } catch (error) {
      console.warn(`Error fetching data for ${city} in ${year}:`, error);
    }
  }

  return allRecords;
};

type WeatherDataIndex = {
  cities: Record<string, number[]>; // Maps city names to an array of years available
  last_updated: string;
};

export const fetchWeatherDataIndex = async (): Promise<WeatherDataIndex> => {

  const response = await fetch('https://raw.githubusercontent.com/drikusroor/weather-archive/main/archive/index.json');
  
  if (!response.ok) {
    throw new Error(`Error fetching weather data index: ${response.statusText}`);
  }
  
  const data = await response.json();

  if (!data || !data.cities || !data.last_updated) {
    throw new Error('Invalid data format received from index');
  }

  return {
    cities: data.cities,
    last_updated: data.last_updated,
  };
};