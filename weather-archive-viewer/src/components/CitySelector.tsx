// src/components/CitySelector.tsx

import React from 'react';

interface CitySelectorProps {
  selectedCities: string[];
  onChange: (cities: string[]) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({ selectedCities, onChange }) => {
  const cities = ['Veenendaal', 'Sao_Paulo', 'Utrecht'];

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    let updatedCities = [...selectedCities];

    if (checked) {
      updatedCities.push(value);
    } else {
      updatedCities = updatedCities.filter((city) => city !== value);
    }

    onChange(updatedCities);
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Select Cities:</h2>
      <div className="flex flex-wrap space-x-4">
        {cities.map((city) => (
          <label key={city} className="inline-flex items-center mr-4 mb-2">
            <input
              type="checkbox"
              value={city}
              checked={selectedCities.includes(city)}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">{city.replace('_', ' ')}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CitySelector;
