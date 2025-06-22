import React from "react";
import { FiltersState } from "../types/FilterState";
import { getWeatherEmoji } from "../utils/weatherEmojis";

interface WeatherDescriptionFilterProps {
  filters: FiltersState;
  descriptionValues: { value: string; amount: number }[];
  onDescriptionToggle: (description: string, checked: boolean) => void;
}

const WeatherDescriptionFilter: React.FC<WeatherDescriptionFilterProps> = ({
  filters,
  descriptionValues,
  onDescriptionToggle,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    onDescriptionToggle(value, checked);
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-gray-700">Weather Description:</label>
      <div className="flex flex-wrap gap-2">
        {descriptionValues.map((description) => (
          <label
            key={description.value}
            className={`flex items-center bg-white rounded-full p-1 px-2 cursor-pointer shadow-sm hover:bg-blue-100 transition-colors ${
              filters.descriptions?.includes(description.value)
                ? "bg-blue-100 text-blue-800"
                : "text-gray-700"
            }`}
          >
            <input
              type="checkbox"
              name="description"
              value={description.value}
              checked={filters.descriptions?.includes(description.value)}
              onChange={handleCheckboxChange}
            />
            <span className="ml-2 flex items-center gap-1">
              {description.value} {getWeatherEmoji(description.value)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default WeatherDescriptionFilter;