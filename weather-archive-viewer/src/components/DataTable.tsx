// src/components/DataTable.tsx

import React from 'react';
import { WeatherRecord } from '../types/WeatherData';
import { FixedSizeList as List } from 'react-window';
import { getWeatherEmoji } from '../utils/weatherEmojis';

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

  if (dataSource.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Weather Data Table</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <p>No data available. Please select a city and apply filters.</p>
        </div>
      </div>
    );
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = dataSource[index];
    return (
      <div
        className={`grid grid-cols-4 px-4 py-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
        style={style}
      >
        <div className="truncate">{item.datetime}</div>
        <div className="truncate">{item.city}</div>
        <div className="truncate">{item.temperature}°C</div>
        <div className="truncate text-right">{item.description} {getWeatherEmoji(item.description)} </div>
      </div>
    );
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Weather Data Table</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-200 px-4 py-2 font-semibold">
          <div>Date Time</div>
          <div>City</div>
          <div>Temperature</div>
          <div>Description</div>
        </div>
        <List
          height={400}
          itemCount={dataSource.length}
          itemSize={50}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  );
};

export default DataTable;
