// src/App.tsx

import { useQueries } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import CitySelector from "./components/CitySelector";
import DataTable from "./components/DataTable";
import Filters from "./components/Filters";
import Tabs from "./components/Tabs";
import WeatherChart from "./components/WeatherChart";
import WeatherScatterChart from "./components/WeatherScatterChart";
import type { FiltersState } from "./types/FilterState";
import type { WeatherRecord } from "./types/WeatherData";
import { fetchWeatherData } from "./utils/fetchData";

const App: React.FC = () => {
	const [selectedCities, setSelectedCities] = useState<string[]>([]);
	const [filters, setFilters] = useState<FiltersState>({});
	const [filteredData, setFilteredData] = useState<
		Record<string, WeatherRecord[]>
	>({});

	console.log({ selectedCities, filters, filteredData });

	// We need a useCityWeatherData for every selected city
	const weatherQueries = useQueries({
		queries: selectedCities.map((city) => ({
			queryKey: ["weather", city],
			queryFn: () => fetchWeatherData(city),
			enabled: !!city,
		})),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> This is to suppress the exhaustive dependencies warning for the useMemo hook.
	const weatherData = useMemo(
		() => {
			const data: Record<string, WeatherRecord[]> = {};
			weatherQueries.forEach((query, index) => {
				if (query.data) {
					data[selectedCities[index]] = query.data;
				}
			});
			return data;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			selectedCities,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			weatherQueries
				.map((q) => q.data)
				.join(),
			weatherQueries.forEach,
		],
	);

	const isLoading = weatherQueries.some((query) => query.isLoading);
	const hasError = weatherQueries.some((query) => query.isError);

	// Determine background based on the latest weather description
	const [backgroundClass, setBackgroundClass] = useState<string>(
		"bg-gradient-to-b from-blue-200 to-blue-500",
	);

	// Read from URL params on initial load
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const citiesParam = params.get("cities");
		const filtersParam = params.get("filters");

		if (filtersParam) {
			try {
				const filtersObj = JSON.parse(decodeURIComponent(filtersParam));

				delete filtersObj.minDate;
				delete filtersObj.maxDate;

				setFilters((prevFilters) => ({ ...prevFilters, ...filtersObj }));
			} catch (e) {
				console.error("Error parsing filters from URL", e);
			}
		}

		if (citiesParam) {
			const cities = citiesParam.split(",");
			setSelectedCities(cities);
		}
	}, []);

	// Update URL params when selectedCities or filters change
	useEffect(() => {
		const params = new URLSearchParams();

		if (selectedCities.length > 0) {
			params.set("cities", selectedCities.join(","));
		}

		if (Object.keys(filters).length > 0) {
			const filtersObj = { ...filters };
			delete filtersObj.minDate;
			delete filtersObj.maxDate;

			params.set("filters", encodeURIComponent(JSON.stringify(filtersObj)));
		}

		const newUrl = `${window.location.pathname}?${params.toString()}`;
		window.history.pushState({}, "", newUrl);
	}, [selectedCities, filters]);

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
					{hasError && (
						<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
							Error loading weather data. Please try again.
						</div>
					)}
					{isLoading && (
						<div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
							Loading weather data...
						</div>
					)}
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
