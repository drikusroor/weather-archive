// src/utils/aggregateData.ts

import { WeatherRecord } from '../types/WeatherData';

export interface AggregatedDataPoint {
  date: string; // 'YYYY-MM-DD'
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  description: string;
  city: string;
}

export function aggregateDataByDay(data: WeatherRecord[]): AggregatedDataPoint[] {
  const groupedData: { [date: string]: WeatherRecord[] } = {};

  data.forEach((record) => {
    const date = record.datetime.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    if (!groupedData[date]) {
      groupedData[date] = [];
    }
    groupedData[date].push(record);
  });

  const aggregatedData: AggregatedDataPoint[] = Object.keys(groupedData).map((date) => {
    const records = groupedData[date];
    const temperatures = records.map((r) => r.temperature);
    const descriptions = records.map((r) => r.description);

    // For simplicity, take the most common description
    const description =
      descriptions.sort(
        (a, b) =>
          descriptions.filter((v) => v === b).length -
          descriptions.filter((v) => v === a).length
      )[0];

    return {
      date,
      minTemp: Math.min(...temperatures),
      maxTemp: Math.max(...temperatures),
      avgTemp: temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length,
      description,
      city: records[0].location,
    };
  });

  return aggregatedData;
}
