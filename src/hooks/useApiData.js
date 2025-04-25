// src/hooks/useApiData.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for fetching and managing API data
 * @param {function} fetchFunction - API function to fetch data
 * @param {object} params - Parameters for the fetch function
 * @returns {object} - Data, loading state, error, and handlers
 */
export const useApiData = (fetchFunction, params) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'asc'
  });
  const [searchConfig, setSearchConfig] = useState({
    column: 'name',
    query: ''
  });
  
  // Use a ref to track previous params for comparison
  const prevParamsRef = useRef({});

  // Fetch data effect
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we have the required parameters
      if (!params.startDate || !params.endDate) {
        console.log('Missing date parameters, skipping API call');
        return;
      }
      
      // Check if parameters have actually changed
      const prevParams = prevParamsRef.current;
      const paramsChanged = 
        params.startDate !== prevParams.startDate ||
        params.endDate !== prevParams.endDate ||
        params.timeZone !== prevParams.timeZone;
      
      if (!paramsChanged) {
        console.log('Parameters unchanged, skipping API call');
        return;
      }
      
      console.log('Fetching data with params:', params);
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchFunction(
          params.startDate,
          params.endDate,
          params.timeZone
        );
        
        console.log('API response received:', response);
        setData(response);
        setFilteredData(response);
        setLoading(false);
        
        // Update the previous params ref
        prevParamsRef.current = { ...params };
      } catch (err) {
        console.error('API call failed:', err);
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchFunction, params]);

  // Memoized sorting handler
  const handleSort = useCallback((columnId, columns) => {
    const column = columns.find(col => col.id === columnId);
    if (!column || !column.sortable) return;
    
    setSortConfig(prevConfig => {
      let direction = 'asc';
      if (prevConfig.key === columnId && prevConfig.direction === 'asc') {
        direction = 'desc';
      }
      
      // Sort the data
      const sortedData = [...filteredData].sort((a, b) => {
        if (a[columnId] < b[columnId]) {
          return direction === 'asc' ? -1 : 1;
        }
        if (a[columnId] > b[columnId]) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      
      setFilteredData(sortedData);
      
      return { key: columnId, direction };
    });
  }, [filteredData]);

  // Memoized search handler
  const handleSearchChange = useCallback((query) => {
    setSearchConfig(prevConfig => ({
      ...prevConfig,
      query
    }));
    
    if (query.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => {
        const value = item[searchConfig.column]?.toString().toLowerCase() || '';
        return value.includes(query.toLowerCase());
      });
      setFilteredData(filtered);
    }
  }, [data, searchConfig.column]);

  // Memoized search column change handler
  const handleSearchColumnChange = useCallback((columnId) => {
    setSearchConfig({
      column: columnId,
      query: ''
    });
    setFilteredData(data);
  }, [data]);

  return {
    data,
    filteredData,
    loading,
    error,
    sortConfig,
    searchConfig,
    handleSort,
    handleSearchChange,
    handleSearchColumnChange
  };
};