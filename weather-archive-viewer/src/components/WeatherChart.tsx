// src/components/WeatherChart.tsx

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { WeatherRecord } from "../types/WeatherData";

interface WeatherChartProps {
  data: Record<string, WeatherRecord[]>;
}

const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  const mergedData: { [key: string]: any }[] = [];

  // Create a merged data set with temperatures for each city
  Object.keys(data).forEach((city) => {
    data[city].forEach((record) => {
      const dateTime = record.datetime.toISOString();
      const existingEntry = mergedData.find(
        (entry) => entry.datetime === dateTime
      );

      if (existingEntry) {
        existingEntry[city] = record.temperature;
      } else {
        mergedData.push({
          datetime: dateTime,
          [city]: record.temperature,
        });
      }
    });
  });

  // Sort data by datetime
  mergedData.sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  const colors = ["#8884d8", "#82ca9d", "#ffc658"];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Temperature Over Time</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={mergedData}>
            <XAxis
              dataKey="datetime"
              tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Legend />
            {Object.keys(data).map((city, index) => (
              <Line
                key={city}
                type="monotone"
                dataKey={city}
                name={city.replace("_", " ")}
                stroke={colors[index % colors.length]}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherChart;
