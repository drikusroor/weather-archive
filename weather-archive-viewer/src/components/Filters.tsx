// src/components/Filters.tsx

import React, { useState } from 'react';
import { WeatherRecord } from '../types/WeatherData';

interface FiltersProps {
  data: Record<string, WeatherRecord[]>;
  onFilter: (data: Record<string, WeatherRecord[]>) => void;
}

const Filters: React.FC<FiltersProps> = ({ data, onFilter }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minTemp, setMinTemp] = useState<string>('');
  const [maxTemp, setMaxTemp] = useState<string>('');

  const applyFilters = () => {
    const filteredData = Object.keys(data).reduce((acc, city) => {
      let cityData = data[city];

      if (startDate) {
        cityData = cityData.filter((record) => record.datetime >= new Date(startDate));
      }

      if (endDate) {
        cityData = cityData.filter((record) => record.datetime <= new Date(endDate));
      }

      if (minTemp) {
        cityData = cityData.filter((record) => record.temperature >= parseFloat(minTemp));
      }

      if (maxTemp) {
        cityData = cityData.filter((record) => record.temperature <= parseFloat(maxTemp));
      }

      acc[city] = cityData;
      return acc;
    }, {} as Record<string, WeatherRecord[]>);

    onFilter(filteredData);
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700">Start Date:</label>
          <input
            type="date"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700">End Date:</label>
          <input
            type="date"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700">Min Temperature:</label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            value={minTemp}
            onChange={(e) => setMinTemp(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700">Max Temperature:</label>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            value={maxTemp}
            onChange={(e) => setMaxTemp(e.target.value)}
          />
        </div>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        onClick={applyFilters}
      >
        Apply Filters
      </button>
    </div>
  );
};

export default Filters;
