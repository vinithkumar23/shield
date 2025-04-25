// src/hooks/useTimezones.js
import { useState, useEffect } from 'react';
import { DEFAULT_TIMEZONE } from '../constants';

/**
 * Custom hook for fetching and managing timezone data
 * @param {function} fetchTimezonesFunction - API function to fetch timezones
 * @param {string} defaultTimeZone - Default timezone to select
 * @returns {object} - Timezones data and selected timezone state
 */
export const useTimezones = (fetchTimezonesFunction, defaultTimeZone = DEFAULT_TIMEZONE) => {
  const [timeZones, setTimeZones] = useState([
    { value: defaultTimeZone, label: `${defaultTimeZone} (Default)` }
  ]);
  const [selectedTimeZone, setSelectedTimeZone] = useState(timeZones[0]);
  const [loading, setLoading] = useState(false);

  // Fetch timezones on mount
  useEffect(() => {
    const loadTimeZones = async () => {
      setLoading(true);
      try {
        const zones = await fetchTimezonesFunction();
        setTimeZones(zones);
        
        // Set the default timezone if available
        const defaultTz = zones.find(tz => tz.value === defaultTimeZone);
        if (defaultTz) {
          setSelectedTimeZone(defaultTz);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch timezones:', error);
        setLoading(false);
      }
    };
    
    loadTimeZones();
  }, [fetchTimezonesFunction, defaultTimeZone]);

  return {
    timeZones,
    selectedTimeZone,
    setSelectedTimeZone,
    loading
  };
};