// src/components/Filters.tsx

import React, { useState, useEffect } from "react";
import { WeatherRecord } from "../types/WeatherData";
import { useDebounce } from "../hooks/useDebounce";
import { FiltersState } from "../types/FilterState";
import { applyFilters, calculateDateBounds, calculateDescriptionCounts } from "../utils/filterUtils";
import DateRangeFilter from "./DateRangeFilter";
import TemperatureFilter from "./TemperatureFilter";
import WeatherDescriptionFilter from "./WeatherDescriptionFilter";

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
    const filteredData = applyFilters(data, debouncedFilters);
    onFilter(filteredData);
  }, [debouncedFilters, data]);

  // Calculate min and max dates
  useEffect(() => {
    const { minDate, maxDate } = calculateDateBounds(data);

    if (minDate && maxDate) {
      setFilters({
        ...filters,
        minDate,
        maxDate,
        startDate: filters.startDate ?? minDate,
        endDate: filters.endDate ?? maxDate,
      });

      setSliderValues([
        debouncedFilters.startDate ?? minDate,
        debouncedFilters.endDate ?? maxDate,
      ]);
    }

    const descriptionCounts = calculateDescriptionCounts(
      data,
      debouncedFilters.startDate,
      debouncedFilters.endDate
    );
    setDescriptionValues(descriptionCounts);

    // Clean up invalid descriptions from filters
    if (filters.descriptions && descriptionCounts.length > 0) {
      const validDescriptions = filters.descriptions.filter((d: string) =>
        descriptionCounts.some((desc) => desc.value === d)
      );
      if (validDescriptions.length !== filters.descriptions.length) {
        setFilters({
          ...filters,
          descriptions: validDescriptions,
        });
      }
    }
  }, [data, debouncedFilters.endDate, debouncedFilters.startDate, setFilters]);

  // Handle slider change
  const handleSliderChange = (values: [number, number]) => {
    setSliderValues(values);
  };

  // Apply filters after slider change is complete
  const handleSliderAfterChange = (values: [number, number]) => {
    const [startTimestamp, endTimestamp] = values;
    setFilters({
      ...filters,
      startDate: startTimestamp,
      endDate: endTimestamp,
    });
  };

  // Handle temperature and other simple filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Handle description toggle
  const handleDescriptionToggle = (description: string, checked: boolean) => {
    setFilters({
      ...filters,
      descriptions: checked
        ? [...(filters.descriptions ?? []), description]
        : filters.descriptions?.filter((d: string) => d !== description),
    });
  };

  // Create a wrapper function for setFilters to match the expected signature
  const setFiltersWrapper = (updater: (prev: FiltersState) => FiltersState) => {
    setFilters(updater(filters));
  };

  // Update slider values when date inputs change
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      setSliderValues([filters.startDate, filters.endDate]);
    }
  }, [filters.startDate, filters.endDate]);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Filters</h2>
      
      <DateRangeFilter
        filters={filters}
        setFilters={setFiltersWrapper}
        sliderValues={sliderValues}
        onSliderChange={handleSliderChange}
        onSliderAfterChange={handleSliderAfterChange}
      />

      <div className="grid grid-cols-1 gap-6">
        <TemperatureFilter
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        <WeatherDescriptionFilter
          filters={filters}
          descriptionValues={descriptionValues}
          onDescriptionToggle={handleDescriptionToggle}
        />
      </div>
    </div>
  );
};

export default Filters;
