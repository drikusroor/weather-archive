import Slider from "rc-slider";
import type React from "react";
import "rc-slider/assets/index.css";
import type { FiltersState } from "../types/FilterState";
import { calculateDateRange, isQuickRangeActive } from "../utils/dateUtils";

interface DateRangeFilterProps {
	filters: FiltersState;
	setFilters: (updater: (prev: FiltersState) => FiltersState) => void;
	sliderValues: [number, number];
	onSliderChange: (values: [number, number]) => void;
	onSliderAfterChange: (values: [number, number]) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
	filters,
	setFilters,
	sliderValues,
	onSliderChange,
	onSliderAfterChange,
}) => {
	const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const timestamp = value ? new Date(value).getTime() : undefined;

		setFilters((prevFilters) => ({
			...prevFilters,
			[name]: timestamp,
		}));
	};

	const handleQuickDateRange = (range: "day" | "week" | "month") => {
		if (!filters.maxDate) return;

		const { startDate, endDate } = calculateDateRange(range, filters.maxDate);
		const adjustedStartDate = Math.max(startDate, filters.minDate || startDate);

		setFilters((prevFilters) => ({
			...prevFilters,
			startDate: adjustedStartDate,
			endDate,
		}));
	};

	const handleSliderChange = (value: number | number[]) => {
		if (Array.isArray(value) && value.length === 2) {
			onSliderChange([value[0], value[1]]);
		}
	};

	const handleSliderAfterChange = (value: number | number[]) => {
		if (Array.isArray(value) && value.length === 2) {
			onSliderAfterChange([value[0], value[1]]);
		}
	};

	if (!filters.minDate || !filters.maxDate) {
		return null;
	}

	return (
		<div className="mb-4">
			<label
				className="block text-gray-700 mb-2 select-none"
				htmlFor="dateRange"
			>
				Date Range:
			</label>

			<div className="select-none">
				<Slider
					range
					id="dateRange"
					min={filters.minDate}
					max={filters.maxDate}
					value={sliderValues}
					onChange={handleSliderChange}
					onChangeComplete={handleSliderAfterChange}
					trackStyle={[{ backgroundColor: "#3b82f6" }]}
					handleStyle={[{ borderColor: "#3b82f6" }, { borderColor: "#3b82f6" }]}
				/>
			</div>

			<div className="flex justify-between mt-2">
				<input
					type="date"
					name="startDate"
					className="border border-gray-300 rounded-md p-2"
					value={
						filters.startDate
							? new Date(filters.startDate).toISOString().split("T")[0]
							: ""
					}
					onChange={handleDateInputChange}
				/>
				<input
					type="date"
					name="endDate"
					className="border border-gray-300 rounded-md p-2"
					value={
						filters.endDate
							? new Date(filters.endDate).toISOString().split("T")[0]
							: ""
					}
					onChange={handleDateInputChange}
				/>
			</div>

			{/* Quick Date Range Buttons */}
			<div className="flex gap-2 mt-3">
				{(["day", "week", "month"] as const).map((range) => (
					<button
						key={range}
						onClick={() => handleQuickDateRange(range)}
						className={`px-3 py-1 text-sm rounded-md transition-colors ${
							filters.startDate &&
							filters.endDate &&
							filters.minDate &&
							filters.maxDate &&
							isQuickRangeActive(
								range,
								filters.startDate,
								filters.endDate,
								filters.minDate,
								filters.maxDate,
							)
								? "bg-blue-500 text-white"
								: "bg-blue-100 text-blue-700 hover:bg-blue-200"
						}`}
					>
						Last {range.charAt(0).toUpperCase() + range.slice(1)}
					</button>
				))}
			</div>
		</div>
	);
};

export default DateRangeFilter;
