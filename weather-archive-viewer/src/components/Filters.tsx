// src/components/Filters.tsx

import React, { useState, useEffect } from 'react';
import { WeatherRecord } from '../types/WeatherData';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useDebounce } from '../hooks/useDebounce';

interface FiltersState {
  startDateTimestamp?: number;
  endDateTimestamp?: number;
  minDateTimestamp?: number;
  maxDateTimestamp?: number;
  minTemp?: string;
  maxTemp?: string;
  description?: string;
}

const DEBOUNCE_DELAY = 300;

interface FiltersProps {
  data: Record<string, WeatherRecord[]>;
  onFilter: (filteredData: Record<string, WeatherRecord[]>) => void;
}

const Filters: React.FC<FiltersProps> = ({ data, onFilter }) => {
  const [filters, setFilters] = useState<FiltersState>({});
  const [sliderValues, setSliderValues] = useState<[number, number]>([
    0,
    0,
  ]);

  const debouncedFilters = useDebounce(filters, DEBOUNCE_DELAY);

  useEffect(() => {
    applyFilters();
  }, [debouncedFilters, data]);

  // Calculate min and max dates
  useEffect(() => {
    const allDates = Object.values(data)
      .flat()
      .map((record) => record.datetime.getTime());

    if (allDates.length > 0) {
      const minDateTimestamp = Math.min(...allDates);
      const maxDateTimestamp = Math.max(...allDates);

      setFilters((prevFilters) => ({
        ...prevFilters,
        minDateTimestamp,
        maxDateTimestamp,
        startDateTimestamp: prevFilters.startDateTimestamp ?? minDateTimestamp,
        endDateTimestamp: prevFilters.endDateTimestamp ?? maxDateTimestamp,
      }));

      setSliderValues([
        debouncedFilters.startDateTimestamp ?? minDateTimestamp,
        debouncedFilters.endDateTimestamp ?? maxDateTimestamp,
      ]);
    }
  }, [data]);

  const applyFilters = () => {
    const filteredData = Object.keys(data).reduce((acc, city) => {
      let cityData = data[city];

      // Date range filtering
      if (filters.startDateTimestamp !== undefined) {
        cityData = cityData.filter(
          (record) => record.datetime.getTime() >= filters.startDateTimestamp!
        );
      }

      if (filters.endDateTimestamp !== undefined) {
        cityData = cityData.filter(
          (record) => record.datetime.getTime() <= filters.endDateTimestamp!
        );
      }

      // Temperature and description filtering
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
          record.description
            .toLowerCase()
            .includes(filters.description!.toLowerCase())
        );
      }

      acc[city] = cityData;
      return acc;
    }, {} as Record<string, WeatherRecord[]>);

    onFilter(filteredData);
  };

  // Handle slider change
  const handleSliderChange = (values: [number, number]) => {
    setSliderValues(values);
  };

  // Apply filters after slider change is complete
  const handleSliderAfterChange = (values: [number, number]) => {
    const [startTimestamp, endTimestamp] = values;
    setFilters((prevFilters) => ({
      ...prevFilters,
      startDateTimestamp: startTimestamp,
      endDateTimestamp: endTimestamp,
    }));
  };

  // Handle date input change
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const timestamp = value ? new Date(value).getTime() : undefined;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: timestamp,
    }));

    if (name === 'startDateTimestamp' || name === 'endDateTimestamp') {
      // Update slider values to reflect date input changes
      setSliderValues([
        name === 'startDateTimestamp' ? timestamp! : sliderValues[0],
        name === 'endDateTimestamp' ? timestamp! : sliderValues[1],
      ]);
    }
  };

  // Handle other input changes (temperature, description)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Filters</h2>
      {/* Date Range Slider */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Date Range:</label>
        {filters.minDateTimestamp && filters.maxDateTimestamp && (
          <>
            <Slider
              range
              min={filters.minDateTimestamp}
              max={filters.maxDateTimestamp}
              value={sliderValues}
              onChange={handleSliderChange}
              onAfterChange={handleSliderAfterChange}
              tipFormatter={(value) => new Date(value).toLocaleDateString()}
              trackStyle={[{ backgroundColor: '#3b82f6' }]}
              handleStyle={[
                { borderColor: '#3b82f6' },
                { borderColor: '#3b82f6' },
              ]}
            />
            <div className="flex justify-between mt-2">
              <input
                type="date"
                name="startDateTimestamp"
                className="border border-gray-300 rounded-md p-2"
                value={
                  filters.startDateTimestamp
                    ? new Date(filters.startDateTimestamp)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                onChange={handleDateInputChange}
              />
              <input
                type="date"
                name="endDateTimestamp"
                className="border border-gray-300 rounded-md p-2"
                value={
                  filters.endDateTimestamp
                    ? new Date(filters.endDateTimestamp)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                onChange={handleDateInputChange}
              />
            </div>
          </>
        )}
      </div>
      {/* Temperature Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700">Min Temperature:</label>
          <input
            type="number"
            name="minTemp"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            value={filters.minTemp || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block text-gray-700">Max Temperature:</label>
          <input
            type="number"
            name="maxTemp"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            value={filters.maxTemp || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700">Weather Description:</label>
          <input
            type="text"
            name="description"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            placeholder="e.g., clear sky"
            value={filters.description || ''}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;
