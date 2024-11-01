// src/App.tsx

import React, { useState, useEffect } from 'react';
import { fetchWeatherData } from './utils/fetchData';
import { WeatherRecord } from './types/WeatherData';
import CitySelector from './components/CitySelector';
import WeatherChart from './components/WeatherChart';
import DataTable from './components/DataTable';
import Filters from './components/Filters';

const App: React.FC = () => {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherRecord[]>>({});
  const [filteredData, setFilteredData] = useState<Record<string, WeatherRecord[]>>({});

  // Function to apply filters
  const applyFilters = React.useCallback(
    (data: Record<string, WeatherRecord[]>, filters: FiltersState) => {
      const filteredData = Object.keys(data).reduce((acc, city) => {
        let cityData = data[city];

        if (filters.startDate) {
          cityData = cityData.filter(
            (record) => record.datetime >= new Date(filters.startDate)
          );
        }

        if (filters.endDate) {
          cityData = cityData.filter(
            (record) => record.datetime <= new Date(filters.endDate)
          );
        }

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

        if (filters.description) {
          cityData = cityData.filter((record) =>
            record.description.toLowerCase().includes(filters.description!.toLowerCase())
          );
        }

        acc[city] = cityData;
        return acc;
      }, {} as Record<string, WeatherRecord[]>);

      setFilteredData(filteredData);
    },
    []
  );

  useEffect(() => {
    const loadData = async () => {
      const dataPromises = selectedCities.map(async (city) => {
        const data = await fetchWeatherData(city);
        return { [city]: data };
      });

      const results = await Promise.all(dataPromises);
      const data = Object.assign({}, ...results);
      setWeatherData(data);
      setFilteredData(data);
    };

    if (selectedCities.length > 0) {
      loadData();
    } else {
      setWeatherData({});
      setFilteredData({});
    }
  }, [selectedCities]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Weather Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-4">
          <CitySelector selectedCities={selectedCities} onChange={setSelectedCities} />
          <Filters
            data={weatherData}
            onFilter={setFilteredData}
          />
          <WeatherChart data={filteredData} />
          <DataTable data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default App;
