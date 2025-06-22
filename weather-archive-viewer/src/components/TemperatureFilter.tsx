import React from "react";
import { FiltersState } from "../types/FilterState";

interface TemperatureFilterProps {
  filters: FiltersState;
  onFilterChange: (name: string, value: string) => void;
}

const TemperatureFilter: React.FC<TemperatureFilterProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(e.target.name, e.target.value);
  };

  return (
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
    </div>
  );
};

export default TemperatureFilter;