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
    }
  }, [selectedCities]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Weather Dashboard</h1>
      <CitySelector onChange={setSelectedCities} />
      <Filters data={weatherData} onFilter={setFilteredData} />
      <WeatherChart data={filteredData} />
      <DataTable data={filteredData} />
    </div>
  );
};

export default App;
