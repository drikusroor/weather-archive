import { WeatherRecord } from "../types/WeatherData";
import { FiltersState } from "../types/FilterState";

export const applyFilters = (
  data: Record<string, WeatherRecord[]>,
  filters: FiltersState
): Record<string, WeatherRecord[]> => {
  return Object.keys(data).reduce((acc, city) => {
    let cityData = data[city];

    // Date range filtering
    if (filters.startDate !== undefined) {
      cityData = cityData.filter(
        (record) => record.datetime.getTime() >= filters.startDate!
      );
    }

    if (filters.endDate !== undefined) {
      cityData = cityData.filter(
        (record) => record.datetime.getTime() <= filters.endDate!
      );
    }

    // Temperature filtering
    if (filters.minTemp) {
      cityData = cityData.filter(
        (record) => record.temperature >= parseFloat(filters.minTemp!)
      );
    }

    if (filters.maxTemp) {
      cityData = cityData.filter(
        (record) => record.temperature <= parseFloat(filters.maxTemp!)
      );
    }

    // Description filtering
    if (filters.descriptions?.length) {
      cityData = cityData.filter((record) =>
        filters.descriptions?.includes(record.description.toLowerCase())
      );
    }

    acc[city] = cityData;
    return acc;
  }, {} as Record<string, WeatherRecord[]>);
};

export const calculateDateBounds = (data: Record<string, WeatherRecord[]>) => {
  const allDates = Object.values(data)
    .flat()
    .map((record) => record.datetime.getTime());

  if (allDates.length === 0) {
    return { minDate: 0, maxDate: 0 };
  }

  return {
    minDate: Math.min(...allDates),
    maxDate: Math.max(...allDates),
  };
};

export const calculateDescriptionCounts = (
  data: Record<string, WeatherRecord[]>,
  startDate?: number,
  endDate?: number
): { value: string; amount: number }[] => {
  const allDescriptions = Object.values(data)
    .flat()
    .filter(record => {
      return (
        (!startDate || record.datetime.getTime() >= startDate) &&
        (!endDate || record.datetime.getTime() <= endDate)
      );
    })
    .map((record) => record.description);

  if (allDescriptions.length === 0) {
    return [];
  }

  const uniqueDescriptions = Array.from(new Set(allDescriptions));
  return uniqueDescriptions
    .map((description) => ({
      value: description,
      amount: allDescriptions.filter((d) => d === description).length,
    }))
    .sort((a, b) => b.amount - a.amount);
};