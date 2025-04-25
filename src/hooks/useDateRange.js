// src/hooks/useDateRange.js
import { useState, useCallback, useEffect } from 'react';
import { DateTime } from 'luxon';
import { DEFAULT_TIMEZONE, DEFAULT_DAYS_LOOKBACK } from '../constants';

/**
 * Custom hook for managing date range selection
 * @param {string} defaultTimeZone - Default timezone to use
 * @param {number} defaultDays - Default number of days to look back
 * @returns {object} - Date range state and handlers
 */
export const useDateRange = (defaultTimeZone = DEFAULT_TIMEZONE, defaultDays = DEFAULT_DAYS_LOOKBACK) => {
  // Initialize with empty strings that will be set in useEffect
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    timeZone: defaultTimeZone
  });

  // Set initial date range on mount
  useEffect(() => {
    // Only set the initial date range if it hasn't been set yet
    if (!dateRange.startDate || !dateRange.endDate) {
      // Create default date range 
      const now = DateTime.now().setZone(defaultTimeZone);
      const pastDate = now.minus({ days: defaultDays });
      
      // Format dates for API
      const formattedStartDate = pastDate.toFormat('yyyy-MM-dd HH:mm:ss ZZ');
      const formattedEndDate = now.toFormat('yyyy-MM-dd HH:mm:ss ZZ');
      
      // Set initial date range
      setDateRange({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        timeZone: defaultTimeZone
      });
      
      console.log('Initial date range set:', {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        timeZone: defaultTimeZone
      });
    }
  }, [defaultTimeZone, defaultDays, dateRange.startDate, dateRange.endDate]);

  // Memoized handler for date range changes
  const handleDateRangeChange = useCallback((newDateRange) => {
    console.log('handleDateRangeChange called with:', newDateRange);
    
    // Always update the state with the new date range
    setDateRange(newDateRange);
  }, []);

  return {
    dateRange,
    handleDateRangeChange
  };
};