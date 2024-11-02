// src/components/WeatherScatterChart.tsx

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { WeatherRecord } from "../types/WeatherData";
import { getWeatherEmoji } from "../utils/weatherEmojis";
import { aggregateDataByDay } from "../utils/aggregateData";

const MAX_DATA_POINTS = 550; // Threshold for aggregation

interface WeatherScatterChartProps {
  data: Record<string, WeatherRecord[]>;
}

const WeatherScatterChart: React.FC<WeatherScatterChartProps> = ({ data }) => {

  // Calculate total number of data points
  const totalDataPoints = Object.values(data).reduce(
    (sum, cityData) => sum + cityData.length,
    0
  );

  const cityColors: { [city: string]: string } = {};
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a83279"];
  Object.keys(data).forEach((city, index) => {
    cityColors[city] = colors[index % colors.length];
  });

  let scatterData: {
    city: string;
    data: {
      x: number;
      y: number;
      description: string;
      emoji: string;
      city: string;
      [key: string]: any;
    }[];
  }[] = [];

  if (totalDataPoints > MAX_DATA_POINTS) {
    // Use aggregated data
    scatterData = Object.keys(data).map((city) => {
      const aggregatedData = aggregateDataByDay(data[city]);

      return {
        city,
        data: aggregatedData.map((record) => ({
          x: new Date(record.date).getTime(),
          yMin: record.minTemp,
          yMax: record.maxTemp,
          yAvg: record.avgTemp,
          y: record.avgTemp, // Use average temperature for plotting
          description: record.description,
          emoji: getWeatherEmoji(record.description),
          city: record.city,
        })),
      };
    });
  } else {
    // Use original data
    scatterData = Object.keys(data).map((city) => ({
      city,
      data: data[city].map((record) => ({
        x: record.datetime.getTime(),
        y: record.temperature,
        description: record.description,
        emoji: getWeatherEmoji(record.description),
        city: record.location,
      })),
    }));
  }

  // Formatter for X-axis
  const formatXAxis = (tickItem: number) => {
    return totalDataPoints > MAX_DATA_POINTS
      ? new Date(tickItem).toLocaleDateString()
      : new Date(tickItem).toLocaleTimeString();
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Weather Scatter Chart</h2>
      {/* Optional message about data aggregation */}
      <div className="mb-2 text-sm text-gray-600">
        {totalDataPoints > MAX_DATA_POINTS
          ? "Data has been aggregated to daily averages for performance."
          : "Displaying individual data points."}
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Time"
              tickFormatter={formatXAxis}
              domain={["dataMin", "dataMax"]}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Temperature (°C)"
              domain={["auto", "auto"]}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  const dateStr = new Date(dataPoint.x).toLocaleDateString();
                  const timeStr = new Date(dataPoint.x).toLocaleTimeString();
                  return (
                    <div className="bg-white p-2 border border-gray-300 rounded">
                      <p>
                        {totalDataPoints > MAX_DATA_POINTS
                          ? `Date: ${dateStr}`
                          : `Time: ${dateStr} ${timeStr}`}
                      </p>
                      {totalDataPoints > MAX_DATA_POINTS ? (
                        <>
                          <p>{`Min Temp: ${dataPoint.yMin.toFixed(1)}°C`}</p>
                          <p>{`Max Temp: ${dataPoint.yMax.toFixed(1)}°C`}</p>
                          <p>{`Avg Temp: ${dataPoint.yAvg.toFixed(1)}°C`}</p>
                        </>
                      ) : (
                        <p>{`Temperature: ${dataPoint.y.toFixed(1)}°C`}</p>
                      )}
                      <p>{`Weather: ${dataPoint.description} ${dataPoint.emoji}`}</p>
                      <p>{`City: ${dataPoint.city.replace("_", " ")}`}</p>
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
                name={cityData.city.replace("_", " ")}
                data={cityData.data}
                fill={cityColors[cityData.city]}
                shape={(props) => (
                  <g>
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={14}
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
