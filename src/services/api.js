// src/services/api.js
import { API_ENDPOINTS } from '../constants';

/**
 * API function to fetch transaction data from real endpoint
 * @param {string} startDate - Start date in format 'YYYY-MM-DD HH:MM:SS +ZZZZ'
 * @param {string} endDate - End date in format 'YYYY-MM-DD HH:MM:SS +ZZZZ'
 * @param {string} timeZone - Timezone string (e.g. 'Europe/Moscow')
 * @returns {Promise} - Promise that resolves with transaction data
 */
export const fetchTransactionData = (startDate, endDate, timeZone) => {
  return new Promise((resolve, reject) => {
    console.log("timeZone", timeZone)
    // Call the real API endpoint
    fetch(API_ENDPOINTS.TRANSACTIONS)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        // Parse the input date strings to Date objects for comparison
        const start = new Date(startDate.split(' ')[0]);
        const end = new Date(endDate.split(' ')[0]);
        
        // Filter the data based on date range
        // Filter the data based on date range AND timezone
        const filteredData = data?.events.filter(item => {
          // Parse the date from the item
          const itemDate = new Date(item.date);
          
          // Check if the item date is within the range (inclusive)
          const isInDateRange = itemDate >= start && itemDate <= end;
          
          // Check if timezone matches (if item has timezone field)
          // If no specific timezone filtering is needed, can use: const isMatchingTimezone = true;
          const isMatchingTimezone = item.timezone === timeZone;
          
          // Item passes filter if it's in date range AND matches timezone (if applicable)
          return isInDateRange && isMatchingTimezone;
        });
        
        console.log(`Filtered data from ${filteredData.length} records from ${data?.events.length} total`);
        resolve(filteredData);
      })
      .catch(error => {
        console.error('Error fetching transaction data:', error);
        reject(new Error('Failed to fetch transaction data'));
      });
  });
};

/**
 * API function to get available timezones
 * @returns {Promise} - Promise that resolves with timezone data
 */
export const fetchTimezones = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { value: 'Asia/Calcutta', label: 'Asia/Calcutta (GMT+5:30)' },
        { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
        { value: 'Europe/Moscow', label: 'Europe/Moscow (GMT+3)' },
        { value: 'Europe/London', label: 'Europe/London (GMT+0/+1)' },
        { value: 'America/New_York', label: 'America/New_York (GMT-5/-4)' },
        { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8/-7)' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
      ]);
    }, 300);
  });
};