// src/components/DataTable.tsx

import React from 'react';
import { WeatherRecord } from '../types/WeatherData';

interface DataTableProps {
  data: Record<string, WeatherRecord[]>;
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const dataSource = Object.keys(data).flatMap((city) =>
    data[city].map((record) => ({
      datetime: record.datetime.toLocaleString(),
      city: city.replace('_', ' '),
      temperature: record.temperature,
      description: record.description,
    }))
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Weather Data Table</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-200 px-4 py-2">Date Time</th>
              <th className="border border-gray-200 px-4 py-2">City</th>
              <th className="border border-gray-200 px-4 py-2">Temperature</th>
              <th className="border border-gray-200 px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {dataSource.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-200 px-4 py-2">
                  {item.datetime}
                </td>
                <td className="border border-gray-200 px-4 py-2">{item.city}</td>
                <td className="border border-gray-200 px-4 py-2">
                  {item.temperature}°C
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
