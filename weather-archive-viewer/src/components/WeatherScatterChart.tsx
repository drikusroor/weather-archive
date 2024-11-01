// src/components/WeatherScatterChart.tsx

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { WeatherRecord } from '../types/WeatherData';
import { getWeatherEmoji } from '../utils/weatherEmojis';

interface WeatherScatterChartProps {
  data: Record<string, WeatherRecord[]>;
}

const WeatherScatterChart: React.FC<WeatherScatterChartProps> = ({ data }) => {
  // Assign a unique color to each city
  const cityColors: { [city: string]: string } = {};
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a83279'];
  Object.keys(data).forEach((city, index) => {
    cityColors[city] = colors[index % colors.length];
  });

  // Transform data
  const scatterData = Object.keys(data).map((city) => ({
    city,
    data: data[city].map((record) => ({
      x: record.datetime.getTime(),
      y: record.temperature,
      description: record.description,
      emoji: getWeatherEmoji(record.description),
      city,
    })),
  }));

  // Define a formatter for the X-axis (time)
  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Weather Scatter Chart</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Time"
              tickFormatter={formatXAxis}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Temperature (°C)"
              domain={['auto', 'auto']}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border border-gray-300 rounded">
                      <p>{`Time: ${new Date(dataPoint.x).toLocaleString()}`}</p>
                      <p>{`Temperature: ${dataPoint.y}°C`}</p>
                      <p>{`Weather: ${dataPoint.description}`}</p>
                      <p>{`City: ${dataPoint.city.replace('_', ' ')}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {scatterData.map((cityData) => (
              <Scatter
                key={cityData.city}
                name={cityData.city.replace('_', ' ')}
                data={cityData.data}
                fill={cityColors[cityData.city]}
                shape={(props) => (
                  <g>
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={10}
                      fill={cityColors[props.payload.city]}
                    />
                    <text
                      x={props.cx}
                      y={props.cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={16}
                    >
                      {props.payload.emoji}
                    </text>
                  </g>
                )}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherScatterChart;
