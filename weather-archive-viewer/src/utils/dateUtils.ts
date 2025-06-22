export const calculateDateRange = (range: 'day' | 'week' | 'month', maxDate: number): { startDate: number; endDate: number } => {
  const now = new Date();
  const endDate = Math.min(maxDate, now.getTime());
  let startDate: number;

  switch (range) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
      break;
    default:
      throw new Error(`Unknown range: ${range}`);
  }

  return { startDate, endDate };
};

export const isQuickRangeActive = (
  range: 'day' | 'week' | 'month',
  currentStartDate: number,
  currentEndDate: number,
  minDate: number,
  maxDate: number
): boolean => {
  const now = new Date();
  const expectedEndDate = Math.min(maxDate, now.getTime());
  const { startDate: expectedStartDate } = calculateDateRange(range, maxDate);
  
  // Ensure expected start date is not before the minimum available date
  const adjustedExpectedStartDate = Math.max(expectedStartDate, minDate);

  // Check if current selection matches the expected range (with some tolerance for date precision)
  const tolerance = 24 * 60 * 60 * 1000; // 1 day tolerance
  return (
    Math.abs(currentStartDate - adjustedExpectedStartDate) < tolerance &&
    Math.abs(currentEndDate - expectedEndDate) < tolerance
  );
};