// src/App.tsx

import React, { useState, useEffect } from "react";
import { fetchWeatherData } from "./utils/fetchData";
import { WeatherRecord } from "./types/WeatherData";
import CitySelector from "./components/CitySelector";
import WeatherChart from "./components/WeatherChart";
import WeatherScatterChart from "./components/WeatherScatterChart";
import DataTable from "./components/DataTable";
import Filters from "./components/Filters";
import Tabs from "./components/Tabs";
import { FiltersState } from "./types/FilterState";

const App: React.FC = () => {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [filters, setFilters] = useState<FiltersState>({});
  const [weatherData, setWeatherData] = useState<
    Record<string, WeatherRecord[]>
  >({});
  const [filteredData, setFilteredData] = useState<
    Record<string, WeatherRecord[]>
  >({});

  // Determine background based on the latest weather description
  const [backgroundClass, setBackgroundClass] = useState<string>(
    "bg-gradient-to-b from-blue-200 to-blue-500"
  );

  useEffect(() => {
    const loadData = async () => {
      const dataPromises = selectedCities.map(async (city) => {
        const data = await fetchWeatherData(city);
        return { [city]: data };
      });

      const results = await Promise.all(dataPromises);
      const data = Object.assign({}, ...results);
      setWeatherData(data);
      setFilteredData(data);
    };

    if (selectedCities.length > 0) {
      loadData();
    } else {
      setWeatherData({});
      setFilteredData({});
    }
  }, [selectedCities]);

  useEffect(() => {
    if (selectedCities.length > 0 && weatherData) {
      const latestRecords = Object.values(weatherData)
        .flat()
        .sort((a, b) => b.datetime.getTime() - a.datetime.getTime());
      if (latestRecords.length > 0) {
        const latestWeather = latestRecords[0].description.toLowerCase();
        if (latestWeather.includes("clear")) {
          setBackgroundClass("bg-gradient-to-b from-blue-200 to-blue-500");
        } else if (latestWeather.includes("cloud")) {
          setBackgroundClass("bg-gradient-to-b from-gray-300 to-gray-500");
        } else if (latestWeather.includes("rain")) {
          setBackgroundClass("bg-gradient-to-b from-gray-400 to-blue-900");
        } else {
          setBackgroundClass("bg-gradient-to-b from-green-200 to-blue-500");
        }
      }
    } else {
      setBackgroundClass("bg-gradient-to-b from-blue-200 to-blue-500");
    }
  }, [weatherData, selectedCities]);

  return (
    <div className={`${backgroundClass} min-h-screen`}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-white drop-shadow">
          Weather Dashboard
        </h1>
        <div className="bg-gray-100 rounded-lg shadow p-4">
          <CitySelector
            selectedCities={selectedCities}
            onChange={setSelectedCities}
          />
          <Filters
            data={weatherData}
            onFilter={setFilteredData}
            filters={filters}
            setFilters={setFilters}
          />
          <Tabs
            tabs={[
              {
                name: "Line Chart",
                content: <WeatherChart data={filteredData} />,
              },
              {
                name: "Scatter Chart",
                content: <WeatherScatterChart data={filteredData} />,
              },
            ]}
          />
          <DataTable data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default App;
