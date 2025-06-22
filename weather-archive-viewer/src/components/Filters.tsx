// src/components/Filters.tsx

import React, { useState, useEffect } from "react";
import { WeatherRecord } from "../types/WeatherData";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useDebounce } from "../hooks/useDebounce";
import { FiltersState } from "../types/FilterState";
import { getWeatherEmoji } from "../utils/weatherEmojis";

const DEBOUNCE_DELAY = 300;

interface FiltersProps {
  data: Record<string, WeatherRecord[]>;
  onFilter: (filteredData: Record<string, WeatherRecord[]>) => void;
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
}

const Filters: React.FC<FiltersProps> = ({
  data,
  onFilter,
  filters,
  setFilters,
}) => {
  const [sliderValues, setSliderValues] = useState<[number, number]>([0, 0]);
  const [descriptionValues, setDescriptionValues] = useState<
    { value: string; amount: number }[]
  >([]);

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

    const allDescriptions = Object.values(data)
      .flat()
      .filter(record => {
        return (
          (!debouncedFilters.startDate || record.datetime.getTime() >= debouncedFilters.startDate) &&
          (!debouncedFilters.endDate || record.datetime.getTime() <= debouncedFilters.endDate)
        );
      })
      .map((record) => record.description);

    if (allDescriptions.length > 0) {
      const uniqueDescriptions = Array.from(new Set(allDescriptions));
      const descriptionCounts = uniqueDescriptions
        .map((description) => ({
          value: description,
          amount: allDescriptions.filter((d) => d === description).length,
        }))
        .sort((a, b) => b.amount - a.amount);

      setDescriptionValues(descriptionCounts);

      // if there are descriptions in the filter that are not in the data, remove them
      if (filters.descriptions) {
        const validDescriptions = filters.descriptions.filter((d) =>
          uniqueDescriptions.includes(d)
        );
        setFilters((prevFilters) => ({
          ...prevFilters,
          descriptions: validDescriptions,
        }));
      }
    }
  }, [data, debouncedFilters.endDate, debouncedFilters.startDate, setFilters]);

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

      if (filters.descriptions?.length) {
        cityData = cityData.filter((record) =>
          filters.descriptions?.includes(record.description.toLowerCase())
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

    if (name === "startDate" || name === "endDate") {
      // Update slider values to reflect date input changes
      setSliderValues([
        name === "startDate" ? timestamp! : sliderValues[0],
        name === "endDate" ? timestamp! : sliderValues[1],
      ]);
    }
  };

  // Handle other input changes (temperature, description)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.name === "description") {
      const checked = e.target.checked;
      const description = e.target.value;

      console.log("description", description);
      console.log("checked", checked);

      setFilters((prevFilters) => ({
        ...prevFilters,
        descriptions: checked
          ? [...(prevFilters.descriptions ?? []), description]
          : prevFilters.descriptions?.filter((d) => d !== description),
      }));
      return;
    }

    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Handle quick date range selection
  const handleQuickDateRange = (range: 'day' | 'week' | 'month') => {
    if (!filters.maxDate) return;

    const now = new Date();
    const endDate = Math.min(filters.maxDate, now.getTime());
    let startDate: number;

    switch (range) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
        break;
      default:
        return;
    }

    // Ensure startDate is not before the minimum available date
    startDate = Math.max(startDate, filters.minDate || startDate);

    setFilters((prevFilters) => ({
      ...prevFilters,
      startDate,
      endDate,
    }));

    setSliderValues([startDate, endDate]);
  };

  // Check if a quick date range is currently active
  const isQuickRangeActive = (range: 'day' | 'week' | 'month'): boolean => {
    if (!filters.startDate || !filters.endDate || !filters.maxDate) return false;

    const now = new Date();
    const currentEndDate = Math.min(filters.maxDate, now.getTime());
    let expectedStartDate: number;

    switch (range) {
      case 'day':
        expectedStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();
        break;
      case 'week':
        expectedStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
        break;
      case 'month':
        expectedStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
        break;
      default:
        return false;
    }

    // Ensure expected start date is not before the minimum available date
    expectedStartDate = Math.max(expectedStartDate, filters.minDate || expectedStartDate);

    // Check if current selection matches the expected range (with some tolerance for date precision)
    const tolerance = 24 * 60 * 60 * 1000; // 1 day tolerance
    return (
      Math.abs(filters.startDate - expectedStartDate) < tolerance &&
      Math.abs(filters.endDate - currentEndDate) < tolerance
    );
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
              onChangeComplete={handleSliderAfterChange}
              tipFormatter={(value) => new Date(value).toLocaleDateString()}
              trackStyle={[{ backgroundColor: "#3b82f6" }]}
              handleStyle={[
                { borderColor: "#3b82f6" },
                { borderColor: "#3b82f6" },
              ]}
            />
            <div className="flex justify-between mt-2">
              <input
                type="date"
                name="startDate"
                className="border border-gray-300 rounded-md p-2"
                value={
                  filters.startDate
                    ? new Date(filters.startDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleDateInputChange}
              />
              <input
                type="date"
                name="endDate"
                className="border border-gray-300 rounded-md p-2"
                value={
                  filters.endDate
                    ? new Date(filters.endDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleDateInputChange}
              />
            </div>
            {/* Quick Date Range Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleQuickDateRange('day')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  isQuickRangeActive('day')
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Last Day
              </button>
              <button
                onClick={() => handleQuickDateRange('week')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  isQuickRangeActive('week')
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Last Week
              </button>
              <button
                onClick={() => handleQuickDateRange('month')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  isQuickRangeActive('month')
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Last Month
              </button>
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
            value={filters.minTemp || ""}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block text-gray-700">Max Temperature:</label>
          <input
            type="number"
            name="maxTemp"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            value={filters.maxTemp || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700">Weather Description:</label>
          {/* show many checkboxes */}
          <div className="flex flex-wrap gap-2">
            {descriptionValues.map((description) => (
              <label
                key={description.value}
                className={`flex items-center bg-white rounded-full p-1 px-2 cursor-pointer shadow-sm hover:bg-blue-100 transition-colors ${filters.descriptions?.includes(description.value)
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700"
                  }`}
              >
                <input
                  type="checkbox"
                  name="description"
                  value={description.value}
                  checked={filters.descriptions?.includes(description.value)}
                  onChange={handleInputChange}
                />
                <span className="ml-2 flex items-center gap-1">
                  {description.value} {getWeatherEmoji(description.value)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
