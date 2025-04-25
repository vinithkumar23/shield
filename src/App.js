// src/App.js
import React, { memo, useCallback } from 'react';
import Calendar from './components/Calendar';
import TablePage from './components/TablePage';
import { useDateRange } from './hooks/useDateRange';
import './App.css';

// Memoized components for better performance
const MemoizedCalendar = memo(Calendar);
const MemoizedTablePage = memo(TablePage);

function App() {
  // Use our custom hook for date range management
  const { dateRange, handleDateRangeChange } = useDateRange('Europe/Moscow', 7);

  // Memoized callback for date range changes
  const onDateRangeChange = useCallback((newDateRange) => {
    handleDateRangeChange(newDateRange);
  }, [handleDateRangeChange]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Calendar & Table Application</h1>
      </header>
      
      <main className="app-content">
        <div className="calendar-section">
          <MemoizedCalendar onDateRangeChange={onDateRangeChange} />
        </div>
        
        <div className="table-section">
          <MemoizedTablePage dateRange={dateRange} />
        </div>
      </main>
    </div>
  );
}

export default App;