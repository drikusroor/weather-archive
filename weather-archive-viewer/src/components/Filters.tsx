// src/components/Filters.tsx

import React, { useState, useEffect } from 'react';
import { WeatherRecord } from '../types/WeatherData';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useDebounce } from '../hooks/useDebounce';
import { FiltersState } from '../types/FilterState';



const DEBOUNCE_DELAY = 300;

interface FiltersProps {
  data: Record<string, WeatherRecord[]>;
  onFilter: (filteredData: Record<string, WeatherRecord[]>) => void;
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
}

const Filters: React.FC<FiltersProps> = ({ data, onFilter, filters, setFilters }) => {
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
      const minDate = Math.min(...allDates);
      const maxDate = Math.max(...allDates);

      setFilters((prevFilters) => ({
        ...prevFilters,
        minDate,
        maxDate,
        startDate: prevFilters.startDate ?? minDate,
        endDate: prevFilters.endDate ?? maxDate,
      }));

      setSliderValues([
        debouncedFilters.startDate ?? minDate,
        debouncedFilters.endDate ?? maxDate,
      ]);
    }
  }, [data]);

  const applyFilters = () => {
    const filteredData = Object.keys(data).reduce((acc, city) => {
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
      startDate: startTimestamp,
      endDate: endTimestamp,
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

    if (name === 'startDate' || name === 'endDate') {
      // Update slider values to reflect date input changes
      setSliderValues([
        name === 'startDate' ? timestamp! : sliderValues[0],
        name === 'endDate' ? timestamp! : sliderValues[1],
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
        {filters.minDate && filters.maxDate && (
          <>
            <Slider
              range
              min={filters.minDate}
              max={filters.maxDate}
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
                name="startDate"
                className="border border-gray-300 rounded-md p-2"
                value={
                  filters.startDate
                    ? new Date(filters.startDate)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                onChange={handleDateInputChange}
              />
              <input
                type="date"
                name="endDate"
                className="border border-gray-300 rounded-md p-2"
                value={
                  filters.endDate
                    ? new Date(filters.endDate)
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