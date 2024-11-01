// src/components/CitySelector.tsx

import React from 'react';

interface CitySelectorProps {
  onChange: (cities: string[]) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({ onChange }) => {
  const cities = ['Veenendaal', 'Sao Paulo', 'Utrecht'];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
    onChange(selectedOptions);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700">Select Cities:</label>
      <select
        multiple
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-300"
        onChange={handleChange}
      >
        {cities.map((city) => (
          <option key={city} value={city}>
            {city.replace('_', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CitySelector;
